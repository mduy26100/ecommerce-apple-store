using Domain.Common;
using Domain.Entities.Catalog;

namespace Domain.Entities.Sales
{
    public class OrderItem : BaseEntity<int>
    {
        public int OrderId { get; set; }
        public int? ProductVariantId { get; set; }
        public string ProductName { get; set; } = default!;
        public string SKU { get; set; } = default!;
        public string? VariantName { get; set; }
        public string? ThumbnailUrl { get; set; }
        public string? SelectedAttributesJson { get; set; }
        public string? ColorName { get; set; }
        public string? StorageName { get; set; }
        public decimal CostPrice { get; set; } = 0;
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal LineTotal { get; set; }

        public Order Order { get; set; } = default!;
        public ProductVariant? ProductVariant { get; set; }
    }
}
