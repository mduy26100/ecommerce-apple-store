using Domain.Common;

namespace Domain.Entities.Catalog
{
    public class ProductOptionValue : BaseEntity<int>
    {
        public int OptionId { get; set; }
        public string Value { get; set; } = default!;
        public string? ColorHexCode { get; set; }
        public int DisplayOrder { get; set; } = 0;

        public ProductOption Option { get; set; } = default!;
        public ICollection<ProductVariantValue> VariantValues { get; set; } = new List<ProductVariantValue>();
        public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    }
}
