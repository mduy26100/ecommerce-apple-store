namespace Application.Common.Services.Payments
{
    public class VnPaySettings
    {
        public const string SectionName = "VnPay";

        public string TmnCode { get; set; } = string.Empty;
        public string HashSecret { get; set; } = string.Empty;
        public string PaymentUrl { get; set; } = string.Empty;
        public string ReturnUrl { get; set; } = string.Empty;
        public string FrontendReturnUrl { get; set; } = string.Empty;
    }
}
