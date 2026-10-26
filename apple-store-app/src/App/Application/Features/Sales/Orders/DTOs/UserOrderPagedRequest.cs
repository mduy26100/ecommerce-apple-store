using Application.Wrappers;

namespace Application.Features.Sales.Orders.DTOs
{
    public class UserOrderPagedRequest : PagedRequest
    {
        public string? Status { get; set; }
    }
}
