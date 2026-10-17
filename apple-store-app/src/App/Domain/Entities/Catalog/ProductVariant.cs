using Domain.Common;

namespace Domain.Entities.Catalog
{
    public class ProductVariant : BaseEntity<int>
    {
        public int ProductId { get; set; }
        public string SKU { get; set; } = default!;
        public string? VariantName { get; set; }
        public int? ColorId { get; set; }
        public int? StorageOptionId { get; set; }
        public decimal Price { get; set; }
        public decimal? CompareAtPrice { get; set; }
        public int QuantityInStock { get; set; }
        public byte[] RowVersion { get; set; } = default!;

        public Product Product { get; set; } = default!;
        public Color? Color { get; set; }
        public StorageOption? StorageOption { get; set; }
        public ICollection<VariantImage> Images { get; set; } = new List<VariantImage>();
        public ICollection<ProductSpecification> Specifications { get; set; } = new List<ProductSpecification>();
    }
}
