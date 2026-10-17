using Application.Features.Catalog.Categories.DTOs;
using Domain.Entities.Catalog;

namespace Application.Features.Catalog.Categories.Specifications
{
    public sealed class CategoryFilterSpec : Specification<Category>
    {
        public CategoryFilterSpec(CategoryPagedRequest request)
        {
            Query.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var search = request.Search.Trim().ToLower();
                Query.Where(c => c.Name.ToLower().Contains(search) || (c.Description != null && c.Description.ToLower().Contains(search)));
            }

            if (request.IsActive.HasValue)
            {
                Query.Where(c => c.IsActive == request.IsActive.Value);
            }

            Query.OrderBy(c => c.DisplayOrder)
                 .ThenBy(c => c.Name);
        }
    }
}
