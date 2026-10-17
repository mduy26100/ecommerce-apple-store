using Domain.Common;

namespace Domain.Entities.Sales
{
    public class Cart : BaseEntity<int>
    {
        public int UserId { get; set; }
        public string Status { get; set; } = "Active";

        public ICollection<CartItem> Items { get; set; } = new List<CartItem>();
    }
}
