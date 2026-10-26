using Domain.Common;
using Domain.Enums.Sales;

namespace Domain.Entities.Sales
{
    public class Voucher : BaseEntity<int>
    {
        public string Code { get; set; } = default!;
        public string Name { get; set; } = default!;
        public string? Description { get; set; }
        public VoucherTargetType TargetType { get; set; } = VoucherTargetType.Public;
        public VoucherDiscountType DiscountType { get; set; } = VoucherDiscountType.Percentage;
        public decimal DiscountValue { get; set; }
        public decimal? MinOrderAmount { get; set; }
        public decimal? MaxDiscountAmount { get; set; }
        public DateTimeOffset StartDate { get; set; }
        public DateTimeOffset EndDate { get; set; }
        public int? UsageLimit { get; set; }
        public int UsageCount { get; set; } = 0;
        public int PerUserLimit { get; set; } = 1;
        public byte[] RowVersion { get; set; } = default!;

        public ICollection<Order> Orders { get; set; } = new List<Order>();
        public ICollection<VoucherUsage> Usages { get; set; } = new List<VoucherUsage>();
        public ICollection<UserVoucher> UserVouchers { get; set; } = new List<UserVoucher>();
    }
}
