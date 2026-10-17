using Domain.Common;

namespace Domain.Entities.Sales
{
    public class Order : BaseEntity<int>
    {
        public string OrderNumber { get; set; } = default!;
        public int UserId { get; set; }
        public string Status { get; set; } = "Pending";
        public string PaymentMethod { get; set; } = "COD";
        public string PaymentStatus { get; set; } = "Pending";
        public string RecipientName { get; set; } = default!;
        public string RecipientPhone { get; set; } = default!;
        public string ShippingAddressLine { get; set; } = default!;
        public string? ShippingWard { get; set; }
        public string? ShippingDistrict { get; set; }
        public string ShippingProvince { get; set; } = default!;
        public string? CustomerNote { get; set; }
        public decimal Subtotal { get; set; }
        public decimal ShippingFee { get; set; } = 0;
        public decimal TotalAmount { get; set; }
        public DateTime PlacedAt { get; set; } = DateTime.UtcNow;

        public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    }
}
