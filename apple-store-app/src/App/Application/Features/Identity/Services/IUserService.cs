using Application.Features.Identity.DTOs;

namespace Application.Features.Identity.Services
{
    public interface IUserService
    {
        Task<UserProfileDto> GetProfileAsync(int userId, CancellationToken cancellationToken = default);
        Task UpdateProfileAsync(int userId, UpdateProfileRequest request, CancellationToken cancellationToken = default);
    }
}
