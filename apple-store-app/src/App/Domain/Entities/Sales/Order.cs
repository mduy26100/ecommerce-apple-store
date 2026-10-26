using Domain.Common;
using Domain.Enums.Sales;

namespace Domain.Entities.Sales
{
    public class Order : BaseEntity<int>
    {
        public string OrderNumber { get; set; } = default!;
        public int? UserId { get; set; }
        public string? GuestId { get; set; }
        public OrderStatus Status { get; set; } = OrderStatus.Pending;
        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.COD;
        public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;
        public string RecipientName { get; set; } = default!;
        public string RecipientPhone { get; set; } = default!;
        public string? RecipientEmail { get; set; }
        public string ShippingAddressLine { get; set; } = default!;
        public string? ShippingWard { get; set; }
        public string? ShippingDistrict { get; set; }
        public string ShippingProvince { get; set; } = default!;
        public string? CustomerNote { get; set; }
        public decimal Subtotal { get; set; }
        public decimal ShippingFee { get; set; } = 0;
        public int? VoucherId { get; set; }
        public string? VoucherCode { get; set; }
        public decimal DiscountAmount { get; set; } = 0;
        public decimal TotalAmount { get; set; }
        public DateTimeOffset PlacedAt { get; set; } = DateTimeOffset.UtcNow;
        public int ShippingAddressUpdateCount { get; set; } = 0;
        public string? StatusHistoryJson { get; set; }
        public byte[] RowVersion { get; set; } = default!;

        public Voucher? Voucher { get; set; }
        public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    }
}
