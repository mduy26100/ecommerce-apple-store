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
    }
}
