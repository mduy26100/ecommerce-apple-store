using Application.Common.Interfaces.Persistence;
using Application.Features.Sales.Orders.DTOs;
using Application.Features.Sales.Orders.Specifications;
using Application.Wrappers;
using Domain.Entities.Catalog;
using Domain.Entities.Sales;
using Domain.Exceptions;

namespace Application.Features.Sales.Orders.Services
{
    public class OrderService : IOrderService
    {
        private readonly IRepository<Order> _orderRepository;
        private readonly IRepository<OrderItem> _orderItemRepository;
        private readonly IRepository<ProductVariant> _variantRepository;

        public OrderService(
            IRepository<Order> orderRepository,
            IRepository<OrderItem> orderItemRepository,
            IRepository<ProductVariant> variantRepository)
        {
            _orderRepository = orderRepository;
            _orderItemRepository = orderItemRepository;
            _variantRepository = variantRepository;
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

            var order = new Order
            {
                OrderNumber = orderNumber,
                UserId = request.UserId <= 0 ? 1 : request.UserId,
                Status = "Pending",
                PaymentMethod = request.PaymentMethod,
                PaymentStatus = "Pending",
                RecipientName = request.RecipientName,
                RecipientPhone = request.RecipientPhone,
                ShippingAddressLine = request.ShippingAddressLine,
                ShippingWard = request.ShippingWard,
                ShippingDistrict = request.ShippingDistrict,
                ShippingProvince = request.ShippingProvince,
                CustomerNote = request.CustomerNote,
                ShippingFee = request.ShippingFee,
                PlacedAt = DateTime.UtcNow,
            };

            foreach (var itemReq in request.Items)
            {
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
                    ColorName = itemReq.ColorName,
                    StorageName = itemReq.StorageName,
                    UnitPrice = itemReq.UnitPrice,
                    Quantity = itemReq.Quantity,
                    LineTotal = lineTotal,
                });
            }

            order.Subtotal = subtotal;
            order.TotalAmount = subtotal + request.ShippingFee;

            await _orderRepository.AddAsync(order, cancellationToken);
            return order.Id;
        }

        public async Task UpdateStatusAsync(int id, UpdateOrderStatusRequest request, CancellationToken cancellationToken = default)
        {
            var order = await _orderRepository.GetByIdAsync(id, cancellationToken);
            if (order == null)
            {
                throw new NotFoundException(nameof(Order), id);
            }

            order.Status = request.Status;
            if (!string.IsNullOrWhiteSpace(request.PaymentStatus))
            {
                order.PaymentStatus = request.PaymentStatus;
            }

            await _orderRepository.UpdateAsync(order, cancellationToken);
        }

        public async Task CancelOrderAsync(int id, CancelOrderRequest request, CancellationToken cancellationToken = default)
        {
            var order = await _orderRepository.FirstOrDefaultAsync(new OrderByIdWithDetailsSpec(id), cancellationToken);
            if (order == null)
            {
                throw new NotFoundException(nameof(Order), id);
            }

            if (order.Status == "Cancelled")
            {
                return;
            }

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

            order.Status = "Cancelled";
            if (!string.IsNullOrWhiteSpace(request?.Reason))
            {
                order.CustomerNote = string.IsNullOrWhiteSpace(order.CustomerNote)
                    ? $"[Lý do hủy: {request.Reason}]"
                    : $"{order.CustomerNote} [Lý do hủy: {request.Reason}]";
            }

            await _orderRepository.UpdateAsync(order, cancellationToken);
        }

        private static OrderSummaryDto MapToSummaryDto(Order order)
        {
            return new OrderSummaryDto
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber,
                UserId = order.UserId,
                Status = order.Status,
                PaymentMethod = order.PaymentMethod,
                PaymentStatus = order.PaymentStatus,
                RecipientName = order.RecipientName,
                RecipientPhone = order.RecipientPhone,
                ShippingProvince = order.ShippingProvince,
                Subtotal = order.Subtotal,
                ShippingFee = order.ShippingFee,
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
                Status = order.Status,
                PaymentMethod = order.PaymentMethod,
                PaymentStatus = order.PaymentStatus,
                RecipientName = order.RecipientName,
                RecipientPhone = order.RecipientPhone,
                ShippingAddressLine = order.ShippingAddressLine,
                ShippingWard = order.ShippingWard,
                ShippingDistrict = order.ShippingDistrict,
                ShippingProvince = order.ShippingProvince,
                CustomerNote = order.CustomerNote,
                Subtotal = order.Subtotal,
                ShippingFee = order.ShippingFee,
                TotalAmount = order.TotalAmount,
                PlacedAt = order.PlacedAt,
                Items = order.Items.Select(i => new OrderItemDto
                {
                    Id = i.Id,
                    OrderId = i.OrderId,
                    ProductVariantId = i.ProductVariantId,
                    ProductName = i.ProductName,
                    SKU = i.SKU,
                    ColorName = i.ColorName,
                    StorageName = i.StorageName,
                    UnitPrice = i.UnitPrice,
                    Quantity = i.Quantity,
                    LineTotal = i.LineTotal,
                }).ToList(),
            };
        }
    }
}
