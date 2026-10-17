using Domain.Common;

namespace Domain.Entities.Catalog
{
    public class ProductSpecification : BaseEntity<int>
    {
        public int ProductId { get; set; }
        public int? ProductVariantId { get; set; }
        public string? GroupName { get; set; }
        public string Name { get; set; } = default!;
        public string Value { get; set; } = default!;
        public string? Unit { get; set; }
        public int DisplayOrder { get; set; } = 0;

        public Product Product { get; set; } = default!;
        public ProductVariant? ProductVariant { get; set; }
    }
}
