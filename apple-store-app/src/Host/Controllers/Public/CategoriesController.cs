using Application.Features.Catalog.Categories.DTOs;
using Application.Features.Catalog.Categories.Services;

namespace Host.Controllers.Public
{
    [Tags("Public - Categories")]
    [Route("api/categories")]
    [Route("api/public/categories")]
    public class CategoriesController : BasePublicController
    {
        private readonly ICategoryService _categoryService;

        public CategoriesController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        /// <summary>
        /// Lấy toàn bộ danh mục đang hoạt động phục vụ hiển thị menu / giao diện người dùng.
        /// </summary>
        [HttpGet]
        [HttpGet("all")]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var result = await _categoryService.GetAllAsync(cancellationToken);
            return Ok(result);
        }

        /// <summary>
        /// Lấy chi tiết danh mục theo Id.
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var result = await _categoryService.GetByIdAsync(id, cancellationToken);
            return Ok(result);
        }

        /// <summary>
        /// Lấy chi tiết danh mục theo Slug (URL thân thiện).
        /// </summary>
        [HttpGet("slug/{slug}")]
        public async Task<IActionResult> GetBySlug(string slug, CancellationToken cancellationToken)
        {
            var result = await _categoryService.GetBySlugAsync(slug, cancellationToken);
            return Ok(result);
        }
    }
}
