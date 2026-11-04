using Application.Common.Interfaces.Persistence;
using Application.Features.Sales.Orders.Helpers;
using Application.Features.Sales.Orders.Jobs;
using Application.Features.Sales.Orders.Specifications;
using Domain.Entities.Sales;
using Domain.Enums.Sales;
using Infrastructure.Persistence;

namespace Infrastructure.Jobs
{
    public class StaleOrderCleanupJob : IStaleOrderCleanupJob
    {
        private readonly AppDbContext _dbContext;
        private readonly IRepository<Order> _orderRepository;
        private readonly IConfiguration _configuration;
        private readonly ILogger<StaleOrderCleanupJob> _logger;

        public StaleOrderCleanupJob(
            AppDbContext dbContext,
            IRepository<Order> orderRepository,
            IConfiguration configuration,
            ILogger<StaleOrderCleanupJob> logger)
        {
            _dbContext = dbContext;
            _orderRepository = orderRepository;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<int> ProcessStaleOrdersAsync(CancellationToken cancellationToken = default)
        {
            var onlineTimeoutHours = _configuration.GetValue<int>("BackgroundJobs:StaleOrderCleanup:OnlinePaymentTimeoutHours", 3);
            var codTimeoutHours = _configuration.GetValue<int>("BackgroundJobs:StaleOrderCleanup:CodPendingTimeoutHours", 24);
            var batchSize = _configuration.GetValue<int>("BackgroundJobs:StaleOrderCleanup:BatchSize", 50);

            var onlineThreshold = DateTimeOffset.UtcNow.AddHours(-onlineTimeoutHours);
            var codThreshold = DateTimeOffset.UtcNow.AddHours(-codTimeoutHours);

            var spec = new StaleOrdersSpec(onlineThreshold, codThreshold, batchSize);
            var staleOrders = await _orderRepository.ListAsync(spec, cancellationToken);

            if (staleOrders.Count == 0)
            {
                return 0;
            }

            var cancelledCount = 0;

            foreach (var order in staleOrders)
            {
                await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);
                try
                {
                    foreach (var item in order.Items)
                    {
                        if (item.ProductVariantId.HasValue && item.Quantity > 0)
                        {
                            var variantId = item.ProductVariantId.Value;
                            var quantity = item.Quantity;
                            await _dbContext.Database.ExecuteSqlInterpolatedAsync(
                                $"UPDATE [catalog].[ProductVariants] SET [QuantityInStock] = [QuantityInStock] + {quantity} WHERE [Id] = {variantId};",
                                cancellationToken);
                        }
                    }

                    if (order.VoucherId.HasValue)
                    {
                        var voucherId = order.VoucherId.Value;
                        await _dbContext.Database.ExecuteSqlInterpolatedAsync(
                            $"UPDATE [sales].[Vouchers] SET [UsageCount] = CASE WHEN [UsageCount] > 0 THEN [UsageCount] - 1 ELSE 0 END WHERE [Id] = {voucherId};",
                            cancellationToken);

                        if (order.UserId.HasValue)
                        {
                            var userId = order.UserId.Value;
                            await _dbContext.Database.ExecuteSqlInterpolatedAsync(
                                $"UPDATE [sales].[UserVouchers] SET [UsedCount] = CASE WHEN [UsedCount] > 0 THEN [UsedCount] - 1 ELSE 0 END WHERE [UserId] = {userId} AND [VoucherId] = {voucherId};",
                                cancellationToken);
                        }
                    }

                    order.Status = OrderStatus.Cancelled;
                    if (order.PaymentStatus == PaymentStatus.Pending)
                    {
                        order.PaymentStatus = PaymentStatus.Failed;
                    }

                    var cancellationNote = "Đơn hàng tự động hủy do quá hạn thanh toán. Đã hoàn trả tồn kho sản phẩm.";
                    order.CustomerNote = string.IsNullOrWhiteSpace(order.CustomerNote)
                        ? $"[{cancellationNote}]"
                        : $"{order.CustomerNote} [{cancellationNote}]";

                    order.StatusHistoryJson = OrderStatusHistoryHelper.AppendHistory(
                        order.StatusHistoryJson,
                        OrderStatus.Cancelled,
                        "SystemJob",
                        "Background Service",
                        cancellationNote);

                    await _orderRepository.UpdateAsync(order, cancellationToken);
                    await transaction.CommitAsync(cancellationToken);
                    cancelledCount++;
                    _logger.LogInformation("Cancelled stale order #{OrderNumber} (Id: {OrderId}) and restored stock.", order.OrderNumber, order.Id);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync(cancellationToken);
                    _logger.LogError(ex, "Failed to cancel stale order #{OrderNumber} (Id: {OrderId}).", order.OrderNumber, order.Id);
                }
            }

            return cancelledCount;
        }
    }
}

