namespace Application.Features.Catalog.ProductVariants.DTOs
{
    public class ProductVariantValueDto
    {
        public int OptionId { get; set; }
        public string OptionName { get; set; } = default!;
        public int OptionValueId { get; set; }
        public string Value { get; set; } = default!;
        public string? ColorHexCode { get; set; }
    }
}
