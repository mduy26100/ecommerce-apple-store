using Application.Features.Catalog.Categories.DTOs;
using Application.Features.Catalog.Categories.Services;

namespace Host.Controllers.Manager
{
    public class CreateCategoryForm
    {
        public string Name { get; set; } = default!;
        public string Slug { get; set; } = default!;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public int DisplayOrder { get; set; } = 0;
        public bool IsActive { get; set; } = true;
        public IFormFile? Image { get; set; }
    }

    public class UpdateCategoryForm
    {
        public string Name { get; set; } = default!;
        public string Slug { get; set; } = default!;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public IFormFile? Image { get; set; }
    }

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
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Create([FromForm] CreateCategoryForm form, CancellationToken cancellationToken)
        {
            var request = new CreateCategoryRequest
            {
                Name = form.Name,
                Slug = form.Slug,
                Description = form.Description,
                ImageUrl = form.ImageUrl,
                DisplayOrder = form.DisplayOrder,
                IsActive = form.IsActive,
                ImageStream = form.Image?.OpenReadStream(),
                ImageFileName = form.Image?.FileName,
                ImageContentType = form.Image?.ContentType
            };

            await _categoryService.CreateAsync(request, cancellationToken);
            return Ok();
        }

        [HttpPut("{id:int}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Update(int id, [FromForm] UpdateCategoryForm form, CancellationToken cancellationToken)
        {
            var request = new UpdateCategoryRequest
            {
                Name = form.Name,
                Slug = form.Slug,
                Description = form.Description,
                ImageUrl = form.ImageUrl,
                DisplayOrder = form.DisplayOrder,
                IsActive = form.IsActive,
                ImageStream = form.Image?.OpenReadStream(),
                ImageFileName = form.Image?.FileName,
                ImageContentType = form.Image?.ContentType
            };

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
