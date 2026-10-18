namespace Application.Features.Sales.Orders.DTOs
{
    public class OrderDetailDto
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; } = default!;
        public int UserId { get; set; }
        public string Status { get; set; } = default!;
        public string PaymentMethod { get; set; } = default!;
        public string PaymentStatus { get; set; } = default!;
        public string RecipientName { get; set; } = default!;
        public string RecipientPhone { get; set; } = default!;
        public string ShippingAddressLine { get; set; } = default!;
        public string? ShippingWard { get; set; }
        public string? ShippingDistrict { get; set; }
        public string ShippingProvince { get; set; } = default!;
        public string? CustomerNote { get; set; }
        public decimal Subtotal { get; set; }
        public decimal ShippingFee { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime PlacedAt { get; set; }
        public List<OrderItemDto> Items { get; set; } = new();
    }
}
