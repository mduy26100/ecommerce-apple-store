using Domain.Entities.Sales;

namespace Application.Features.Sales.Orders.Specifications
{
    public sealed class OrderByOrderNumberSpec : Specification<Order>
    {
        public OrderByOrderNumberSpec(string orderNumber)
        {
            Query.Where(o => o.OrderNumber == orderNumber)
                 .Include(o => o.Items);
        }
    }
}
