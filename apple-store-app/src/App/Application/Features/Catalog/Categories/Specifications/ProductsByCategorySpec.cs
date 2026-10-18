using Domain.Entities.Catalog;

namespace Application.Features.Catalog.Categories.Specifications
{
    public sealed class ProductsByCategorySpec : Specification<Product>
    {
        public ProductsByCategorySpec(int categoryId)
        {
            Query.Where(p => p.CategoryId == categoryId);
        }
    }
}
