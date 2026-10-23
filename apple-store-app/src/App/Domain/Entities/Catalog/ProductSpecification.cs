using Domain.Common;

namespace Domain.Entities.Catalog
{
    public class ProductSpecification : BaseEntity<int>
    {
        public int GroupId { get; set; }
        public string Name { get; set; } = default!;
        public string Value { get; set; } = default!;
        public string? Unit { get; set; }
        public int DisplayOrder { get; set; } = 0;

        public ProductSpecificationGroup Group { get; set; } = default!;
    }
}
