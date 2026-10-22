using Application.Features.Identity.DTOs;
using Application.Features.Identity.Services;
using Domain.Exceptions;

namespace Host.Controllers.Public
{
    [Tags("Public - Users")]
    [Route("api/users")]
    [Route("api/v1/users")]
    public class UsersController : BasePublicController
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetProfile(CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            var profile = await _userService.GetProfileAsync(userId, cancellationToken);
            return Ok(profile);
        }

        [Authorize]
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            await _userService.UpdateProfileAsync(userId, request, cancellationToken);
            return Ok();
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub");

            if (!int.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedException("Phiên xác thực người dùng không hợp lệ.");
            }

            return userId;
        }
    }
}
