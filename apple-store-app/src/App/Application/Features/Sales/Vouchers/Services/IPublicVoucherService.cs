using Application.Features.Sales.Vouchers.DTOs;

namespace Application.Features.Sales.Vouchers.Services
{
    public interface IPublicVoucherService
    {
        Task<ValidateVoucherResponse> ValidateVoucherAsync(int? userId, ValidateVoucherRequest request, CancellationToken cancellationToken = default);
        Task<List<UserVoucherDto>> GetMyVouchersAsync(int? userId, CancellationToken cancellationToken = default);
        Task<List<PublicVoucherDto>> GetPublicVouchersAsync(CancellationToken cancellationToken = default);
    }
}
