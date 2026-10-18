using Domain.Entities.Catalog;

namespace Application.Features.Catalog.ProductVariants.Specifications
{
    public sealed class VariantByIdWithDetailsSpec : Specification<ProductVariant>
    {
        public VariantByIdWithDetailsSpec(int id)
        {
            Query.Where(v => v.Id == id)
                 .Include(v => v.Product)
                 .Include(v => v.Color)
                 .Include(v => v.StorageOption)
                 .Include(v => v.Images);
        }
    }
}
