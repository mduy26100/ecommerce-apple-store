using Domain.Entities.Sales;

namespace Application.Features.Sales.Carts.Specifications
{
    public sealed class CartWithItemsSpec : Specification<Cart>
    {
        public CartWithItemsSpec(int? userId, string? guestId)
        {
            if (userId.HasValue)
            {
                Query.Where(c => c.UserId == userId.Value);
            }
            else if (!string.IsNullOrWhiteSpace(guestId))
            {
                Query.Where(c => c.GuestId == guestId);
            }
            else
            {
                Query.Where(c => false);
            }

            Query.Include(c => c.Items)
                    .ThenInclude(i => i.ProductVariant)
                        .ThenInclude(v => v.Product)
                            .ThenInclude(p => p.Images)
                 .Include(c => c.Items)
                    .ThenInclude(i => i.ProductVariant)
                        .ThenInclude(v => v.VariantValues)
                            .ThenInclude(vv => vv.OptionValue)
                                .ThenInclude(ov => ov.Option);
        }
    }
}
