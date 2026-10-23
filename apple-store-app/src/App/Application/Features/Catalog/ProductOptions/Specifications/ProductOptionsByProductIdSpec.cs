using Domain.Entities.Catalog;

namespace Application.Features.Catalog.ProductOptions.Specifications
{
    public sealed class ProductOptionsByProductIdSpec : Specification<ProductOption>
    {
        public ProductOptionsByProductIdSpec(int productId)
        {
            Query.Where(o => o.ProductId == productId)
                 .Include(o => o.Values)
                 .OrderBy(o => o.DisplayOrder);
        }
    }
}
