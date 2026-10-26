using Domain.Entities.Sales;

namespace Application.Features.Sales.Carts.Specifications
{
    public sealed class CartByUserIdSpec : Specification<Cart>
    {
        public CartByUserIdSpec(int userId)
        {
            Query.Where(c => c.UserId == userId)
                 .Include(c => c.Items);
        }
    }
}
