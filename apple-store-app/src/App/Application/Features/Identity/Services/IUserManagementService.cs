using Application.Features.Identity.DTOs;
using Application.Wrappers;

namespace Application.Features.Identity.Services
{
    public interface IUserManagementService
    {
        Task<PagedList<UserListItemDto>> GetPagedUsersAsync(UserPagedRequest request, CancellationToken cancellationToken = default);
        Task<UserDetailDto> GetUserByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<int> CreateUserAsync(CreateUserByAdminRequest request, CancellationToken cancellationToken = default);
        Task UpdateUserAsync(int id, UpdateUserByAdminRequest request, CancellationToken cancellationToken = default);
        Task LockUserAsync(int id, LockUserRequest request, CancellationToken cancellationToken = default);
        Task UnlockUserAsync(int id, CancellationToken cancellationToken = default);
        Task ResetPasswordAsync(int id, ResetPasswordByAdminRequest request, CancellationToken cancellationToken = default);
    }
}

