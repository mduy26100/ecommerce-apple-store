using Domain.Common;
using Domain.Entities.Catalog;

namespace Domain.Entities.Sales
{
    public class CartItem : BaseEntity<int>
    {
        public int CartId { get; set; }
        public int ProductVariantId { get; set; }
        public int Quantity { get; set; }

        public Cart Cart { get; set; } = default!;
        public ProductVariant ProductVariant { get; set; } = default!;
    }
}
