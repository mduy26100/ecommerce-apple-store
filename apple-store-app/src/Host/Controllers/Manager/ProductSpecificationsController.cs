using Application.Features.Catalog.ProductSpecifications.DTOs;
using Application.Features.Catalog.ProductSpecifications.Services;

namespace Host.Controllers.Manager
{
    [Tags("Manager - Product Specifications")]
    [Route("api/manager/product-specifications")]
    public class ProductSpecificationsController : BaseManagerController
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

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var result = await _specService.GetByIdAsync(id, cancellationToken);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateProductSpecificationRequest request, CancellationToken cancellationToken)
        {
            var id = await _specService.CreateAsync(request, cancellationToken);
            return Ok(new { id });
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateProductSpecificationRequest request, CancellationToken cancellationToken)
        {
            await _specService.UpdateAsync(id, request, cancellationToken);
            return Ok();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            await _specService.DeleteAsync(id, cancellationToken);
            return Ok();
        }
    }
}
