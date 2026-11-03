using Application.Features.Sales.Reports.DTOs;
using Domain.Entities.Sales;
using Domain.Enums.Sales;

namespace Application.Features.Sales.Reports.Specifications
{
    public sealed class OrderReportFilterSpec : Specification<Order>
    {
        public OrderReportFilterSpec(OrderReportFilterRequest request)
        {
            Query.AsNoTracking()
                 .Include(o => o.Items);

            var isCompletedCriteria = string.Equals(request.DateCriteria, "completed", StringComparison.OrdinalIgnoreCase);

            if (request.FromDate.HasValue)
            {
                if (isCompletedCriteria)
                {
                    Query.Where(o => (o.LastModifiedOn ?? o.PlacedAt) >= request.FromDate.Value);
                }
                else
                {
                    Query.Where(o => o.PlacedAt >= request.FromDate.Value);
                }
            }

            if (request.ToDate.HasValue)
            {
                if (isCompletedCriteria)
                {
                    Query.Where(o => (o.LastModifiedOn ?? o.PlacedAt) <= request.ToDate.Value);
                }
                else
                {
                    Query.Where(o => o.PlacedAt <= request.ToDate.Value);
                }
            }

            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                var rawStatuses = request.Status.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                var parsedStatuses = new List<OrderStatus>();
                foreach (var s in rawStatuses)
                {
                    if (Enum.TryParse<OrderStatus>(s, true, out var parsed))
                    {
                        parsedStatuses.Add(parsed);
                    }
                }
                if (parsedStatuses.Count > 0)
                {
                    Query.Where(o => parsedStatuses.Contains(o.Status));
                }
            }

            if (!string.IsNullOrWhiteSpace(request.PaymentStatus))
            {
                var rawPaymentStatuses = request.PaymentStatus.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                var parsedPaymentStatuses = new List<PaymentStatus>();
                foreach (var ps in rawPaymentStatuses)
                {
                    if (Enum.TryParse<PaymentStatus>(ps, true, out var parsed))
                    {
                        parsedPaymentStatuses.Add(parsed);
                    }
                }
                if (parsedPaymentStatuses.Count > 0)
                {
                    Query.Where(o => parsedPaymentStatuses.Contains(o.PaymentStatus));
                }
            }

            if (!string.IsNullOrWhiteSpace(request.PaymentMethod))
            {
                var rawPaymentMethods = request.PaymentMethod.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                var parsedPaymentMethods = new List<PaymentMethod>();
                foreach (var pm in rawPaymentMethods)
                {
                    if (Enum.TryParse<PaymentMethod>(pm, true, out var parsed))
                    {
                        parsedPaymentMethods.Add(parsed);
                    }
                }
                if (parsedPaymentMethods.Count > 0)
                {
                    Query.Where(o => parsedPaymentMethods.Contains(o.PaymentMethod));
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

