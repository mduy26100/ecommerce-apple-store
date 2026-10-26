using Domain.Entities.Sales;

namespace Application.Features.Sales.Orders.Specifications
{
    public sealed class UnclaimedOrdersByEmailSpec : Specification<Order>
    {
        public UnclaimedOrdersByEmailSpec(string email)
        {
            var normalizedEmail = email.Trim().ToLower();
            Query.Where(o => o.UserId == null && o.RecipientEmail != null && o.RecipientEmail.ToLower() == normalizedEmail);
        }
    }
}
