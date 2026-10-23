namespace Application.Features.Catalog.ProductVariants.DTOs
{
    public class UpdateProductVariantRequest
    {
        public string SKU { get; set; } = default!;
        public string? VariantName { get; set; }
        public List<int> OptionValueIds { get; set; } = new();
        public decimal Price { get; set; }
        public decimal? CompareAtPrice { get; set; }
        public int QuantityInStock { get; set; }
        public string? RowVersion { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
