using Application.Features.Identity.DTOs;
using Application.Features.Identity.Services;
using Application.Wrappers;
using Domain.Constants;
using Domain.Exceptions;
using Infrastructure.Identity.Models;
using Infrastructure.Persistence;

namespace Infrastructure.Identity.Services
{
    public class UserManagementService : IUserManagementService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly AppDbContext _dbContext;

        public UserManagementService(
            UserManager<ApplicationUser> userManager,
            RoleManager<ApplicationRole> roleManager,
            AppDbContext dbContext)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _dbContext = dbContext;
        }

        public async Task<PagedList<UserListItemDto>> GetPagedUsersAsync(UserPagedRequest request, CancellationToken cancellationToken = default)
        {
            var userRole = await _roleManager.FindByNameAsync(RoleConstants.User);
            var superAdminRole = await _roleManager.FindByNameAsync(RoleConstants.SuperAdmin);

            if (userRole == null)
            {
                return new PagedList<UserListItemDto>(new List<UserListItemDto>(), 0, request.PageNumber, request.PageSize);
            }

            var superAdminRoleId = superAdminRole?.Id ?? -1;
            var userRoleId = userRole.Id;

            var query = _dbContext.Users.AsNoTracking()
                .Where(u => _dbContext.UserRoles.Any(ur => ur.UserId == u.Id && ur.RoleId == userRoleId))
                .Where(u => !_dbContext.UserRoles.Any(ur => ur.UserId == u.Id && ur.RoleId == superAdminRoleId));

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var term = request.Search.Trim().ToLower();
                query = query.Where(u =>
                    (u.Email != null && u.Email.ToLower().Contains(term)) ||
                    (u.UserName != null && u.UserName.ToLower().Contains(term)) ||
                    (u.FirstName != null && u.FirstName.ToLower().Contains(term)) ||
                    (u.LastName != null && u.LastName.ToLower().Contains(term)) ||
                    ((u.FirstName ?? "") + " " + (u.LastName ?? "")).ToLower().Contains(term) ||
                    (u.PhoneNumber != null && u.PhoneNumber.Contains(term)));
            }

            var now = DateTimeOffset.UtcNow;
            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                var status = request.Status.Trim().ToLower();
                if (status == "active")
                {
                    query = query.Where(u => u.IsActive && (!u.LockoutEnd.HasValue || u.LockoutEnd.Value <= now));
                }
                else if (status == "locked")
                {
                    query = query.Where(u => !u.IsActive || (u.LockoutEnd.HasValue && u.LockoutEnd.Value > now));
                }
            }

            var totalCount = await query.CountAsync(cancellationToken);
            var users = await query
                .OrderByDescending(u => u.Id)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            var userIds = users.Select(u => u.Id).ToList();
            var userStats = await _dbContext.Orders.AsNoTracking()
                .Where(o => o.UserId.HasValue && userIds.Contains(o.UserId.Value))
                .GroupBy(o => o.UserId!.Value)
                .Select(g => new
                {
                    UserId = g.Key,
                    TotalOrders = g.Count(),
                    TotalSpent = g.Sum(o => o.TotalAmount)
                })
                .ToDictionaryAsync(x => x.UserId, cancellationToken);

            var items = users.Select(u =>
            {
                var isLocked = !u.IsActive || (u.LockoutEnd.HasValue && u.LockoutEnd.Value > now);
                int? daysRemaining = null;
                if (u.LockoutEnd.HasValue && u.LockoutEnd.Value > now)
                {
                    var diff = u.LockoutEnd.Value - now;
                    daysRemaining = Math.Max(1, (int)Math.Ceiling(diff.TotalDays));
                }

                userStats.TryGetValue(u.Id, out var stats);

                var fullName = $"{u.FirstName} {u.LastName}".Trim();
                if (string.IsNullOrWhiteSpace(fullName))
                {
                    fullName = u.UserName ?? u.Email ?? string.Empty;
                }

                return new UserListItemDto
                {
                    Id = u.Id,
                    Email = u.Email ?? string.Empty,
                    UserName = u.UserName ?? string.Empty,
                    FullName = fullName,
                    PhoneNumber = u.PhoneNumber,
                    AvatarUrl = u.AvatarUrl,
                    IsActive = u.IsActive,
                    LockoutEnd = u.LockoutEnd,
                    IsLocked = isLocked,
                    LockoutDaysRemaining = daysRemaining,
                    TotalOrders = stats?.TotalOrders ?? 0,
                    TotalSpent = stats?.TotalSpent ?? 0
                };
            }).ToList();

            return new PagedList<UserListItemDto>(items, totalCount, request.PageNumber, request.PageSize);
        }

        public async Task<UserDetailDto> GetUserByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null)
            {
                throw new NotFoundException("Không tìm thấy thông tin người dùng.");
            }

            var now = DateTimeOffset.UtcNow;
            var isLocked = !user.IsActive || (user.LockoutEnd.HasValue && user.LockoutEnd.Value > now);
            int? daysRemaining = null;
            if (user.LockoutEnd.HasValue && user.LockoutEnd.Value > now)
            {
                var diff = user.LockoutEnd.Value - now;
                daysRemaining = Math.Max(1, (int)Math.Ceiling(diff.TotalDays));
            }

            var orders = await _dbContext.Orders.AsNoTracking()
                .Where(o => o.UserId == id)
                .ToListAsync(cancellationToken);

            var fullName = $"{user.FirstName} {user.LastName}".Trim();
            if (string.IsNullOrWhiteSpace(fullName))
            {
                fullName = user.UserName ?? user.Email ?? string.Empty;
            }

            return new UserDetailDto
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                UserName = user.UserName ?? string.Empty,
                FirstName = user.FirstName ?? string.Empty,
                LastName = user.LastName ?? string.Empty,
                FullName = fullName,
                PhoneNumber = user.PhoneNumber,
                AvatarUrl = user.AvatarUrl,
                IsActive = user.IsActive,
                EmailConfirmed = user.EmailConfirmed,
                LockoutEnd = user.LockoutEnd,
                IsLocked = isLocked,
                LockoutDaysRemaining = daysRemaining,
                TotalOrders = orders.Count,
                TotalSpent = orders.Sum(o => o.TotalAmount),
                LastOrderDate = orders.OrderByDescending(o => o.PlacedAt).Select(o => (DateTime?)o.PlacedAt.DateTime).FirstOrDefault()
            };
        }

        public async Task<int> CreateUserAsync(CreateUserByAdminRequest request, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                throw new BusinessRuleException("Địa chỉ email và mật khẩu là bắt buộc.");
            }

            if (string.IsNullOrWhiteSpace(request.FullName))
            {
                throw new BusinessRuleException("Họ và tên người dùng là bắt buộc.");
            }

            if (!string.IsNullOrWhiteSpace(request.ConfirmPassword) && request.Password != request.ConfirmPassword)
            {
                throw new BusinessRuleException("Xác nhận mật khẩu không khớp với mật khẩu mới.");
            }

            var cleanEmail = request.Email.Trim().ToLower();
            var cleanUserName = string.IsNullOrWhiteSpace(request.UserName)
                ? cleanEmail
                : request.UserName.Trim();

            var existingByEmail = await _userManager.FindByEmailAsync(cleanEmail);
            if (existingByEmail != null)
            {
                throw new BusinessRuleException($"Địa chỉ email '{cleanEmail}' đã tồn tại trong hệ thống. Vui lòng sử dụng địa chỉ email khác.");
            }

            var existingByName = await _userManager.FindByNameAsync(cleanUserName);
            if (existingByName != null)
            {
                throw new BusinessRuleException($"Tên đăng nhập '{cleanUserName}' đã được sử dụng. Vui lòng chọn tên đăng nhập khác.");
            }

            var (firstName, lastName) = SplitFullName(request.FullName);
            var user = new ApplicationUser
            {
                FirstName = firstName,
                LastName = lastName,
                Email = cleanEmail,
                UserName = cleanUserName,
                PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber.Trim(),
                EmailConfirmed = true,
                IsActive = true,
                LockoutEnabled = true
            };

            var createResult = await _userManager.CreateAsync(user, request.Password);
            if (!createResult.Succeeded)
            {
                throw new BusinessRuleException(FormatIdentityErrors(createResult.Errors));
            }

            await _userManager.AddToRoleAsync(user, RoleConstants.User);
            return user.Id;
        }

        public async Task UpdateUserAsync(int id, UpdateUserByAdminRequest request, CancellationToken cancellationToken = default)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null)
            {
                throw new NotFoundException("Không tìm thấy thông tin người dùng.");
            }

            if (await _userManager.IsInRoleAsync(user, RoleConstants.SuperAdmin))
            {
                throw new BusinessRuleException("Không được phép chỉnh sửa tài khoản Quản trị viên tối cao.");
            }

            if (string.IsNullOrWhiteSpace(request.FullName))
            {
                throw new BusinessRuleException("Họ và tên không được để trống.");
            }

            var (firstName, lastName) = SplitFullName(request.FullName);
            user.FirstName = firstName;
            user.LastName = lastName;
            user.PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber.Trim();

            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
            {
                throw new BusinessRuleException(FormatIdentityErrors(updateResult.Errors));
            }
        }

        public async Task LockUserAsync(int id, LockUserRequest request, CancellationToken cancellationToken = default)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null)
            {
                throw new NotFoundException("Không tìm thấy thông tin người dùng.");
            }

            if (await _userManager.IsInRoleAsync(user, RoleConstants.SuperAdmin))
            {
                throw new BusinessRuleException("Không được phép khóa tài khoản Quản trị viên tối cao.");
            }

            var days = request.Days <= 0 ? 7 : request.Days;
            user.LockoutEnabled = true;
            user.LockoutEnd = DateTimeOffset.UtcNow.AddDays(days);

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                throw new BusinessRuleException(FormatIdentityErrors(result.Errors));
            }

            var activeTokens = await _dbContext.RefreshTokens
                .Where(rt => rt.UserId == user.Id && !rt.IsRevoked)
                .ToListAsync(cancellationToken);

            foreach (var token in activeTokens)
            {
                token.IsRevoked = true;
                token.RevokedAt = DateTime.UtcNow;
            }

            if (activeTokens.Any())
            {
                await _dbContext.SaveChangesAsync(cancellationToken);
            }
        }

        public async Task UnlockUserAsync(int id, CancellationToken cancellationToken = default)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null)
            {
                throw new NotFoundException("Không tìm thấy thông tin người dùng.");
            }

            user.LockoutEnd = null;
            user.IsActive = true;
            user.AccessFailedCount = 0;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                throw new BusinessRuleException(FormatIdentityErrors(result.Errors));
            }
        }

        public async Task ResetPasswordAsync(int id, ResetPasswordByAdminRequest request, CancellationToken cancellationToken = default)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null)
            {
                throw new NotFoundException("Không tìm thấy thông tin người dùng.");
            }

            if (await _userManager.IsInRoleAsync(user, RoleConstants.SuperAdmin))
            {
                throw new BusinessRuleException("Không được phép đặt lại mật khẩu cho tài khoản Quản trị viên tối cao.");
            }

            if (string.IsNullOrWhiteSpace(request.NewPassword))
            {
                throw new BusinessRuleException("Mật khẩu mới không được để trống.");
            }

            if (request.NewPassword != request.ConfirmPassword)
            {
                throw new BusinessRuleException("Xác nhận mật khẩu không khớp.");
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var resetResult = await _userManager.ResetPasswordAsync(user, token, request.NewPassword);
            if (!resetResult.Succeeded)
            {
                throw new BusinessRuleException(FormatIdentityErrors(resetResult.Errors));
            }

            var activeTokens = await _dbContext.RefreshTokens
                .Where(rt => rt.UserId == user.Id && !rt.IsRevoked)
                .ToListAsync(cancellationToken);

            foreach (var rt in activeTokens)
            {
                rt.IsRevoked = true;
                rt.RevokedAt = DateTime.UtcNow;
            }

            if (activeTokens.Any())
            {
                await _dbContext.SaveChangesAsync(cancellationToken);
            }
        }

        private static string FormatIdentityErrors(IEnumerable<IdentityError> errors)
        {
            var messages = new List<string>();
            foreach (var error in errors)
            {
                var msg = error.Code switch
                {
                    "DuplicateEmail" => "Địa chỉ email này đã tồn tại trong hệ thống. Vui lòng sử dụng địa chỉ email khác.",
                    "DuplicateUserName" => "Tên đăng nhập này đã được sử dụng. Vui lòng chọn tên đăng nhập khác.",
                    "PasswordTooShort" => "Mật khẩu phải có độ dài tối thiểu 6 ký tự.",
                    "PasswordRequiresDigit" => "Mật khẩu phải chứa ít nhất 1 chữ số (0-9).",
                    "PasswordRequiresLower" => "Mật khẩu phải chứa ít nhất 1 chữ cái viết thường (a-z).",
                    "PasswordRequiresUpper" => "Mật khẩu phải chứa ít nhất 1 chữ cái viết hoa (A-Z).",
                    "PasswordRequiresNonAlphanumeric" => "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt.",
                    "InvalidEmail" => "Địa chỉ email không đúng định dạng.",
                    "InvalidUserName" => "Tên đăng nhập không hợp lệ.",
                    _ => error.Description
                };
                messages.Add(msg);
            }
            return string.Join("; ", messages.Distinct());
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
