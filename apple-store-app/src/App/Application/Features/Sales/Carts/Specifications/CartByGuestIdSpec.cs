using Domain.Entities.Sales;

namespace Application.Features.Sales.Carts.Specifications
{
    public sealed class CartByGuestIdSpec : Specification<Cart>
    {
        public CartByGuestIdSpec(string guestId)
        {
            Query.Where(c => c.GuestId == guestId)
                 .Include(c => c.Items);
        }
    }
}
