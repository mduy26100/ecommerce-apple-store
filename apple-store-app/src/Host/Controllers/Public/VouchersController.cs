using Application.Features.Sales.Vouchers.DTOs;
using Application.Features.Sales.Vouchers.Services;

namespace Host.Controllers.Public
{
    [Tags("Public - Vouchers")]
    [Route("api/vouchers")]
    public class VouchersController : BasePublicController
    {
        private readonly IPublicVoucherService _voucherService;

        public VouchersController(IPublicVoucherService voucherService)
        {
            _voucherService = voucherService;
        }

        [HttpPost("validate")]
        public async Task<IActionResult> ValidateVoucher([FromBody] ValidateVoucherRequest request, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserIdOptional();
            var result = await _voucherService.ValidateVoucherAsync(userId, request, cancellationToken);
            return Ok(result);
        }

        [HttpGet("my-wallet")]
        public async Task<IActionResult> GetMyWallet(CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserIdOptional();
            var vouchers = await _voucherService.GetMyVouchersAsync(userId, cancellationToken);
            return Ok(vouchers);
        }

        [HttpGet("public")]
        public async Task<IActionResult> GetPublicVouchers(CancellationToken cancellationToken)
        {
            var vouchers = await _voucherService.GetPublicVouchersAsync(cancellationToken);
            return Ok(vouchers);
        }
    }
}
