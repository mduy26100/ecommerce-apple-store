using Domain.Common;

namespace Domain.Entities.Sales
{
    public class UserVoucher : BaseEntity<int>
    {
        public int UserId { get; set; }
        public int VoucherId { get; set; }
        public int AssignedUsageLimit { get; set; } = 1;
        public int UsedCount { get; set; } = 0;
        public DateTimeOffset AssignedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? ExpiresAt { get; set; }
        public string? AssignedBy { get; set; }
        public string? Note { get; set; }

        public Voucher Voucher { get; set; } = default!;
    }
}
