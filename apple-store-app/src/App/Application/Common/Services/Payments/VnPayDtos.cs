namespace Application.Common.Services.Payments
{
    public class VnPayCreatePaymentRequest
    {
        public string OrderNumber { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string? OrderInfo { get; set; }
        public string? ClientIpAddress { get; set; }
    }

    public class VnPayPaymentResponse
    {
        public string PaymentUrl { get; set; } = string.Empty;
        public string OrderNumber { get; set; } = string.Empty;
    }

    public class VnPayCallbackResult
    {
        public bool IsSuccess { get; set; }
        public bool IsValidSignature { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public string? TransactionNo { get; set; }
        public string? BankCode { get; set; }
        public decimal Amount { get; set; }
        public string? ResponseCode { get; set; }
        public string? Message { get; set; }
    }

    public class VnPayIpnResponse
    {
        [JsonPropertyName("RspCode")]
        public string RspCode { get; set; } = string.Empty;

        [JsonPropertyName("Message")]
        public string Message { get; set; } = string.Empty;

        public static VnPayIpnResponse Success() => new() { RspCode = "00", Message = "Confirm Success" };
        public static VnPayIpnResponse OrderNotFound() => new() { RspCode = "01", Message = "Order not found" };
        public static VnPayIpnResponse OrderAlreadyConfirmed() => new() { RspCode = "02", Message = "Order already confirmed" };
        public static VnPayIpnResponse InvalidAmount() => new() { RspCode = "04", Message = "Invalid amount" };
        public static VnPayIpnResponse InvalidSignature() => new() { RspCode = "97", Message = "Invalid signature" };
        public static VnPayIpnResponse UnknownError() => new() { RspCode = "99", Message = "Unknown error" };
    }
}
