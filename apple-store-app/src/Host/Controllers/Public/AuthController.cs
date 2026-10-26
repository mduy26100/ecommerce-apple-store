using Application.Features.Identity.DTOs;
using Application.Features.Identity.Services;
using Domain.Exceptions;

namespace Host.Controllers.Public
{
    [Tags("Public - Auth")]
    [Route("api/auth")]
    public class AuthController : BasePublicController
    {
        private readonly IAuthService _authService;
        private readonly IAuthCookieService _authCookieService;
        private readonly IUserService _userService;

        public AuthController(
            IAuthService authService,
            IAuthCookieService authCookieService,
            IUserService userService)
        {
            _authService = authService;
            _authCookieService = authCookieService;
            _userService = userService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
        {
            var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString();
            var result = await _authService.RegisterAsync(request, clientIp, cancellationToken);
            _authCookieService.AppendRefreshTokenCookie(result.RefreshToken);
            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
        {
            var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString();
            var result = await _authService.LoginAsync(request, clientIp, cancellationToken);
            _authCookieService.AppendRefreshTokenCookie(result.RefreshToken);
            return Ok(result);
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout([FromBody] RefreshTokenRequest? request, CancellationToken cancellationToken)
        {
            var refreshToken = _authCookieService.GetRefreshTokenFromCookie() ?? request?.RefreshToken;
            if (!string.IsNullOrEmpty(refreshToken))
            {
                await _authService.LogoutAsync(refreshToken, cancellationToken);
            }

            _authCookieService.DeleteRefreshTokenCookie();
            return Ok();
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest? request, CancellationToken cancellationToken)
        {
            var refreshToken = _authCookieService.GetRefreshTokenFromCookie() ?? request?.RefreshToken;
            if (string.IsNullOrEmpty(refreshToken))
            {
                throw new UnauthorizedException("Phiên đăng nhập đã hết hạn hoặc không tìm thấy refresh token.");
            }

            var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString();
            var result = await _authService.RefreshTokenAsync(refreshToken, clientIp, cancellationToken);
            _authCookieService.AppendRefreshTokenCookie(result.RefreshToken);
            return Ok(result);
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString();
            var result = await _authService.ChangePasswordAsync(userId, request, clientIp, cancellationToken);
            _authCookieService.AppendRefreshTokenCookie(result.RefreshToken);
            return Ok(result);
        }

        [Authorize]
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            await _userService.UpdateProfileAsync(userId, request, cancellationToken);
            return Ok();
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser(CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            var profile = await _userService.GetProfileAsync(userId, cancellationToken);
            return Ok(profile);
        }
    }
}
