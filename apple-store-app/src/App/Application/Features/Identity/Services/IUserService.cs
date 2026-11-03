using Application.Features.Identity.DTOs;

namespace Application.Features.Identity.Services
{
    public interface IUserService
    {
        Task<UserProfileDto> GetProfileAsync(int userId, CancellationToken cancellationToken = default);
        Task UpdateProfileAsync(int userId, UpdateProfileRequest request, CancellationToken cancellationToken = default);
        Task<string> UploadAvatarAsync(int userId, Stream imageStream, string fileName, string? contentType, CancellationToken cancellationToken = default);
    }
}
