using Application.Features.Identity.Services;
using Infrastructure.Settings;

namespace Infrastructure.Identity.Services
{
    public class AuthCookieService : IAuthCookieService
    {
        private const string RefreshTokenCookieName = "refreshToken";
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly JwtSettings _jwtSettings;

        public AuthCookieService(IHttpContextAccessor httpContextAccessor, IOptions<JwtSettings> jwtOptions)
        {
            _httpContextAccessor = httpContextAccessor;
            _jwtSettings = jwtOptions.Value;
        }

        public void AppendRefreshTokenCookie(string refreshToken)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = false,
                SameSite = SameSiteMode.Lax,
                Expires = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays),
                Path = "/"
            };

            _httpContextAccessor.HttpContext?.Response.Cookies.Append(RefreshTokenCookieName, refreshToken, cookieOptions);
        }

        public string? GetRefreshTokenFromCookie()
        {
            return _httpContextAccessor.HttpContext?.Request.Cookies[RefreshTokenCookieName];
        }

        public void DeleteRefreshTokenCookie()
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = false,
                SameSite = SameSiteMode.Lax,
                Expires = DateTime.UtcNow.AddDays(-1),
                Path = "/"
            };

            _httpContextAccessor.HttpContext?.Response.Cookies.Append(RefreshTokenCookieName, string.Empty, cookieOptions);
        }
    }
}
