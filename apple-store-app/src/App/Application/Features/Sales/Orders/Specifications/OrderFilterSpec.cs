using Application.Features.Sales.Orders.DTOs;
using Domain.Entities.Sales;

namespace Application.Features.Sales.Orders.Specifications
{
    public sealed class OrderFilterSpec : Specification<Order>
    {
        public OrderFilterSpec(OrderPagedRequest request)
        {
            Query.AsNoTracking()
                 .Include(o => o.Items);

            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                Query.Where(o => o.Status.ToLower() == request.Status.Trim().ToLower());
            }

            if (!string.IsNullOrWhiteSpace(request.PaymentStatus))
            {
                Query.Where(o => o.PaymentStatus.ToLower() == request.PaymentStatus.Trim().ToLower());
            }

            if (request.FromDate.HasValue)
            {
                Query.Where(o => o.PlacedAt >= request.FromDate.Value);
            }

            if (request.ToDate.HasValue)
            {
                Query.Where(o => o.PlacedAt <= request.ToDate.Value);
            }

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var search = request.Search.Trim().ToLower();
                Query.Where(o => o.OrderNumber.ToLower().Contains(search)
                    || o.RecipientName.ToLower().Contains(search)
                    || o.RecipientPhone.ToLower().Contains(search));
            }

            Query.OrderByDescending(o => o.PlacedAt);
        }
    }
}
