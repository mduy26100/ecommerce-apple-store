using Domain.Common;

namespace Domain.Entities.Catalog
{
    public class StorageOption : BaseEntity<int>
    {
        public string Name { get; set; } = default!;
        public long? CapacityValue { get; set; }
        public string? Unit { get; set; }

        public ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
    }
}
