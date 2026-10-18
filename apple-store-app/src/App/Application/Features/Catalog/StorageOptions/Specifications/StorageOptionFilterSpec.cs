using Application.Features.Catalog.StorageOptions.DTOs;
using Domain.Entities.Catalog;

namespace Application.Features.Catalog.StorageOptions.Specifications
{
    public sealed class StorageOptionFilterSpec : Specification<StorageOption>
    {
        public StorageOptionFilterSpec(StorageOptionPagedRequest request)
        {
            Query.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var search = request.Search.Trim().ToLower();
                Query.Where(s => s.Name.ToLower().Contains(search) || (s.Unit != null && s.Unit.ToLower().Contains(search)));
            }

            if (request.IsActive.HasValue)
            {
                Query.Where(s => s.IsActive == request.IsActive.Value);
            }

            Query.OrderBy(s => s.CapacityValue)
                 .ThenBy(s => s.Name);
        }
    }
}
