using Application.Features.Catalog.VariantImages.DTOs;
using Application.Features.Catalog.VariantImages.Services;

namespace Host.Controllers.Manager
{
    public class CreateVariantImageForm
    {
        public int ProductVariantId { get; set; }
        public string? AltText { get; set; }
        public int DisplayOrder { get; set; } = 0;
        public bool IsPrimary { get; set; } = false;
        public IFormFile? File { get; set; }
    }

    public class CreateBatchVariantImagesForm
    {
        public int ProductVariantId { get; set; }
        public List<IFormFile> Files { get; set; } = new();
        public string? AltText { get; set; }
    }

    [Tags("Manager - Variant Images")]
    [Route("api/manager/variant-images")]
    public class VariantImagesController : BaseManagerController
    {
        private readonly IVariantImageService _imageService;

        public VariantImagesController(IVariantImageService imageService)
        {
            _imageService = imageService;
        }

        [HttpGet("by-variant/{variantId:int}")]
        public async Task<IActionResult> GetByVariant(int variantId, CancellationToken cancellationToken)
        {
            var result = await _imageService.GetByVariantIdAsync(variantId, cancellationToken);
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
        public async Task<IActionResult> Create([FromForm] CreateVariantImageForm form, CancellationToken cancellationToken)
        {
            var request = new CreateVariantImageRequest
            {
                ProductVariantId = form.ProductVariantId,
                AltText = form.AltText,
                DisplayOrder = form.DisplayOrder,
                IsPrimary = form.IsPrimary,
                ImageStream = form.File?.OpenReadStream(),
                ImageFileName = form.File?.FileName,
                ImageContentType = form.File?.ContentType
            };

            var id = await _imageService.CreateAsync(request, cancellationToken);
            return Ok(new { id });
        }

        [HttpPost("batch")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateBatch([FromForm] CreateBatchVariantImagesForm form, CancellationToken cancellationToken)
        {
            var request = new CreateBatchVariantImagesRequest
            {
                ProductVariantId = form.ProductVariantId,
                Files = form.Files.Select(f => new VariantImageFileItem
                {
                    Stream = f.OpenReadStream(),
                    FileName = f.FileName,
                    ContentType = f.ContentType,
                    AltText = form.AltText
                }).ToList()
            };

            var results = await _imageService.CreateBatchAsync(request, cancellationToken);
            return Ok(results);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateVariantImageRequest request, CancellationToken cancellationToken)
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

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            await _imageService.DeleteAsync(id, cancellationToken);
            return Ok();
        }
    }
}
