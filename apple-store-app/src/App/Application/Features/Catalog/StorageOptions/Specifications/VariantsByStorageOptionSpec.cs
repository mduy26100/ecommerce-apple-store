using Domain.Entities.Catalog;

namespace Application.Features.Catalog.StorageOptions.Specifications
{
    public sealed class VariantsByStorageOptionSpec : Specification<ProductVariant>
    {
        public VariantsByStorageOptionSpec(int storageOptionId)
        {
            Query.Where(v => false);
        }
    }
}
