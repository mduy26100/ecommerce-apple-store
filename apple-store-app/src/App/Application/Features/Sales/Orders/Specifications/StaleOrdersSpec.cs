using Domain.Entities.Sales;
using Domain.Enums.Sales;

namespace Application.Features.Sales.Orders.Specifications
{
    public sealed class StaleOrdersSpec : Specification<Order>
    {
        public StaleOrdersSpec(DateTimeOffset onlineThreshold, DateTimeOffset codThreshold, int batchSize)
        {
            Query.Where(o => o.Status == OrderStatus.Pending &&
                             o.PaymentStatus != PaymentStatus.Paid &&
                             ((o.PaymentMethod != PaymentMethod.COD && o.PlacedAt <= onlineThreshold) ||
                              (o.PaymentMethod == PaymentMethod.COD && o.PlacedAt <= codThreshold)))
                 .Include(o => o.Items)
                 .OrderBy(o => o.PlacedAt)
                 .Take(batchSize);
        }
    }
}

