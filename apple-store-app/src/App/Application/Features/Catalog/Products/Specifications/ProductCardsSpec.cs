using Domain.Entities.Catalog;

namespace Application.Features.Catalog.Products.Specifications
{
    public sealed class ProductCardsSpec : Specification<Product>
    {
        public ProductCardsSpec(int? categoryId = null, int limit = 100)
        {
            Query.AsNoTracking()
                 .Include(p => p.Category)
                 .Include(p => p.Images)
                 .Include(p => p.Variants)
                 .Include(p => p.SpecificationGroups)
                    .ThenInclude(g => g.Specifications)
                 .Where(p => p.IsActive && !p.IsDeleted);

            if (categoryId.HasValue && categoryId.Value > 0)
            {
                Query.Where(p => p.CategoryId == categoryId.Value);
            }

            Query.OrderBy(p => p.CategoryId).ThenBy(p => p.Id);

            if (limit > 0)
            {
                Query.Take(limit);
            }
        }
    }
}
