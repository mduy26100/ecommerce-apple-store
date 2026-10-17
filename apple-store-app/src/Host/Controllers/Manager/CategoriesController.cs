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

        /// <summary>
        /// Lấy danh sách danh mục có phân trang, tìm kiếm và lọc trạng thái (dành cho quản trị).
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetPaged([FromQuery] CategoryPagedRequest request, CancellationToken cancellationToken)
        {
            var result = await _categoryService.GetPagedAsync(request, cancellationToken);
            return Ok(result);
        }

        /// <summary>
        /// Lấy chi tiết danh mục theo Id phục vụ form chỉnh sửa.
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var result = await _categoryService.GetByIdAsync(id, cancellationToken);
            return Ok(result);
        }

        /// <summary>
        /// Tạo mới danh mục sản phẩm.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCategoryRequest request, CancellationToken cancellationToken)
        {
            await _categoryService.CreateAsync(request, cancellationToken);
            return Ok();
        }

        /// <summary>
        /// Cập nhật thông tin danh mục sản phẩm.
        /// </summary>
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateCategoryRequest request, CancellationToken cancellationToken)
        {
            await _categoryService.UpdateAsync(id, request, cancellationToken);
            return Ok();
        }

        /// <summary>
        /// Xoá mềm danh mục sản phẩm.
        /// </summary>
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            await _categoryService.DeleteAsync(id, cancellationToken);
            return Ok();
        }
    }
}
