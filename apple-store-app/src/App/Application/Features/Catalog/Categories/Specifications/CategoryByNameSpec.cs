using Domain.Entities.Catalog;

namespace Application.Features.Catalog.Categories.Specifications
{
    public sealed class CategoryByNameSpec : Specification<Category>
    {
        public CategoryByNameSpec(string name, int? excludeId = null)
        {
            var normalizedName = name.Trim().ToLower();
            Query.Where(c => c.Name.ToLower() == normalizedName);

            if (excludeId.HasValue)
            {
                Query.Where(c => c.Id != excludeId.Value);
            }
        }
    }
}
