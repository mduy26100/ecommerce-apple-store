namespace Host.Controllers.Manager
{
    [ApiController]
    [Route("api/manager/[controller]")]
    // [Authorize(Roles = "Admin,Manager")] // TODO: Bật khi kích hoạt Authorization / Roles
    public abstract class BaseManagerController : ControllerBase
    {
    }
}
