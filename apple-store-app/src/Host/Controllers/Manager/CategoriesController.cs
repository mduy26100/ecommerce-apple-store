using Application.Features.Catalog.Categories.DTOs;
using Application.Features.Catalog.Categories.Services;

namespace Host.Controllers.Manager
{
    [Tags("Manager - Categories")]
    [Route("api/manager/categories")]
    public class CategoriesController : BaseManagerController
    {
        private readonly ICategoryService _categoryService;

        public CategoriesController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpGet]
        public async Task<IActionResult> GetPaged([FromQuery] CategoryPagedRequest request, CancellationToken cancellationToken)
        {
            var result = await _categoryService.GetPagedAsync(request, cancellationToken);
            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var result = await _categoryService.GetByIdAsync(id, cancellationToken);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCategoryRequest request, CancellationToken cancellationToken)
        {
            await _categoryService.CreateAsync(request, cancellationToken);
            return Ok();
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateCategoryRequest request, CancellationToken cancellationToken)
        {
            await _categoryService.UpdateAsync(id, request, cancellationToken);
            return Ok();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            await _categoryService.DeleteAsync(id, cancellationToken);
            return Ok();
        }
    }
}
