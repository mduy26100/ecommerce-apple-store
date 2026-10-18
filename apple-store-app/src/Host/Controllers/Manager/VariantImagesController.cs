using Application.Features.Catalog.VariantImages.DTOs;
using Application.Features.Catalog.VariantImages.Services;

namespace Host.Controllers.Manager
{
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
        public async Task<IActionResult> Create([FromBody] CreateVariantImageRequest request, CancellationToken cancellationToken)
        {
            var id = await _imageService.CreateAsync(request, cancellationToken);
            return Ok(new { id });
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
