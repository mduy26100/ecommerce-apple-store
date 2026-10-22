namespace Application.Features.Identity.Services
{
    public interface IJwtTokenGenerator
    {
        string GenerateAccessToken(IEnumerable<Claim> claims);
        string GenerateRefreshToken();
        DateTime GetRefreshTokenExpiration();
        ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
    }
}
