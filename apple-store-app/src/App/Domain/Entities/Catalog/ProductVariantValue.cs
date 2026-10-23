namespace Domain.Entities.Catalog
{
    public class ProductVariantValue
    {
        public int VariantId { get; set; }
        public int OptionValueId { get; set; }

        public ProductVariant Variant { get; set; } = default!;
        public ProductOptionValue OptionValue { get; set; } = default!;
    }
}
