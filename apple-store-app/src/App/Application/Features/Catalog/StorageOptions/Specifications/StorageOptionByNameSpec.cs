using Domain.Entities.Catalog;

namespace Application.Features.Catalog.StorageOptions.Specifications
{
    public sealed class StorageOptionByNameSpec : Specification<StorageOption>
    {
        public StorageOptionByNameSpec(string name, int? excludeId = null)
        {
            var normalizedName = name.Trim().ToLower();
            Query.Where(s => s.Name.ToLower() == normalizedName);

            if (excludeId.HasValue)
            {
                Query.Where(s => s.Id != excludeId.Value);
            }
        }
    }
}
