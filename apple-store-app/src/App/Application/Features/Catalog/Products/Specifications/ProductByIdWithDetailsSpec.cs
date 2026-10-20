using Domain.Entities.Catalog;

namespace Application.Features.Catalog.Products.Specifications
{
    public sealed class ProductByIdWithDetailsSpec : Specification<Product>
    {
        public ProductByIdWithDetailsSpec(int id)
        {
            Query.Include(p => p.Category)
                 .Include(p => p.Variants)
                    .ThenInclude(v => v.Color)
                 .Include(p => p.Variants)
                    .ThenInclude(v => v.StorageOption)
                 .Include(p => p.Variants)
                    .ThenInclude(v => v.Images)
                 .Where(p => p.Id == id);
        }
    }
}
