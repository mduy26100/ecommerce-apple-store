using Application.Features.Identity.DTOs;

namespace Application.Features.Identity.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> LoginAsync(LoginRequest request, string? ipAddress = null, CancellationToken cancellationToken = default);
        Task<AuthResponseDto> RegisterAsync(RegisterRequest request, string? ipAddress = null, CancellationToken cancellationToken = default);
        Task<AuthResponseDto> RefreshTokenAsync(string refreshToken, string? ipAddress = null, CancellationToken cancellationToken = default);
        Task LogoutAsync(string refreshToken, CancellationToken cancellationToken = default);
        Task<AuthResponseDto> ChangePasswordAsync(int userId, ChangePasswordRequest request, string? ipAddress = null, CancellationToken cancellationToken = default);
    }
}
