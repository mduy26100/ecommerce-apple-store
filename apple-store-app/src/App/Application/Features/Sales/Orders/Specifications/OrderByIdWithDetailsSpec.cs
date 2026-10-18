using Domain.Entities.Sales;

namespace Application.Features.Sales.Orders.Specifications
{
    public sealed class OrderByIdWithDetailsSpec : Specification<Order>
    {
        public OrderByIdWithDetailsSpec(int id)
        {
            Query.Where(o => o.Id == id)
                 .Include(o => o.Items);
        }
    }
}
