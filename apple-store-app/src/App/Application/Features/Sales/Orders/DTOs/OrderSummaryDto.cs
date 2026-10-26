namespace Application.Features.Sales.Orders.DTOs
{
    public class OrderSummaryDto
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
        public string ShippingProvince { get; set; } = default!;
        public decimal Subtotal { get; set; }
        public decimal ShippingFee { get; set; }
        public string? VoucherCode { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public int TotalItems { get; set; }
        public DateTimeOffset PlacedAt { get; set; }
        public bool CanRepay => PaymentMethod == "VNPAY" && PaymentStatus == "Pending" && Status == "Pending" && UserId.HasValue && DateTimeOffset.UtcNow <= PlacedAt.AddMinutes(15);
        public DateTimeOffset? ExpiresAt => PaymentMethod == "VNPAY" && PaymentStatus == "Pending" && Status == "Pending" ? PlacedAt.AddMinutes(15) : null;
    }
}
