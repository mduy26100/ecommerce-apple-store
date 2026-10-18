using Application.Wrappers;

namespace Application.Features.Sales.Orders.DTOs
{
    public class OrderPagedRequest : PagedRequest
    {
        public string? Status { get; set; }
        public string? PaymentStatus { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }
}
