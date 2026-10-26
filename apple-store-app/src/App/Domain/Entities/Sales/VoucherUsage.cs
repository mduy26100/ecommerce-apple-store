using Domain.Common;

namespace Domain.Entities.Sales
{
    public class VoucherUsage : BaseEntity<int>
    {
        public int VoucherId { get; set; }
        public int OrderId { get; set; }
        public int? UserId { get; set; }
        public string? GuestId { get; set; }
        public string? CustomerPhone { get; set; }
        public string? CustomerEmail { get; set; }
        public decimal DiscountAmount { get; set; }
        public DateTimeOffset UsedAt { get; set; } = DateTimeOffset.UtcNow;

        public Voucher Voucher { get; set; } = default!;
        public Order Order { get; set; } = default!;
    }
}
