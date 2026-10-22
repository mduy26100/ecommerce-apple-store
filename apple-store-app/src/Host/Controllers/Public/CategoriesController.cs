using Application.Features.Catalog.Categories.DTOs;
using Application.Features.Catalog.Categories.Services;

namespace Host.Controllers.Public
{
    [Tags("Public - Categories")]
    [Route("api/categories")]
    public class CategoriesController : BasePublicController
    {
        private readonly ICategoryService _categoryService;

        public CategoriesController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var result = await _categoryService.GetAllAsync(cancellationToken);
            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var result = await _categoryService.GetByIdAsync(id, cancellationToken);
            return Ok(result);
        }

        [HttpGet("slug/{slug}")]
        public async Task<IActionResult> GetBySlug(string slug, CancellationToken cancellationToken)
        {
            var result = await _categoryService.GetBySlugAsync(slug, cancellationToken);
            return Ok(result);
        }
    }
}
