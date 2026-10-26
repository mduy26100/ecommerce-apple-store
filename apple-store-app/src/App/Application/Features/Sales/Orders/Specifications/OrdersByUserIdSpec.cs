using Domain.Entities.Sales;

namespace Application.Features.Sales.Orders.Specifications
{
    public sealed class OrdersByUserIdSpec : Specification<Order>
    {
        public OrdersByUserIdSpec(int userId)
        {
            Query.Where(o => o.UserId == userId)
                 .Include(o => o.Items)
                 .OrderByDescending(o => o.PlacedAt);
        }
    }
}
