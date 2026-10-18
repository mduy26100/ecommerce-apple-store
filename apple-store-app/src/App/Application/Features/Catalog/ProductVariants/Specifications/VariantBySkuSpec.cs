using Domain.Entities.Catalog;

namespace Application.Features.Catalog.ProductVariants.Specifications
{
    public sealed class VariantBySkuSpec : Specification<ProductVariant>
    {
        public VariantBySkuSpec(string sku, int? excludeId = null)
        {
            var normalizedSku = sku.Trim().ToLower();
            Query.Where(v => v.SKU.ToLower() == normalizedSku);

            if (excludeId.HasValue)
            {
                Query.Where(v => v.Id != excludeId.Value);
            }
        }
    }
}
