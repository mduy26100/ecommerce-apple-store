using Domain.Entities.Catalog;

namespace Application.Features.Catalog.Colors.Specifications
{
    public sealed class VariantsByColorSpec : Specification<ProductVariant>
    {
        public VariantsByColorSpec(int colorId)
        {
            Query.Where(v => v.ColorId == colorId);
        }
    }
}
