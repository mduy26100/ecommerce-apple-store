using Domain.Common;
using Domain.Entities.Catalog;

namespace Domain.Entities.Sales
{
    public class CartItem : BaseEntity<int>
    {
        public int CartId { get; set; }
        public int ProductVariantId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public bool IsSelected { get; set; } = true;

        public Cart Cart { get; set; } = default!;
        public ProductVariant ProductVariant { get; set; } = default!;
    }
}
