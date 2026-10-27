using Application.Common.Interfaces.Persistence;
using Application.Features.Sales.Orders.DTOs;
using Application.Features.Sales.Orders.Helpers;
using Application.Features.Sales.Orders.Specifications;
using Application.Wrappers;
using Domain.Entities.Catalog;
using Domain.Entities.Sales;
using Domain.Enums.Sales;
using Domain.Exceptions;

namespace Application.Features.Sales.Orders.Services
{
    public class OrderService : IOrderService
    {
        private readonly IRepository<Order> _orderRepository;
        private readonly IRepository<OrderItem> _orderItemRepository;
        private readonly IRepository<ProductVariant> _variantRepository;
        private readonly IAppDbContext _appDbContext;

        public OrderService(
            IRepository<Order> orderRepository,
            IRepository<OrderItem> orderItemRepository,
            IRepository<ProductVariant> variantRepository,
            IAppDbContext appDbContext)
        {
            _orderRepository = orderRepository;
            _orderItemRepository = orderItemRepository;
            _variantRepository = variantRepository;
            _appDbContext = appDbContext;
        }

        public async Task<PagedList<OrderSummaryDto>> GetPagedAsync(OrderPagedRequest request, CancellationToken cancellationToken = default)
        {
            var spec = new OrderFilterSpec(request);

            return await _orderRepository.GetPagedAsync(
                spec,
                request.PageNumber,
                request.PageSize,
                MapToSummaryDto,
                cancellationToken);
        }

        public async Task<OrderDetailDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var order = await _orderRepository.FirstOrDefaultAsync(new OrderByIdWithDetailsSpec(id), cancellationToken);
            if (order == null)
            {
                throw new NotFoundException(nameof(Order), id);
            }

            return MapToDetailDto(order);
        }

        public async Task<OrderDetailDto> GetByOrderNumberAsync(string orderNumber, CancellationToken cancellationToken = default)
        {
            var order = await _orderRepository.FirstOrDefaultAsync(new OrderByOrderNumberSpec(orderNumber), cancellationToken);
            if (order == null)
            {
                throw new NotFoundException(nameof(Order), orderNumber);
            }

            return MapToDetailDto(order);
        }

        public async Task<int> CreateAsync(CreateOrderRequest request, CancellationToken cancellationToken = default)
        {
            if (request.Items == null || request.Items.Count == 0)
            {
                throw new BusinessRuleException("Đơn hàng phải chứa ít nhất một sản phẩm");
            }

            var orderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
            decimal subtotal = 0;

            var paymentMethod = Enum.TryParse<PaymentMethod>(request.PaymentMethod, true, out var pm)
                ? pm
                : PaymentMethod.COD;

            var order = new Order
            {
                OrderNumber = orderNumber,
                UserId = request.UserId.HasValue && request.UserId.Value > 0 ? request.UserId.Value : null,
                GuestId = request.GuestId,
                Status = OrderStatus.Pending,
                PaymentMethod = paymentMethod,
                PaymentStatus = PaymentStatus.Pending,
                RecipientName = request.RecipientName,
                RecipientPhone = request.RecipientPhone,
                RecipientEmail = request.RecipientEmail,
                ShippingAddressLine = request.ShippingAddressLine,
                ShippingWard = request.ShippingWard,
                ShippingDistrict = request.ShippingDistrict,
                ShippingProvince = request.ShippingProvince,
                CustomerNote = request.CustomerNote,
                ShippingFee = request.ShippingFee,
                VoucherCode = request.VoucherCode,
                PlacedAt = DateTimeOffset.UtcNow,
            };

            await using var transaction = await _appDbContext.BeginTransactionAsync(cancellationToken);
            try
            {
                foreach (var itemReq in request.Items)
                {
                    decimal costPrice = 0;
                    if (itemReq.ProductVariantId.HasValue)
                    {
                        var variant = await _variantRepository.GetByIdAsync(itemReq.ProductVariantId.Value, cancellationToken);
                        if (variant == null || !variant.IsActive)
                        {
                            throw new BusinessRuleException($"Phiên bản '{itemReq.ProductName}' không tồn tại hoặc đã ngừng kinh doanh");
                        }
                        if (variant.QuantityInStock < itemReq.Quantity)
                        {
                            throw new BusinessRuleException($"Số lượng tồn kho cho '{itemReq.ProductName}' không đủ (còn {variant.QuantityInStock})");
                        }
                        costPrice = variant.CostPrice;
                        variant.QuantityInStock -= itemReq.Quantity;
                        await _variantRepository.UpdateAsync(variant, cancellationToken);
                    }

                    var lineTotal = itemReq.UnitPrice * itemReq.Quantity;
                    subtotal += lineTotal;

                    order.Items.Add(new OrderItem
                    {
                        ProductVariantId = itemReq.ProductVariantId,
                        ProductName = itemReq.ProductName,
                        SKU = itemReq.SKU,
                        VariantName = itemReq.VariantName,
                        ThumbnailUrl = itemReq.ThumbnailUrl,
                        SelectedAttributesJson = itemReq.SelectedAttributesJson,
                        ColorName = itemReq.ColorName,
                        StorageName = itemReq.StorageName,
                        CostPrice = costPrice,
                        UnitPrice = itemReq.UnitPrice,
                        Quantity = itemReq.Quantity,
                        LineTotal = lineTotal,
                    });
                }

                order.Subtotal = subtotal;
                order.TotalAmount = subtotal + request.ShippingFee - order.DiscountAmount;

                await _orderRepository.AddAsync(order, cancellationToken);
                await transaction.CommitAsync(cancellationToken);
                return order.Id;
            }
            catch
            {
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }
        }

        public async Task UpdateStatusAsync(int id, UpdateOrderStatusRequest request, CancellationToken cancellationToken = default)
        {
            var order = await _orderRepository.FirstOrDefaultAsync(new OrderByIdWithDetailsSpec(id), cancellationToken);
            if (order == null)
            {
                throw new NotFoundException(nameof(Order), id);
            }

            var isTransitioningToCancelled = !string.IsNullOrWhiteSpace(request.Status)
                && Enum.TryParse<OrderStatus>(request.Status, true, out var newStatus)
                && newStatus == OrderStatus.Cancelled
                && order.Status != OrderStatus.Cancelled;

            if (isTransitioningToCancelled && order.PaymentStatus == PaymentStatus.Paid)
            {
                throw new BusinessRuleException("Đơn hàng đã được thanh toán thành công, không thể chuyển sang trạng thái Đã hủy. Vui lòng thực hiện quy trình hoàn tiền.");
            }

            await using var transaction = await _appDbContext.BeginTransactionAsync(cancellationToken);
            try
            {
                if (isTransitioningToCancelled)
                {
                    foreach (var item in order.Items)
                    {
                        if (item.ProductVariantId.HasValue)
                        {
                            var variant = await _variantRepository.GetByIdAsync(item.ProductVariantId.Value, cancellationToken);
                            if (variant != null)
                            {
                                variant.QuantityInStock += item.Quantity;
                                await _variantRepository.UpdateAsync(variant, cancellationToken);
                            }
                        }
                    }
                }

                if (!string.IsNullOrWhiteSpace(request.Status) && Enum.TryParse<OrderStatus>(request.Status, true, out var status))
                {
                    order.Status = status;
                    order.StatusHistoryJson = OrderStatusHistoryHelper.AppendHistory(
                        order.StatusHistoryJson,
                        status,
                        "Manager",
                        "Quản trị viên",
                        request.Note ?? $"Cập nhật trạng thái sang {OrderStatusHistoryHelper.GetStatusDisplayName(status)}");
                }

                if (!string.IsNullOrWhiteSpace(request.PaymentStatus) && Enum.TryParse<PaymentStatus>(request.PaymentStatus, true, out var paymentStatus))
                {
                    order.PaymentStatus = paymentStatus;
                }

                await _orderRepository.UpdateAsync(order, cancellationToken);
                await transaction.CommitAsync(cancellationToken);
            }
            catch
            {
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }
        }

        public async Task CancelOrderAsync(int id, CancelOrderRequest request, CancellationToken cancellationToken = default)
        {
            var order = await _orderRepository.FirstOrDefaultAsync(new OrderByIdWithDetailsSpec(id), cancellationToken);
            if (order == null)
            {
                throw new NotFoundException(nameof(Order), id);
            }

            if (order.Status == OrderStatus.Cancelled)
            {
                return;
            }

            if (order.PaymentStatus == PaymentStatus.Paid)
            {
                throw new BusinessRuleException("Đơn hàng đã được thanh toán thành công, không thể hủy trực tiếp. Vui lòng thực hiện quy trình hoàn tiền.");
            }

            await using var transaction = await _appDbContext.BeginTransactionAsync(cancellationToken);
            try
            {
                foreach (var item in order.Items)
                {
                    if (item.ProductVariantId.HasValue)
                    {
                        var variant = await _variantRepository.GetByIdAsync(item.ProductVariantId.Value, cancellationToken);
                        if (variant != null)
                        {
                            variant.QuantityInStock += item.Quantity;
                            await _variantRepository.UpdateAsync(variant, cancellationToken);
                        }
                    }
                }

                order.Status = OrderStatus.Cancelled;
                var reasonNote = string.IsNullOrWhiteSpace(request?.Reason)
                    ? "Đơn hàng bị hủy bởi ban quản trị"
                    : $"Lý do hủy: {request.Reason}";
                if (!string.IsNullOrWhiteSpace(request?.Reason))
                {
                    order.CustomerNote = string.IsNullOrWhiteSpace(order.CustomerNote)
                        ? $"[{reasonNote}]"
                        : $"{order.CustomerNote} [{reasonNote}]";
                }

                order.StatusHistoryJson = OrderStatusHistoryHelper.AppendHistory(
                    order.StatusHistoryJson,
                    OrderStatus.Cancelled,
                    "Manager",
                    "Quản trị viên",
                    reasonNote);

                await _orderRepository.UpdateAsync(order, cancellationToken);
                await transaction.CommitAsync(cancellationToken);
            }
            catch
            {
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }
        }

        private static OrderSummaryDto MapToSummaryDto(Order order)
        {
            return new OrderSummaryDto
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber,
                UserId = order.UserId,
                GuestId = order.GuestId,
                Status = order.Status.ToString(),
                PaymentMethod = order.PaymentMethod.ToString(),
                PaymentStatus = order.PaymentStatus.ToString(),
                RecipientName = order.RecipientName,
                RecipientPhone = order.RecipientPhone,
                RecipientEmail = order.RecipientEmail,
                ShippingProvince = order.ShippingProvince,
                Subtotal = order.Subtotal,
                ShippingFee = order.ShippingFee,
                VoucherCode = order.VoucherCode,
                DiscountAmount = order.DiscountAmount,
                TotalAmount = order.TotalAmount,
                TotalItems = order.Items?.Count ?? 0,
                PlacedAt = order.PlacedAt,
            };
        }

        private static OrderDetailDto MapToDetailDto(Order order)
        {
            return new OrderDetailDto
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber,
                UserId = order.UserId,
                GuestId = order.GuestId,
                Status = order.Status.ToString(),
                PaymentMethod = order.PaymentMethod.ToString(),
                PaymentStatus = order.PaymentStatus.ToString(),
                RecipientName = order.RecipientName,
                RecipientPhone = order.RecipientPhone,
                RecipientEmail = order.RecipientEmail,
                ShippingAddressLine = order.ShippingAddressLine,
                ShippingWard = order.ShippingWard,
                ShippingDistrict = order.ShippingDistrict,
                ShippingProvince = order.ShippingProvince,
                CustomerNote = order.CustomerNote,
                Subtotal = order.Subtotal,
                ShippingFee = order.ShippingFee,
                VoucherCode = order.VoucherCode,
                DiscountAmount = order.DiscountAmount,
                TotalAmount = order.TotalAmount,
                PlacedAt = order.PlacedAt,
                StatusHistoryJson = order.StatusHistoryJson,
                StatusHistory = OrderStatusHistoryHelper.ParseHistory(order.StatusHistoryJson),
                Items = order.Items.Select(i => new OrderItemDto
                {
                    Id = i.Id,
                    OrderId = i.OrderId,
                    ProductVariantId = i.ProductVariantId,
                    ProductName = i.ProductName,
                    SKU = i.SKU,
                    VariantName = i.VariantName,
                    ThumbnailUrl = i.ThumbnailUrl,
                    SelectedAttributesJson = i.SelectedAttributesJson,
                    ColorName = i.ColorName,
                    StorageName = i.StorageName,
                    CostPrice = i.CostPrice,
                    UnitPrice = i.UnitPrice,
                    Quantity = i.Quantity,
                    LineTotal = i.LineTotal,
                }).ToList(),
            };
        }
    }
}
