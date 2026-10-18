using Application.Features.Catalog.ProductVariants.DTOs;
using Application.Features.Catalog.ProductVariants.Services;

namespace Host.Controllers.Manager
{
    [Tags("Manager - Product Variants")]
    [Route("api/manager/product-variants")]
    public class ProductVariantsController : BaseManagerController
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

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateProductVariantRequest request, CancellationToken cancellationToken)
        {
            var id = await _variantService.CreateAsync(request, cancellationToken);
            return Ok(new { id });
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateProductVariantRequest request, CancellationToken cancellationToken)
        {
            await _variantService.UpdateAsync(id, request, cancellationToken);
            return Ok();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            await _variantService.DeleteAsync(id, cancellationToken);
            return Ok();
        }
    }
}
