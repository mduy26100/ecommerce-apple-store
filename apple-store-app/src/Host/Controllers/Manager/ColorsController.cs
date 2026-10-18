using Application.Features.Catalog.Colors.DTOs;
using Application.Features.Catalog.Colors.Services;

namespace Host.Controllers.Manager
{
    [Tags("Manager - Colors")]
    [Route("api/manager/colors")]
    public class ColorsController : BaseManagerController
    {
        private readonly IColorService _colorService;

        public ColorsController(IColorService colorService)
        {
            _colorService = colorService;
        }

        [HttpGet]
        public async Task<IActionResult> GetPaged([FromQuery] ColorPagedRequest request, CancellationToken cancellationToken)
        {
            var result = await _colorService.GetPagedAsync(request, cancellationToken);
            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var result = await _colorService.GetByIdAsync(id, cancellationToken);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateColorRequest request, CancellationToken cancellationToken)
        {
            await _colorService.CreateAsync(request, cancellationToken);
            return Ok();
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateColorRequest request, CancellationToken cancellationToken)
        {
            await _colorService.UpdateAsync(id, request, cancellationToken);
            return Ok();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            await _colorService.DeleteAsync(id, cancellationToken);
            return Ok();
        }
    }
}
