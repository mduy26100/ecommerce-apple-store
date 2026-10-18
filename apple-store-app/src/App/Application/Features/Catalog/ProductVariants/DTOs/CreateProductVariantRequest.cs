namespace Application.Features.Catalog.ProductVariants.DTOs
{
    public class CreateProductVariantRequest
    {
        public int ProductId { get; set; }
        public string SKU { get; set; } = default!;
        public string? VariantName { get; set; }
        public int? ColorId { get; set; }
        public int? StorageOptionId { get; set; }
        public decimal Price { get; set; }
        public decimal? CompareAtPrice { get; set; }
        public int QuantityInStock { get; set; } = 0;
        public bool IsActive { get; set; } = true;
    }
}
