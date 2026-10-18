using Domain.Entities.Catalog;

namespace Application.Features.Catalog.Products.Specifications
{
    public sealed class ProductBySlugSpec : Specification<Product>
    {
        public ProductBySlugSpec(string slug, int? excludeId = null)
        {
            var normalizedSlug = slug.Trim().ToLower();
            Query.Include(p => p.Category)
                 .Where(p => p.Slug.ToLower() == normalizedSlug);

            if (excludeId.HasValue)
            {
                Query.Where(p => p.Id != excludeId.Value);
            }
        }
    }
}
