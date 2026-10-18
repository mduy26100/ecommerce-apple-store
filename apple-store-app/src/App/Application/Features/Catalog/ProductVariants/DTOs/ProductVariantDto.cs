namespace Application.Features.Catalog.ProductVariants.DTOs
{
    public class ProductVariantDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = default!;
        public string SKU { get; set; } = default!;
        public string? VariantName { get; set; }
        public int? ColorId { get; set; }
        public string? ColorName { get; set; }
        public string? ColorHexCode { get; set; }
        public int? StorageOptionId { get; set; }
        public string? StorageCapacity { get; set; }
        public decimal Price { get; set; }
        public decimal? CompareAtPrice { get; set; }
        public int QuantityInStock { get; set; }
        public string RowVersion { get; set; } = default!;
        public bool IsActive { get; set; }
        public string? PrimaryImageUrl { get; set; }
        public DateTimeOffset CreatedOn { get; set; }
        public DateTimeOffset? LastModifiedOn { get; set; }
    }
}
