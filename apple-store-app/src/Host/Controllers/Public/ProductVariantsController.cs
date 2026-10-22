using Application.Features.Catalog.ProductVariants.DTOs;
using Application.Features.Catalog.ProductVariants.Services;

namespace Host.Controllers.Public
{
    [Tags("Public - Product Variants")]
    [Route("api/product-variants")]
    public class ProductVariantsController : BasePublicController
    {
        private readonly IProductVariantService _variantService;

        public ProductVariantsController(IProductVariantService variantService)
        {
            _variantService = variantService;
        }

        [HttpGet("by-product/{productId:int}")]
        public async Task<IActionResult> GetByProduct(int productId, CancellationToken cancellationToken)
        {
            var result = await _variantService.GetByProductIdAsync(productId, cancellationToken);
            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var result = await _variantService.GetByIdAsync(id, cancellationToken);
            return Ok(result);
        }
    }
}
