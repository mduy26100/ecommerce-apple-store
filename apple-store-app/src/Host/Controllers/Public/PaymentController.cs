using Application.Common.Services.Payments;
using Application.Wrappers;

namespace Host.Controllers.Public
{
    [Tags("Public - Payment")]
    [Route("api/payment")]
    public class PaymentController : BasePublicController
    {
        private readonly IVnPayService _vnPayService;

        public PaymentController(IVnPayService vnPayService)
        {
            _vnPayService = vnPayService;
        }

        [HttpGet("vnpay-return")]
        public async Task<IActionResult> VnpayReturn([FromQuery] Dictionary<string, string> allParams, CancellationToken cancellationToken)
        {
            var queryDict = Request.Query.ToDictionary(k => k.Key, v => v.Value.ToString());
            if (queryDict.Count == 0 && allParams != null)
            {
                queryDict = allParams;
            }

            var result = _vnPayService.ProcessReturn(queryDict);
            if (result.IsSuccess)
            {
                await _vnPayService.ProcessIpnAsync(queryDict, cancellationToken);
            }

            var redirectUrl = _vnPayService.GetFrontendReturnUrl(queryDict);
            return Redirect(redirectUrl);
        }

        [DisableWrapper]
        [HttpGet("vnpay-ipn")]
        [HttpPost("vnpay-ipn")]
        public async Task<IActionResult> VnpayIpn(CancellationToken cancellationToken)
        {
            var queryDict = Request.Query.ToDictionary(k => k.Key, v => v.Value.ToString());

            if (Request.HasFormContentType)
            {
                var form = await Request.ReadFormAsync(cancellationToken);
                foreach (var item in form)
                {
                    queryDict[item.Key] = item.Value.ToString();
                }
            }

            var response = await _vnPayService.ProcessIpnAsync(queryDict, cancellationToken);
            return Ok(response);
        }
    }
}
