using Application.Features.Catalog.ProductImages.DTOs;
using Application.Features.Catalog.ProductImages.Services;

namespace Host.Controllers.Manager
{
    public class CreateProductImageForm
    {
        public int ProductId { get; set; }
        public int? OptionValueId { get; set; }
        public string? AltText { get; set; }
        public int DisplayOrder { get; set; } = 0;
        public bool IsPrimary { get; set; } = false;
        public IFormFile? File { get; set; }
    }

    public class CreateBatchProductImagesForm
    {
        public int ProductId { get; set; }
        public int? OptionValueId { get; set; }
        public List<IFormFile> Files { get; set; } = new();
    }

    [Tags("Manager - Product Images")]
    [Route("api/manager/product-images")]
    public class ProductImagesController : BaseManagerController
    {
        private readonly IProductImageService _imageService;

        public ProductImagesController(IProductImageService imageService)
        {
            _imageService = imageService;
        }

        [HttpGet("by-product/{productId:int}")]
        public async Task<IActionResult> GetByProduct(int productId, [FromQuery] int? optionValueId, CancellationToken cancellationToken)
        {
            var result = await _imageService.GetByProductIdAsync(productId, optionValueId, cancellationToken);
            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var result = await _imageService.GetByIdAsync(id, cancellationToken);
            return Ok(result);
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Create([FromForm] CreateProductImageForm form, CancellationToken cancellationToken)
        {
            if (form.File == null)
            {
                return BadRequest("Vui lòng đính kèm tệp hình ảnh.");
            }

            var request = new CreateProductImageRequest
            {
                ProductId = form.ProductId,
                OptionValueId = form.OptionValueId,
                AltText = form.AltText,
                DisplayOrder = form.DisplayOrder,
                IsPrimary = form.IsPrimary,
                ImageStream = form.File.OpenReadStream(),
                ImageFileName = form.File.FileName,
                ImageContentType = form.File.ContentType
            };

            var id = await _imageService.CreateAsync(request, cancellationToken);
            return Ok(new { id });
        }

        [HttpPost("batch")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateBatch([FromForm] CreateBatchProductImagesForm form, CancellationToken cancellationToken)
        {
            var request = new CreateBatchProductImagesRequest
            {
                ProductId = form.ProductId,
                OptionValueId = form.OptionValueId,
                Files = form.Files.Select(f => new ProductImageFileItem
                {
                    Stream = f.OpenReadStream(),
                    FileName = f.FileName,
                    ContentType = f.ContentType
                }).ToList()
            };

            var results = await _imageService.CreateBatchAsync(request, cancellationToken);
            return Ok(results);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateProductImageRequest request, CancellationToken cancellationToken)
        {
            await _imageService.UpdateAsync(id, request, cancellationToken);
            return Ok();
        }

        [HttpPut("{id:int}/primary")]
        [HttpPatch("{id:int}/primary")]
        public async Task<IActionResult> SetPrimary(int id, CancellationToken cancellationToken)
        {
            await _imageService.SetPrimaryAsync(id, cancellationToken);
            return Ok();
        }

        [HttpPut("by-product/{productId:int}/default-color/{optionValueId:int}")]
        public async Task<IActionResult> SetDefaultColor(int productId, int optionValueId, CancellationToken cancellationToken)
        {
            await _imageService.SetDefaultColorAsync(productId, optionValueId, cancellationToken);
            return Ok();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            await _imageService.DeleteAsync(id, cancellationToken);
            return Ok();
        }
    }
}
