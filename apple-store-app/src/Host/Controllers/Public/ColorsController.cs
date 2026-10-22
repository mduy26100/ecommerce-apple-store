using Application.Features.Catalog.Colors.DTOs;
using Application.Features.Catalog.Colors.Services;

namespace Host.Controllers.Public
{
    [Tags("Public - Colors")]
    [Route("api/colors")]
    public class ColorsController : BasePublicController
    {
        private readonly IColorService _colorService;

        public ColorsController(IColorService colorService)
        {
            _colorService = colorService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var result = await _colorService.GetAllAsync(cancellationToken);
            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var result = await _colorService.GetByIdAsync(id, cancellationToken);
            return Ok(result);
        }
    }
}
