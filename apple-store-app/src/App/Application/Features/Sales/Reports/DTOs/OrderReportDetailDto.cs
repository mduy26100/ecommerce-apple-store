namespace Application.Features.Sales.Reports.DTOs
{
    public class OrderReportDetailDto
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; } = default!;
        public int? UserId { get; set; }
        public string? GuestId { get; set; }
        public string RecipientName { get; set; } = default!;
        public string RecipientPhone { get; set; } = default!;
        public string? RecipientEmail { get; set; }
        public string CustomerType { get; set; } = default!;
        public string ShippingProvince { get; set; } = default!;
        public string ShippingAddressLine { get; set; } = default!;
        public string Status { get; set; } = default!;
        public string StatusName { get; set; } = default!;
        public string PaymentStatus { get; set; } = default!;
        public string PaymentStatusName { get; set; } = default!;
        public string PaymentMethod { get; set; } = default!;
        public string PaymentMethodName { get; set; } = default!;
        public int TotalItems { get; set; }
        public decimal Subtotal { get; set; }
        public decimal DiscountAmount { get; set; }
        public string? VoucherCode { get; set; }
        public decimal ShippingFee { get; set; }
        public decimal VatAmount { get; set; } = 0;
        public decimal TotalAmount { get; set; }
        public DateTimeOffset PlacedAt { get; set; }
        public DateTimeOffset? CompletedAt { get; set; }
        public List<OrderReportItemDto> Items { get; set; } = new();
    }
}

