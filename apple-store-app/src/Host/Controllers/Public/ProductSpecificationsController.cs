using Application.Features.Catalog.ProductSpecifications.DTOs;
using Application.Features.Catalog.ProductSpecifications.Services;

namespace Host.Controllers.Public
{
    [Tags("Public - Product Specifications")]
    [Route("api/product-specifications")]
    [Route("api/public/product-specifications")]
    public class ProductSpecificationsController : BasePublicController
    {
        private readonly IProductSpecificationService _specService;

        public ProductSpecificationsController(IProductSpecificationService specService)
        {
            _specService = specService;
        }

        [HttpGet("by-product/{productId:int}")]
        public async Task<IActionResult> GetByProduct(int productId, CancellationToken cancellationToken)
        {
            var result = await _specService.GetByProductIdAsync(productId, cancellationToken);
            return Ok(result);
        }
    }
}
