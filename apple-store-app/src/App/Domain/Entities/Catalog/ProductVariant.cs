using Domain.Common;

namespace Domain.Entities.Catalog
{
    public class ProductVariant : BaseEntity<int>
    {
        public int ProductId { get; set; }
        public string SKU { get; set; } = default!;
        public string? VariantName { get; set; }
        public decimal Price { get; set; }
        public decimal? CompareAtPrice { get; set; }
        public decimal CostPrice { get; set; } = 0;
        public int QuantityInStock { get; set; }
        public byte[] RowVersion { get; set; } = default!;

        public Product Product { get; set; } = default!;
        public ICollection<ProductVariantValue> VariantValues { get; set; } = new List<ProductVariantValue>();
    }
}
