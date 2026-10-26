using Domain.Exceptions;

namespace Host.Controllers.Public
{
    [ApiController]
    public abstract class BasePublicController : ControllerBase
    {
        protected int? GetCurrentUserIdOptional()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub");

            if (int.TryParse(userIdClaim, out var userId))
            {
                return userId;
            }

            return null;
        }

        protected int GetCurrentUserId()
        {
            var userId = GetCurrentUserIdOptional();
            if (!userId.HasValue)
            {
                throw new UnauthorizedException("Phiên xác thực người dùng không hợp lệ.");
            }

            return userId.Value;
        }
    }
}
