using Domain.Entities.Catalog;

namespace Application.Features.Catalog.StorageOptions.Specifications
{
    public sealed class ActiveStorageOptionsSpec : Specification<StorageOption>
    {
        public ActiveStorageOptionsSpec()
        {
            Query.AsNoTracking()
                 .Where(s => s.IsActive)
                 .OrderBy(s => s.CapacityValue)
                 .ThenBy(s => s.Name);
        }
    }
}
