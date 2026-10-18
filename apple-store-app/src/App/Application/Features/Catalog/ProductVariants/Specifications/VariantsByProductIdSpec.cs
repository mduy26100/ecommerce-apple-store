using Domain.Entities.Catalog;

namespace Application.Features.Catalog.ProductVariants.Specifications
{
    public sealed class VariantsByProductIdSpec : Specification<ProductVariant>
    {
        public VariantsByProductIdSpec(int productId)
        {
            Query.Where(v => v.ProductId == productId)
                 .Include(v => v.Product)
                 .Include(v => v.Color)
                 .Include(v => v.StorageOption)
                 .Include(v => v.Images)
                 .OrderBy(v => v.Price);
        }
    }
}
