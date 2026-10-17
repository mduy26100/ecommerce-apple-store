using Domain.Entities.Catalog;

namespace Application.Features.Catalog.Categories.Specifications
{
    public sealed class ActiveCategoriesSpec : Specification<Category>
    {
        public ActiveCategoriesSpec()
        {
            Query.AsNoTracking()
                 .Where(c => c.IsActive)
                 .OrderBy(c => c.DisplayOrder)
                 .ThenBy(c => c.Name);
        }
    }
}
