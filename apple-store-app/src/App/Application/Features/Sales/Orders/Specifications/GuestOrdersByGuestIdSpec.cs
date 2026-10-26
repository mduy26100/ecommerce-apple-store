using Domain.Entities.Sales;

namespace Application.Features.Sales.Orders.Specifications
{
    public sealed class GuestOrdersByGuestIdSpec : Specification<Order>
    {
        public GuestOrdersByGuestIdSpec(string guestId)
        {
            Query.Where(o => o.GuestId == guestId && o.UserId == null)
                 .Include(o => o.Items)
                 .OrderByDescending(o => o.PlacedAt);
        }
    }
}
