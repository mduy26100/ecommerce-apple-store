using Application.Features.Sales.Orders.DTOs;
using Domain.Entities.Sales;
using Domain.Enums.Sales;

namespace Application.Features.Sales.Orders.Specifications
{
    public sealed class UserOrdersFilterSpec : Specification<Order>
    {
        public UserOrdersFilterSpec(int userId, UserOrderPagedRequest request)
        {
            Query.AsNoTracking()
                 .Where(o => o.UserId == userId)
                 .Include(o => o.Items);

            if (!string.IsNullOrWhiteSpace(request.Status) && Enum.TryParse<OrderStatus>(request.Status, true, out var status))
            {
                if (status == OrderStatus.Shipping)
                {
                    Query.Where(o => o.Status == OrderStatus.Shipping || o.Status == OrderStatus.Processing);
                }
                else
                {
                    Query.Where(o => o.Status == status);
                }
            }

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var search = request.Search.Trim().ToLower();
                Query.Where(o => o.OrderNumber.ToLower().Contains(search)
                    || o.RecipientName.ToLower().Contains(search)
                    || o.RecipientPhone.ToLower().Contains(search)
                    || (o.RecipientEmail != null && o.RecipientEmail.ToLower().Contains(search)));
            }

            Query.OrderByDescending(o => o.PlacedAt);
        }
    }
}
