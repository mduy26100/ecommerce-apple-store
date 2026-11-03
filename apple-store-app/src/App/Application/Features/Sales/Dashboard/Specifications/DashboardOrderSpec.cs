using Domain.Entities.Sales;
using Domain.Enums.Sales;

namespace Application.Features.Sales.Dashboard.Specifications
{
    public sealed class DashboardOrderSpec : Specification<Order>
    {
        public DashboardOrderSpec(DateTimeOffset fromDate, DateTimeOffset toDate, string? channelScope = null)
        {
            Query.AsNoTracking()
                 .Include(o => o.Items)
                 .Where(o => o.PlacedAt >= fromDate && o.PlacedAt <= toDate);

            if (string.Equals(channelScope, "online", StringComparison.OrdinalIgnoreCase))
            {
                Query.Where(o => o.PaymentMethod != PaymentMethod.COD);
            }
            else if (string.Equals(channelScope, "cod", StringComparison.OrdinalIgnoreCase))
            {
                Query.Where(o => o.PaymentMethod == PaymentMethod.COD);
            }

            Query.OrderByDescending(o => o.PlacedAt);
        }
    }
}

