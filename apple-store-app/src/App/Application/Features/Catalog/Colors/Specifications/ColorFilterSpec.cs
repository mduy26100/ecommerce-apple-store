using Application.Features.Catalog.Colors.DTOs;
using Domain.Entities.Catalog;

namespace Application.Features.Catalog.Colors.Specifications
{
    public sealed class ColorFilterSpec : Specification<Color>
    {
        public ColorFilterSpec(ColorPagedRequest request)
        {
            Query.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var search = request.Search.Trim().ToLower();
                Query.Where(c => c.Name.ToLower().Contains(search) || c.Code.ToLower().Contains(search));
            }

            if (request.IsActive.HasValue)
            {
                Query.Where(c => c.IsActive == request.IsActive.Value);
            }

            Query.OrderBy(c => c.Name);
        }
    }
}
