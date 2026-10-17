using Domain.Entities.Catalog;

namespace Application.Features.Catalog.Categories.Specifications
{
    public sealed class CategoryBySlugSpec : Specification<Category>
    {
        public CategoryBySlugSpec(string slug, int? excludeId = null)
        {
            var normalizedSlug = slug.Trim().ToLower();
            Query.Where(c => c.Slug.ToLower() == normalizedSlug);

            if (excludeId.HasValue)
            {
                Query.Where(c => c.Id != excludeId.Value);
            }
        }
    }
}
