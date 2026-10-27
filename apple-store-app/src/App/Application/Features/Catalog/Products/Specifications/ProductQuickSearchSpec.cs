using Domain.Entities.Catalog;

namespace Application.Features.Catalog.Products.Specifications
{
    public sealed class ProductQuickSearchSpec : Specification<Product>
    {
        public ProductQuickSearchSpec(string query, int limit = 8)
        {
            var term = query.Trim().ToLower();

            Query.AsNoTracking()
                 .Include(p => p.Category)
                 .Include(p => p.Images)
                 .Include(p => p.Variants)
                 .Include(p => p.SpecificationGroups)
                    .ThenInclude(g => g.Specifications)
                 .Where(p => p.IsActive && !p.IsDeleted &&
                             (p.Name.ToLower().Contains(term) ||
                              p.Slug.ToLower().Contains(term) ||
                              (p.ModelCode != null && p.ModelCode.ToLower().Contains(term)) ||
                              p.Category.Name.ToLower().Contains(term) ||
                              (p.ShortDescription != null && p.ShortDescription.ToLower().Contains(term))))
                 .Take(limit);
        }
    }
}
