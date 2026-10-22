namespace Application.Features.Identity.Services
{
    public interface IAuthCookieService
    {
        void AppendRefreshTokenCookie(string refreshToken);
        string? GetRefreshTokenFromCookie();
        void DeleteRefreshTokenCookie();
    }
}
