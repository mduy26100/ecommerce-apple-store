namespace Application.Features.Sales.Orders.DTOs
{
    public class OrderDetailDto
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; } = default!;
        public int? UserId { get; set; }
        public string? GuestId { get; set; }
        public string Status { get; set; } = default!;
        public string PaymentMethod { get; set; } = default!;
        public string PaymentStatus { get; set; } = default!;
        public string RecipientName { get; set; } = default!;
        public string RecipientPhone { get; set; } = default!;
        public string? RecipientEmail { get; set; }
        public string ShippingAddressLine { get; set; } = default!;
        public string? ShippingWard { get; set; }
        public string? ShippingDistrict { get; set; }
        public string ShippingProvince { get; set; } = default!;
        public string? CustomerNote { get; set; }
        public decimal Subtotal { get; set; }
        public decimal ShippingFee { get; set; }
        public string? VoucherCode { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTimeOffset PlacedAt { get; set; }
        public int ShippingAddressUpdateCount { get; set; }
        public bool CanUpdateShippingAddress => Status == "Pending" && UserId.HasValue && ShippingAddressUpdateCount == 0;
        public bool CanRepay => PaymentMethod == "VNPAY" && (PaymentStatus == "Pending" || PaymentStatus == "Failed") && Status == "Pending" && UserId.HasValue;
        public bool CanCancel => Status == "Pending" && PaymentStatus != "Paid";
        public DateTimeOffset? ExpiresAt => null;
        public string? StatusHistoryJson { get; set; }
        public List<OrderStatusHistoryItemDto> StatusHistory { get; set; } = new();
        public List<OrderItemDto> Items { get; set; } = new();
    }
}
