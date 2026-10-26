namespace Application.Features.Sales.Vouchers.DTOs
{
    public class PublicVoucherDto
    {
        public int Id { get; set; }
        public string Code { get; set; } = default!;
        public string Name { get; set; } = default!;
        public string? Description { get; set; }
        public string DiscountType { get; set; } = default!;
        public decimal DiscountValue { get; set; }
        public decimal? MinOrderAmount { get; set; }
        public decimal? MaxDiscountAmount { get; set; }
        public int? UsageLimit { get; set; }
        public int UsageCount { get; set; }
        public int RemainingUses { get; set; }
        public int PerUserLimit { get; set; }
        public DateTimeOffset EndDate { get; set; }
    }
}
