namespace Application.Features.Sales.Orders.DTOs
{
    public class UpdateOrderStatusRequest
    {
        public string Status { get; set; } = default!;
        public string? PaymentStatus { get; set; }
    }
}
