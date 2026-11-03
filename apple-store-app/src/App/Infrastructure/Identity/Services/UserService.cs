using Application.Common.Interfaces.Storage;
using Application.Features.Identity.DTOs;
using Application.Features.Identity.Services;
using Domain.Constants;
using Domain.Exceptions;
using Infrastructure.Identity.Models;

namespace Infrastructure.Identity.Services
{
    public class UserService : IUserService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IUploadImageService _uploadImageService;

        public UserService(UserManager<ApplicationUser> userManager, IUploadImageService uploadImageService)
        {
            _userManager = userManager;
            _uploadImageService = uploadImageService;
        }

        public async Task<UserProfileDto> GetProfileAsync(int userId, CancellationToken cancellationToken = default)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
            {
                throw new NotFoundException("Không tìm thấy thông tin người dùng.");
            }

            var roles = await _userManager.GetRolesAsync(user);
            var primaryRole = roles.FirstOrDefault() ?? RoleConstants.User;

            var fullName = $"{user.FirstName} {user.LastName}".Trim();
            if (string.IsNullOrWhiteSpace(fullName))
            {
                fullName = user.UserName ?? user.Email ?? string.Empty;
            }

            return new UserProfileDto
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                UserName = user.UserName,
                FirstName = user.FirstName,
                LastName = user.LastName,
                FullName = fullName,
                PhoneNumber = user.PhoneNumber,
                AvatarUrl = user.AvatarUrl,
                Role = primaryRole,
                IsActive = user.IsActive
            };
        }

        public async Task UpdateProfileAsync(int userId, UpdateProfileRequest request, CancellationToken cancellationToken = default)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
            {
                throw new NotFoundException("Không tìm thấy thông tin người dùng.");
            }

            if (!string.IsNullOrWhiteSpace(request.FullName) &&
                string.IsNullOrWhiteSpace(request.FirstName) &&
                string.IsNullOrWhiteSpace(request.LastName))
            {
                var (firstName, lastName) = SplitFullName(request.FullName);
                user.FirstName = firstName;
                user.LastName = lastName;
            }
            else
            {
                if (request.FirstName != null)
                {
                    user.FirstName = request.FirstName;
                }

                if (request.LastName != null)
                {
                    user.LastName = request.LastName;
                }
            }

            if (request.PhoneNumber != null)
            {
                user.PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber.Trim();
            }

            if (request.AvatarUrl != null)
            {
                user.AvatarUrl = request.AvatarUrl;
            }

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                throw new BusinessRuleException($"Cập nhật thông tin thất bại: {errors}");
            }
        }

        public async Task<string> UploadAvatarAsync(int userId, Stream imageStream, string fileName, string? contentType, CancellationToken cancellationToken = default)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
            {
                throw new NotFoundException("Không tìm thấy thông tin người dùng.");
            }

            if (imageStream == null || string.IsNullOrWhiteSpace(fileName))
            {
                throw new BusinessRuleException("Vui lòng cung cấp tệp hình ảnh để tải lên.");
            }

            var uploadedUrl = await _uploadImageService.UploadAndReplaceImageAsync(
                imageStream,
                fileName,
                contentType,
                "avatars",
                user.AvatarUrl,
                async newUrl =>
                {
                    user.AvatarUrl = newUrl;
                    var updateResult = await _userManager.UpdateAsync(user);
                    if (!updateResult.Succeeded)
                    {
                        var errors = string.Join("; ", updateResult.Errors.Select(e => e.Description));
                        throw new BusinessRuleException($"Cập nhật ảnh đại diện thất bại: {errors}");
                    }
                },
                cancellationToken);

            return uploadedUrl;
        }

        private static (string? FirstName, string? LastName) SplitFullName(string? fullName)
        {
            if (string.IsNullOrWhiteSpace(fullName))
            {
                return (null, null);
            }

            var trimmed = fullName.Trim();
            var spaceIndex = trimmed.LastIndexOf(' ');
            if (spaceIndex == -1)
            {
                return (null, trimmed);
            }

            var firstName = trimmed.Substring(0, spaceIndex).Trim();
            var lastName = trimmed.Substring(spaceIndex + 1).Trim();
            return (firstName, lastName);
        }
    }
}
