using Domain.Common;

namespace Domain.Entities.Sales
{
    public class Cart : BaseEntity<int>
    {
        public int? UserId { get; set; }
        public string? GuestId { get; set; }
        public DateTimeOffset? ExpiresOn { get; set; }

        public ICollection<CartItem> Items { get; set; } = new List<CartItem>();

        public void AddItem(int productVariantId, int quantity, decimal unitPrice)
        {
            var existingItem = Items.FirstOrDefault(i => i.ProductVariantId == productVariantId && !i.IsDeleted);
            if (existingItem != null)
            {
                existingItem.Quantity += quantity;
                existingItem.UnitPrice = unitPrice;
                existingItem.IsActive = true;
            }
            else
            {
                Items.Add(new CartItem
                {
                    CartId = Id,
                    ProductVariantId = productVariantId,
                    Quantity = quantity,
                    UnitPrice = unitPrice,
                    IsSelected = true
                });
            }
        }

        public void UpdateItemQuantity(int productVariantId, int newQuantity)
        {
            var existingItem = Items.FirstOrDefault(i => i.ProductVariantId == productVariantId && !i.IsDeleted);
            if (existingItem != null)
            {
                existingItem.Quantity = newQuantity;
            }
        }

        public void RemoveItem(int productVariantId)
        {
            var existingItem = Items.FirstOrDefault(i => i.ProductVariantId == productVariantId && !i.IsDeleted);
            if (existingItem != null)
            {
                existingItem.IsDeleted = true;
                existingItem.DeletedOn = DateTimeOffset.UtcNow;
            }
        }

        public void RemoveItemById(int cartItemId)
        {
            var existingItem = Items.FirstOrDefault(i => i.Id == cartItemId && !i.IsDeleted);
            if (existingItem != null)
            {
                existingItem.IsDeleted = true;
                existingItem.DeletedOn = DateTimeOffset.UtcNow;
            }
        }

        public void Clear()
        {
            foreach (var item in Items.Where(i => !i.IsDeleted))
            {
                item.IsDeleted = true;
                item.DeletedOn = DateTimeOffset.UtcNow;
            }
        }
    }
}
