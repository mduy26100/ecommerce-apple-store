namespace Application.Common.Services.Payments
{
    public interface IVnPayService
    {
        string CreatePaymentUrl(VnPayCreatePaymentRequest request);
        VnPayCallbackResult ProcessReturn(IDictionary<string, string> queryParameters);
        Task<VnPayIpnResponse> ProcessIpnAsync(IDictionary<string, string> queryParameters, CancellationToken cancellationToken = default);
        string GetFrontendReturnUrl(IDictionary<string, string> queryParameters);
    }
}
