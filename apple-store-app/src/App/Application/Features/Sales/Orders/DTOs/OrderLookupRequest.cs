namespace Application.Features.Sales.Orders.DTOs
{
    public class OrderLookupRequest
    {
        public string OrderNumber { get; set; } = default!;
        public string PhoneOrEmail { get; set; } = default!;
    }
}
