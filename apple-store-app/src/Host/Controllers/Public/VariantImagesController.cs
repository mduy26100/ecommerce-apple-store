using Application.Features.Catalog.VariantImages.DTOs;
using Application.Features.Catalog.VariantImages.Services;

namespace Host.Controllers.Public
{
    [Tags("Public - Variant Images")]
    [Route("api/variant-images")]
    public class VariantImagesController : BasePublicController
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
    }
}
