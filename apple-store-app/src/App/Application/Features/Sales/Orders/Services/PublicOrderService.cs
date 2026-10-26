using Application.Common.Interfaces.Persistence;
using Application.Features.Sales.Carts.Services;
using Application.Features.Sales.Orders.DTOs;
using Application.Features.Sales.Orders.Helpers;
using Application.Features.Sales.Orders.Specifications;
using Application.Features.Sales.Vouchers.DTOs;
using Application.Features.Sales.Vouchers.Services;
using Application.Wrappers;
using Domain.Entities.Catalog;
using Domain.Entities.Sales;
using Domain.Enums.Sales;
using Domain.Exceptions;

namespace Application.Features.Sales.Orders.Services
{
    public class PublicOrderService : IPublicOrderService
    {
        private readonly IRepository<Order> _orderRepository;
        private readonly IRepository<OrderItem> _orderItemRepository;
        private readonly IRepository<ProductVariant> _variantRepository;
        private readonly IRepository<Voucher> _voucherRepository;
        private readonly IRepository<UserVoucher> _userVoucherRepository;
        private readonly IRepository<VoucherUsage> _voucherUsageRepository;
        private readonly IPublicVoucherService _voucherService;
        private readonly ICartService _cartService;

        public PublicOrderService(
            IRepository<Order> orderRepository,
            IRepository<OrderItem> orderItemRepository,
            IRepository<ProductVariant> variantRepository,
            IRepository<Voucher> voucherRepository,
            IRepository<UserVoucher> userVoucherRepository,
            IRepository<VoucherUsage> voucherUsageRepository,
            IPublicVoucherService voucherService,
            ICartService cartService)
        {
            _orderRepository = orderRepository;
            _orderItemRepository = orderItemRepository;
            _variantRepository = variantRepository;
            _voucherRepository = voucherRepository;
            _userVoucherRepository = userVoucherRepository;
            _voucherUsageRepository = voucherUsageRepository;
            _voucherService = voucherService;
            _cartService = cartService;
        }

        public async Task<OrderSuccessDto> CreateOrderAsync(CreateOrderRequest request, int? currentUserId, CancellationToken cancellationToken = default)
        {
            if (request.Items == null || request.Items.Count == 0)
            {
                throw new BusinessRuleException("Đơn hàng phải chứa ít nhất một sản phẩm.");
            }

            if (string.IsNullOrWhiteSpace(request.RecipientName) || request.RecipientName.Trim().Length < 2)
            {
                throw new BusinessRuleException("Vui lòng nhập họ tên người nhận hàng hợp lệ.");
            }

            if (string.IsNullOrWhiteSpace(request.RecipientPhone) || !System.Text.RegularExpressions.Regex.IsMatch(request.RecipientPhone.Trim(), @"^(0|\+84)[0-9]{9,10}$"))
            {
                throw new BusinessRuleException("Số điện thoại nhận hàng không đúng định dạng.");
            }

            if (string.IsNullOrWhiteSpace(request.RecipientEmail) || !new System.ComponentModel.DataAnnotations.EmailAddressAttribute().IsValid(request.RecipientEmail.Trim()))
            {
                throw new BusinessRuleException("Địa chỉ email nhận hóa đơn không đúng định dạng.");
            }

            if (string.IsNullOrWhiteSpace(request.ShippingAddressLine) || string.IsNullOrWhiteSpace(request.ShippingProvince))
            {
                throw new BusinessRuleException("Vui lòng nhập đầy đủ địa chỉ giao hàng.");
            }

            if (request.Items == null || request.Items.Count == 0)
            {
                throw new BusinessRuleException("Đơn hàng phải chứa ít nhất một sản phẩm.");
            }

            if (!Enum.TryParse<PaymentMethod>(request.PaymentMethod, true, out var paymentMethod))
            {
                paymentMethod = PaymentMethod.COD;
            }

            if (paymentMethod != PaymentMethod.COD)
            {
                throw new BusinessRuleException("Phương thức thanh toán trực tuyến đang trong quá trình phát triển. Vui lòng chọn Thanh toán khi nhận hàng (COD).");
            }

            var orderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}";
            decimal subtotal = 0;

            var resolvedUserId = currentUserId ?? (request.UserId.HasValue && request.UserId.Value > 0 ? request.UserId.Value : null);

            var order = new Order
            {
                OrderNumber = orderNumber,
                UserId = resolvedUserId,
                GuestId = resolvedUserId == null ? request.GuestId : null,
                Status = OrderStatus.Pending,
                PaymentMethod = paymentMethod,
                PaymentStatus = PaymentStatus.Pending,
                RecipientName = request.RecipientName.Trim(),
                RecipientPhone = request.RecipientPhone.Trim(),
                RecipientEmail = request.RecipientEmail.Trim().ToLowerInvariant(),
                ShippingAddressLine = request.ShippingAddressLine.Trim(),
                ShippingWard = request.ShippingWard?.Trim(),
                ShippingDistrict = request.ShippingDistrict?.Trim(),
                ShippingProvince = request.ShippingProvince.Trim(),
                CustomerNote = request.CustomerNote?.Trim(),
                ShippingFee = Math.Max(0, request.ShippingFee),
                PlacedAt = DateTimeOffset.UtcNow,
                StatusHistoryJson = OrderStatusHistoryHelper.AppendHistory(
                    null,
                    OrderStatus.Pending,
                    "Customer",
                    request.RecipientName.Trim(),
                    "Khách hàng đặt hàng thành công qua Website."),
            };

            foreach (var itemReq in request.Items)
            {
                if (itemReq.Quantity <= 0)
                {
                    throw new BusinessRuleException("Số lượng đặt mua cho mỗi sản phẩm phải lớn hơn 0.");
                }

                if (!itemReq.ProductVariantId.HasValue || itemReq.ProductVariantId.Value <= 0)
                {
                    throw new BusinessRuleException("Mã phân loại sản phẩm không hợp lệ.");
                }

                var variant = await _variantRepository.GetByIdAsync(itemReq.ProductVariantId.Value, cancellationToken);
                if (variant == null || !variant.IsActive)
                {
                    throw new BusinessRuleException($"Phiên bản '{itemReq.ProductName}' không tồn tại hoặc đã ngừng kinh doanh.");
                }

                if (variant.QuantityInStock < itemReq.Quantity)
                {
                    throw new BusinessRuleException($"Sản phẩm '{itemReq.ProductName}' chỉ còn {variant.QuantityInStock} máy trong kho, không đủ đáp ứng số lượng {itemReq.Quantity}.");
                }

                var verifiedUnitPrice = variant.Price;
                var verifiedCostPrice = variant.CostPrice;
                var lineTotal = verifiedUnitPrice * itemReq.Quantity;
                subtotal += lineTotal;

                variant.QuantityInStock -= itemReq.Quantity;
                await _variantRepository.UpdateAsync(variant, cancellationToken);

                order.Items.Add(new OrderItem
                {
                    ProductVariantId = variant.Id,
                    ProductName = itemReq.ProductName,
                    SKU = variant.SKU,
                    VariantName = variant.VariantName ?? itemReq.VariantName,
                    ThumbnailUrl = itemReq.ThumbnailUrl,
                    SelectedAttributesJson = itemReq.SelectedAttributesJson,
                    ColorName = itemReq.ColorName,
                    StorageName = itemReq.StorageName,
                    CostPrice = verifiedCostPrice,
                    UnitPrice = verifiedUnitPrice,
                    Quantity = itemReq.Quantity,
                    LineTotal = lineTotal,
                });
            }

            order.Subtotal = subtotal;

            Voucher? appliedVoucher = null;
            decimal discountAmount = 0;

            if (!string.IsNullOrWhiteSpace(request.VoucherCode))
            {
                var validateResponse = await _voucherService.ValidateVoucherAsync(
                    resolvedUserId,
                    new ValidateVoucherRequest
                    {
                        VoucherCode = request.VoucherCode,
                        Subtotal = subtotal,
                        GuestId = order.GuestId,
                        Phone = order.RecipientPhone,
                        Email = order.RecipientEmail
                    },
                    cancellationToken);

                if (!validateResponse.IsValid)
                {
                    throw new BusinessRuleException(validateResponse.Message ?? "Mã giảm giá không hợp lệ.");
                }

                if (validateResponse.VoucherId.HasValue)
                {
                    appliedVoucher = await _voucherRepository.GetByIdAsync(validateResponse.VoucherId.Value, cancellationToken);
                    if (appliedVoucher != null)
                    {
                        discountAmount = validateResponse.DiscountAmount;
                        order.VoucherId = appliedVoucher.Id;
                        order.VoucherCode = appliedVoucher.Code;
                        order.DiscountAmount = discountAmount;

                        appliedVoucher.UsageCount++;
                        await _voucherRepository.UpdateAsync(appliedVoucher, cancellationToken);

                        if (appliedVoucher.TargetType == VoucherTargetType.AssignedOnly && resolvedUserId.HasValue)
                        {
                            var userVouchers = await _userVoucherRepository.ListAsync(cancellationToken);
                            var userVoucher = userVouchers.FirstOrDefault(uv => uv.UserId == resolvedUserId.Value && uv.VoucherId == appliedVoucher.Id && uv.IsActive && !uv.IsDeleted);
                            if (userVoucher != null)
                            {
                                userVoucher.UsedCount++;
                                await _userVoucherRepository.UpdateAsync(userVoucher, cancellationToken);
                            }
                        }
                    }
                }
            }

            order.TotalAmount = Math.Max(0, subtotal + request.ShippingFee - discountAmount);

            await _orderRepository.AddAsync(order, cancellationToken);

            if (appliedVoucher != null)
            {
                var usage = new VoucherUsage
                {
                    VoucherId = appliedVoucher.Id,
                    OrderId = order.Id,
                    UserId = resolvedUserId,
                    GuestId = order.GuestId,
                    CustomerPhone = order.RecipientPhone,
                    CustomerEmail = order.RecipientEmail,
                    DiscountAmount = discountAmount,
                    UsedAt = DateTimeOffset.UtcNow,
                };
                await _voucherUsageRepository.AddAsync(usage, cancellationToken);
            }

            foreach (var itemReq in request.Items)
            {
                if (itemReq.ProductVariantId.HasValue)
                {
                    await _cartService.RemoveItemAsync(resolvedUserId, request.GuestId, itemReq.ProductVariantId.Value, cancellationToken);
                }
            }

            return new OrderSuccessDto
            {
                OrderId = order.Id,
                OrderNumber = order.OrderNumber,
                TotalAmount = order.TotalAmount,
                RecipientEmail = order.RecipientEmail,
                RecipientName = order.RecipientName,
                RecipientPhone = order.RecipientPhone,
                PaymentMethod = order.PaymentMethod.ToString(),
                PlacedAt = order.PlacedAt,
            };
        }

        public async Task<PagedList<OrderSummaryDto>> GetMyOrdersAsync(int userId, UserOrderPagedRequest request, CancellationToken cancellationToken = default)
        {
            var spec = new UserOrdersFilterSpec(userId, request);
            return await _orderRepository.GetPagedAsync(
                spec,
                request.PageNumber,
                request.PageSize,
                MapToSummaryDto,
                cancellationToken);
        }

        public async Task<List<OrderSummaryDto>> GetGuestRecentOrdersAsync(string guestId, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(guestId))
            {
                return new List<OrderSummaryDto>();
            }

            var orders = await _orderRepository.ListAsync(new GuestOrdersByGuestIdSpec(guestId), cancellationToken);
            return orders.Take(10).Select(MapToSummaryDto).ToList();
        }

        public async Task<OrderDetailDto> GetUserOrderDetailAsync(int orderId, int userId, CancellationToken cancellationToken = default)
        {
            var order = await _orderRepository.FirstOrDefaultAsync(new OrderByIdWithDetailsSpec(orderId), cancellationToken);
            if (order == null || order.UserId != userId)
            {
                throw new NotFoundException(nameof(Order), orderId);
            }

            return MapToDetailDto(order);
        }

        public async Task<OrderDetailDto> LookupOrderAsync(OrderLookupRequest request, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(request.OrderNumber) || string.IsNullOrWhiteSpace(request.PhoneOrEmail))
            {
                throw new BusinessRuleException("Vui lòng nhập đầy đủ mã đơn hàng và số điện thoại hoặc email tra cứu.");
            }

            var normalizedOrderNumber = request.OrderNumber.Trim().ToUpperInvariant();
            var order = await _orderRepository.FirstOrDefaultAsync(new OrderByOrderNumberSpec(normalizedOrderNumber), cancellationToken);

            if (order == null || order.UserId.HasValue)
            {
                throw new NotFoundException("Đơn hàng", request.OrderNumber);
            }

            var term = request.PhoneOrEmail.Trim().ToLowerInvariant();
            var phoneMatches = !string.IsNullOrWhiteSpace(order.RecipientPhone) && order.RecipientPhone.Trim() == request.PhoneOrEmail.Trim();
            var emailMatches = !string.IsNullOrWhiteSpace(order.RecipientEmail) && order.RecipientEmail.Trim().ToLowerInvariant() == term;

            if (!phoneMatches && !emailMatches)
            {
                throw new BusinessRuleException("Thông tin số điện thoại hoặc email không trùng khớp với đơn hàng.");
            }

            return MapToDetailDto(order);
        }

        public async Task<int> AutoMergeOrdersByEmailAsync(int userId, string email, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return 0;
            }

            var unclaimedOrders = await _orderRepository.ListAsync(new UnclaimedOrdersByEmailSpec(email), cancellationToken);
            if (unclaimedOrders == null || unclaimedOrders.Count == 0)
            {
                return 0;
            }

            int count = 0;
            foreach (var order in unclaimedOrders)
            {
                order.UserId = userId;
                await _orderRepository.UpdateAsync(order, cancellationToken);
                count++;
            }

            return count;
        }

        public async Task<int> GetUnmergedGuestOrdersCountAsync(string guestId, int currentUserId, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(guestId))
            {
                return 0;
            }

            var guestOrders = await _orderRepository.ListAsync(new GuestOrdersByGuestIdSpec(guestId), cancellationToken);
            return guestOrders.Count;
        }

        public async Task<int> MergeGuestOrdersAsync(string guestId, int userId, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(guestId))
            {
                return 0;
            }

            var guestOrders = await _orderRepository.ListAsync(new GuestOrdersByGuestIdSpec(guestId), cancellationToken);
            int count = 0;
            foreach (var order in guestOrders)
            {
                order.UserId = userId;
                await _orderRepository.UpdateAsync(order, cancellationToken);
                count++;
            }

            return count;
        }

        public async Task UpdateShippingAddressAsync(int id, UpdateOrderShippingAddressRequest request, int currentUserId, CancellationToken cancellationToken = default)
        {
            var order = await _orderRepository.FirstOrDefaultAsync(new OrderByIdWithDetailsSpec(id), cancellationToken);
            if (order == null)
            {
                throw new NotFoundException(nameof(Order), id);
            }

            if (order.UserId == null || order.UserId.Value != currentUserId)
            {
                throw new ForbiddenException("Quý khách không có quyền cập nhật thông tin đơn hàng này.");
            }

            if (order.Status != OrderStatus.Pending)
            {
                throw new BusinessRuleException("Chỉ được phép cập nhật thông tin giao hàng khi đơn hàng đang ở trạng thái 'Chờ xử lý'.");
            }

            if (order.ShippingAddressUpdateCount >= 1)
            {
                throw new BusinessRuleException("Quý khách chỉ được phép chỉnh sửa thông tin giao nhận tối đa 1 lần duy nhất cho mỗi đơn hàng.");
            }

            if (string.IsNullOrWhiteSpace(request.RecipientName))
            {
                throw new BusinessRuleException("Họ và tên người nhận không được để trống.");
            }

            if (string.IsNullOrWhiteSpace(request.RecipientPhone) || !Regex.IsMatch(request.RecipientPhone.Trim(), @"^(0[3|5|7|8|9])[0-9]{8}$"))
            {
                throw new BusinessRuleException("Số điện thoại nhận hàng không đúng định dạng Việt Nam.");
            }

            if (!string.IsNullOrWhiteSpace(request.RecipientEmail) && !new System.ComponentModel.DataAnnotations.EmailAddressAttribute().IsValid(request.RecipientEmail.Trim()))
            {
                throw new BusinessRuleException("Địa chỉ email không đúng định dạng.");
            }

            if (string.IsNullOrWhiteSpace(request.ShippingAddressLine) || string.IsNullOrWhiteSpace(request.ShippingProvince))
            {
                throw new BusinessRuleException("Vui lòng nhập đầy đủ địa chỉ giao hàng.");
            }

            order.RecipientName = request.RecipientName.Trim();
            order.RecipientPhone = request.RecipientPhone.Trim();
            order.RecipientEmail = string.IsNullOrWhiteSpace(request.RecipientEmail) ? null : request.RecipientEmail.Trim().ToLowerInvariant();
            order.ShippingAddressLine = request.ShippingAddressLine.Trim();
            order.ShippingWard = request.ShippingWard?.Trim();
            order.ShippingDistrict = request.ShippingDistrict?.Trim();
            order.ShippingProvince = request.ShippingProvince.Trim();
            order.ShippingAddressUpdateCount++;

            var updateNote = $"Khách hàng cập nhật thông tin giao nhận: {order.RecipientName} - {order.RecipientPhone} - {order.ShippingAddressLine}, {order.ShippingProvince} (Đã dùng 1/1 lần thay đổi cho phép)";
            order.StatusHistoryJson = OrderStatusHistoryHelper.AppendHistory(
                order.StatusHistoryJson,
                OrderStatus.Pending,
                "Customer",
                order.RecipientName,
                updateNote);

            await _orderRepository.UpdateAsync(order, cancellationToken);
        }

        public async Task CancelOrderAsync(int id, CancelOrderRequest request, int currentUserId, CancellationToken cancellationToken = default)
        {
            var order = await _orderRepository.FirstOrDefaultAsync(new OrderByIdWithDetailsSpec(id), cancellationToken);
            if (order == null)
            {
                throw new NotFoundException(nameof(Order), id);
            }

            if (order.UserId == null || order.UserId.Value != currentUserId)
            {
                throw new ForbiddenException("Quý khách không có quyền hủy đơn hàng này.");
            }

            if (order.Status != OrderStatus.Pending)
            {
                throw new BusinessRuleException("Chỉ đơn hàng ở trạng thái 'Chờ xử lý' mới được phép hủy trực tiếp trên hệ thống. Đối với đơn hàng đã được tiếp nhận hoặc đang vận chuyển, quý khách vui lòng liên hệ Hotline để được hỗ trợ.");
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

            if (order.VoucherId.HasValue)
            {
                var voucher = await _voucherRepository.GetByIdAsync(order.VoucherId.Value, cancellationToken);
                if (voucher != null && voucher.UsageCount > 0)
                {
                    voucher.UsageCount -= 1;
                    await _voucherRepository.UpdateAsync(voucher, cancellationToken);
                }

                if (order.UserId.HasValue)
                {
                    var userVouchers = await _userVoucherRepository.ListAsync(cancellationToken);
                    var userVoucher = userVouchers.FirstOrDefault(uv => uv.UserId == order.UserId.Value && uv.VoucherId == order.VoucherId.Value && uv.IsActive && !uv.IsDeleted);
                    if (userVoucher != null && userVoucher.UsedCount > 0)
                    {
                        userVoucher.UsedCount -= 1;
                        await _userVoucherRepository.UpdateAsync(userVoucher, cancellationToken);
                    }
                }
            }

            order.Status = OrderStatus.Cancelled;
            var reasonNote = string.IsNullOrWhiteSpace(request?.Reason) ? "Khách hàng hủy đơn" : $"Lý do hủy: {request.Reason}";
            order.CustomerNote = string.IsNullOrWhiteSpace(order.CustomerNote)
                ? $"[{reasonNote}]"
                : $"{order.CustomerNote} [{reasonNote}]";

            order.StatusHistoryJson = OrderStatusHistoryHelper.AppendHistory(
                order.StatusHistoryJson,
                OrderStatus.Cancelled,
                "Customer",
                order.RecipientName,
                reasonNote);

            await _orderRepository.UpdateAsync(order, cancellationToken);
        }

        public async Task ConfirmReceivedAsync(int id, int currentUserId, CancellationToken cancellationToken = default)
        {
            var order = await _orderRepository.FirstOrDefaultAsync(new OrderByIdWithDetailsSpec(id), cancellationToken);
            if (order == null)
            {
                throw new NotFoundException(nameof(Order), id);
            }

            if (order.UserId == null || order.UserId.Value != currentUserId)
            {
                throw new ForbiddenException("Quý khách không có quyền xác nhận đơn hàng này.");
            }

            if (order.Status != OrderStatus.Delivered)
            {
                throw new BusinessRuleException("Chỉ có thể xác nhận đã nhận hàng khi đơn hàng đang ở trạng thái 'Đã giao hàng'.");
            }

            order.Status = OrderStatus.Completed;
            if (order.PaymentMethod == PaymentMethod.COD && order.PaymentStatus != PaymentStatus.Paid)
            {
                order.PaymentStatus = PaymentStatus.Paid;
            }

            order.StatusHistoryJson = OrderStatusHistoryHelper.AppendHistory(
                order.StatusHistoryJson,
                OrderStatus.Completed,
                "Customer",
                order.RecipientName,
                "Khách hàng đã nhận được hàng và xác nhận kiện hàng nguyên vẹn.");

            await _orderRepository.UpdateAsync(order, cancellationToken);
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
                ShippingAddressUpdateCount = order.ShippingAddressUpdateCount,
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
