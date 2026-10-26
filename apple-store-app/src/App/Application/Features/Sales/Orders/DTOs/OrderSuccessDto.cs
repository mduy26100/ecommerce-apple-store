namespace Application.Features.Sales.Orders.DTOs
{
    public class OrderSuccessDto
    {
        public int OrderId { get; set; }
        public string OrderNumber { get; set; } = default!;
        public decimal TotalAmount { get; set; }
        public string RecipientEmail { get; set; } = default!;
        public string RecipientName { get; set; } = default!;
        public string RecipientPhone { get; set; } = default!;
        public string PaymentMethod { get; set; } = default!;
        public DateTimeOffset PlacedAt { get; set; }
    }
}
