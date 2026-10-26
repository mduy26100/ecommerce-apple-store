namespace Application.Features.Sales.Vouchers.DTOs
{
    public class ValidateVoucherRequest
    {
        public string VoucherCode { get; set; } = default!;
        public decimal Subtotal { get; set; }
        public string? GuestId { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
    }
}
