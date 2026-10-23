using Domain.Entities.Catalog;

namespace Application.Features.Catalog.ProductVariants.Specifications
{
    public sealed class VariantsByProductIdSpec : Specification<ProductVariant>
    {
        public VariantsByProductIdSpec(int productId)
        {
            Query.Where(v => v.ProductId == productId)
                 .Include(v => v.Product)
                 .Include(v => v.VariantValues)
                    .ThenInclude(vv => vv.OptionValue)
                        .ThenInclude(ov => ov.Option)
                 .OrderBy(v => v.Price);
        }
    }
}
