using Domain.Entities.Catalog;

namespace Application.Features.Catalog.Products.Specifications
{
    public sealed class ProductByIdWithDetailsSpec : Specification<Product>
    {
        public ProductByIdWithDetailsSpec(int id)
        {
            Query.Include(p => p.Category)
                 .Include(p => p.Variants)
                 .Where(p => p.Id == id);
        }
    }
}
