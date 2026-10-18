using Domain.Entities.Catalog;

namespace Application.Features.Catalog.VariantImages.Specifications
{
    public sealed class ImagesByVariantIdSpec : Specification<VariantImage>
    {
        public ImagesByVariantIdSpec(int variantId)
        {
            Query.Where(i => i.ProductVariantId == variantId)
                 .OrderByDescending(i => i.IsPrimary)
                 .ThenBy(i => i.DisplayOrder);
        }
    }
}
