using Application.Features.Identity.DTOs;
using Application.Features.Identity.Services;
using Domain.Constants;
using Domain.Exceptions;
using Infrastructure.Identity.Models;
using Infrastructure.Persistence;
using Infrastructure.Settings;

namespace Infrastructure.Identity.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;
        private readonly AppDbContext _dbContext;
        private readonly JwtSettings _jwtSettings;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            IJwtTokenGenerator jwtTokenGenerator,
            AppDbContext dbContext,
            IOptions<JwtSettings> jwtOptions)
        {
            _userManager = userManager;
            _jwtTokenGenerator = jwtTokenGenerator;
            _dbContext = dbContext;
            _jwtSettings = jwtOptions.Value;
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequest request, string? ipAddress = null, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(request.Identifier) || string.IsNullOrWhiteSpace(request.Password))
            {
                throw new BusinessRuleException("Tên đăng nhập hoặc mật khẩu không được để trống.");
            }

            var user = await _userManager.FindByEmailAsync(request.Identifier)
                ?? await _userManager.FindByNameAsync(request.Identifier);

            if (user == null)
            {
                throw new UnauthorizedException("Tài khoản hoặc mật khẩu không chính xác.");
            }

            if (!user.IsActive)
            {
                throw new UnauthorizedException("Tài khoản của bạn đã bị khóa.");
            }

            var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);
            if (!isPasswordValid)
            {
                throw new UnauthorizedException("Tài khoản hoặc mật khẩu không chính xác.");
            }

            return await GenerateAuthResponseAsync(user, ipAddress, cancellationToken);
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterRequest request, string? ipAddress = null, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                throw new BusinessRuleException("Email và mật khẩu là bắt buộc.");
            }

            if (string.IsNullOrWhiteSpace(request.UserName))
            {
                throw new BusinessRuleException("Tên đăng nhập là bắt buộc.");
            }

            if (!string.IsNullOrEmpty(request.ConfirmPassword) && request.Password != request.ConfirmPassword)
            {
                throw new BusinessRuleException("Xác nhận mật khẩu mới không khớp.");
            }

            var existingEmail = await _userManager.FindByEmailAsync(request.Email);
            if (existingEmail != null)
            {
                throw new ConflictException("Email này đã được sử dụng trong hệ thống.");
            }

            var existingUserName = await _userManager.FindByNameAsync(request.UserName);
            if (existingUserName != null)
            {
                throw new ConflictException("Tên đăng nhập này đã được sử dụng trong hệ thống.");
            }

            var user = new ApplicationUser
            {
                UserName = request.UserName,
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                EmailConfirmed = true,
                FirstName = request.FirstName,
                LastName = request.LastName,
                IsActive = true
            };

            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                var errorDescriptions = string.Join("; ", result.Errors.Select(e => e.Description));
                throw new BusinessRuleException($"Đăng ký không thành công: {errorDescriptions}");
            }

            await _userManager.AddToRoleAsync(user, RoleConstants.User);

            return await GenerateAuthResponseAsync(user, ipAddress, cancellationToken);
        }

        public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken, string? ipAddress = null, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
            {
                throw new UnauthorizedException("Mã refresh token không được cung cấp.");
            }

            var existingToken = await _dbContext.RefreshTokens
                .FirstOrDefaultAsync(t => t.Token == refreshToken, cancellationToken);

            if (existingToken == null || existingToken.IsRevoked || existingToken.ExpiresAt <= DateTime.UtcNow)
            {
                throw new UnauthorizedException("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            }

            var user = await _userManager.FindByIdAsync(existingToken.UserId.ToString());
            if (user == null || !user.IsActive)
            {
                throw new UnauthorizedException("Tài khoản người dùng không tồn tại hoặc đã bị vô hiệu hóa.");
            }

            existingToken.IsRevoked = true;
            existingToken.RevokedAt = DateTime.UtcNow;
            existingToken.RevokedByIp = ipAddress;

            return await GenerateAuthResponseAsync(user, ipAddress, cancellationToken);
        }

        public async Task LogoutAsync(string refreshToken, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
            {
                return;
            }

            var token = await _dbContext.RefreshTokens
                .FirstOrDefaultAsync(t => t.Token == refreshToken, cancellationToken);

            if (token != null && !token.IsRevoked)
            {
                token.IsRevoked = true;
                token.RevokedAt = DateTime.UtcNow;
                await _dbContext.SaveChangesAsync(cancellationToken);
            }
        }

        public async Task<AuthResponseDto> ChangePasswordAsync(int userId, ChangePasswordRequest request, string? ipAddress = null, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(request.CurrentPassword) || string.IsNullOrWhiteSpace(request.NewPassword))
            {
                throw new BusinessRuleException("Mật khẩu hiện tại và mật khẩu mới không được để trống.");
            }

            if (!string.IsNullOrEmpty(request.ConfirmPassword) && request.NewPassword != request.ConfirmPassword)
            {
                throw new BusinessRuleException("Xác nhận mật khẩu mới không khớp.");
            }

            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
            {
                throw new NotFoundException("Không tìm thấy thông tin người dùng.");
            }

            var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
            if (!result.Succeeded)
            {
                var errorDescriptions = string.Join("; ", result.Errors.Select(e => e.Description));
                throw new BusinessRuleException($"Đổi mật khẩu thất bại: {errorDescriptions}");
            }

            var activeTokens = await _dbContext.RefreshTokens
                .Where(t => t.UserId == user.Id && !t.IsRevoked)
                .ToListAsync(cancellationToken);

            foreach (var token in activeTokens)
            {
                token.IsRevoked = true;
                token.RevokedAt = DateTime.UtcNow;
                token.RevokedByIp = ipAddress;
            }

            return await GenerateAuthResponseAsync(user, ipAddress, cancellationToken);
        }

        private async Task<AuthResponseDto> GenerateAuthResponseAsync(ApplicationUser user, string? ipAddress, CancellationToken cancellationToken)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var primaryRole = roles.FirstOrDefault() ?? RoleConstants.User;

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim("role", role));
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var accessToken = _jwtTokenGenerator.GenerateAccessToken(claims);
            var refreshToken = _jwtTokenGenerator.GenerateRefreshToken();
            var refreshTokenExpiry = _jwtTokenGenerator.GetRefreshTokenExpiration();

            var refreshTokenEntity = new RefreshToken
            {
                UserId = user.Id,
                Token = refreshToken,
                ExpiresAt = refreshTokenExpiry,
                CreatedByIp = ipAddress,
                IsRevoked = false
            };

            _dbContext.RefreshTokens.Add(refreshTokenEntity);
            await _dbContext.SaveChangesAsync(cancellationToken);

            var fullName = $"{user.FirstName} {user.LastName}".Trim();
            if (string.IsNullOrWhiteSpace(fullName))
            {
                fullName = user.UserName ?? user.Email ?? string.Empty;
            }

            return new AuthResponseDto
            {
                AccessToken = accessToken,
                ExpiresInMinutes = _jwtSettings.AccessTokenExpirationMinutes,
                RefreshToken = refreshToken,
                User = new UserDetailsDto
                {
                    Id = user.Id.ToString(),
                    Email = user.Email ?? string.Empty,
                    FullName = fullName,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    AvatarUrl = user.AvatarUrl,
                    Role = primaryRole,
                    TenantId = null
                }
            };
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
