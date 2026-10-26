namespace Application.Features.Sales.Vouchers.DTOs
{
    public class UserVoucherDto
    {
        public int Id { get; set; }
        public int VoucherId { get; set; }
        public string Code { get; set; } = default!;
        public string Name { get; set; } = default!;
        public string? Description { get; set; }
        public string DiscountType { get; set; } = default!;
        public decimal DiscountValue { get; set; }
        public decimal? MinOrderAmount { get; set; }
        public decimal? MaxDiscountAmount { get; set; }
        public int AssignedUsageLimit { get; set; }
        public int UsedCount { get; set; }
        public int RemainingUses { get; set; }
        public DateTimeOffset? ExpiresAt { get; set; }
        public bool IsAvailable { get; set; }
        public string TargetType { get; set; } = default!;
    }
}
