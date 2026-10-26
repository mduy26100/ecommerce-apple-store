namespace Application.Features.Sales.Vouchers.DTOs
{
    public class ValidateVoucherResponse
    {
        public bool IsValid { get; set; }
        public int? VoucherId { get; set; }
        public string? VoucherCode { get; set; }
        public string? VoucherName { get; set; }
        public string? DiscountType { get; set; }
        public decimal DiscountValue { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal FinalAmount { get; set; }
        public int? RemainingUses { get; set; }
        public string? Message { get; set; }
    }
}
