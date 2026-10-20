using Domain.Entities.Catalog;

namespace Application.Features.Catalog.Products.Specifications
{
    public sealed class ProductBySlugSpec : Specification<Product>
    {
        public ProductBySlugSpec(string slug, int? excludeId = null)
        {
            var normalizedSlug = slug.Trim().ToLower();
            Query.Include(p => p.Category)
                 .Include(p => p.Variants)
                    .ThenInclude(v => v.Color)
                 .Include(p => p.Variants)
                    .ThenInclude(v => v.StorageOption)
                 .Include(p => p.Variants)
                    .ThenInclude(v => v.Images)
                 .Where(p => p.Slug.ToLower() == normalizedSlug);

            if (excludeId.HasValue)
            {
                Query.Where(p => p.Id != excludeId.Value);
            }
        }
    }
}
