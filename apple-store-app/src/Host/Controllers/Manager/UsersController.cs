using Application.Features.Identity.DTOs;
using Application.Features.Identity.Services;

namespace Host.Controllers.Manager
{
    [Tags("Manager - Users")]
    [Route("api/manager/users")]
    public class UsersController : BaseManagerController
    {
        private readonly IUserManagementService _userService;

        public UsersController(IUserManagementService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetPaged([FromQuery] UserPagedRequest request, CancellationToken cancellationToken)
        {
            var result = await _userService.GetPagedUsersAsync(request, cancellationToken);
            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var result = await _userService.GetUserByIdAsync(id, cancellationToken);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateUserByAdminRequest request, CancellationToken cancellationToken)
        {
            var id = await _userService.CreateUserAsync(request, cancellationToken);
            return Ok(new { id });
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateUserByAdminRequest request, CancellationToken cancellationToken)
        {
            await _userService.UpdateUserAsync(id, request, cancellationToken);
            return Ok();
        }

        [HttpPost("{id:int}/lock")]
        public async Task<IActionResult> Lock(int id, [FromBody] LockUserRequest request, CancellationToken cancellationToken)
        {
            await _userService.LockUserAsync(id, request, cancellationToken);
            return Ok();
        }

        [HttpPost("{id:int}/unlock")]
        public async Task<IActionResult> Unlock(int id, CancellationToken cancellationToken)
        {
            await _userService.UnlockUserAsync(id, cancellationToken);
            return Ok();
        }

        [HttpPost("{id:int}/reset-password")]
        public async Task<IActionResult> ResetPassword(int id, [FromBody] ResetPasswordByAdminRequest request, CancellationToken cancellationToken)
        {
            await _userService.ResetPasswordAsync(id, request, cancellationToken);
            return Ok();
        }
    }
}

