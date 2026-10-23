using Application.Features.Catalog.ProductOptions.DTOs;
using Application.Features.Catalog.ProductOptions.Services;

namespace Host.Controllers.Manager
{
    [Tags("Manager - Product Options")]
    [Route("api/manager/product-options")]
    public class ProductOptionsController : BaseManagerController
    {
        private readonly IProductOptionService _optionService;

        public ProductOptionsController(IProductOptionService optionService)
        {
            _optionService = optionService;
        }

        [HttpGet("by-product/{productId:int}")]
        public async Task<IActionResult> GetByProduct(int productId, CancellationToken cancellationToken)
        {
            var result = await _optionService.GetByProductIdAsync(productId, cancellationToken);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateOption([FromBody] CreateProductOptionRequest request, CancellationToken cancellationToken)
        {
            var id = await _optionService.CreateOptionAsync(request, cancellationToken);
            return Ok(new { id });
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateOption(int id, [FromBody] UpdateProductOptionRequest request, CancellationToken cancellationToken)
        {
            await _optionService.UpdateOptionAsync(id, request, cancellationToken);
            return Ok();
        }

        [HttpPost("values")]
        public async Task<IActionResult> CreateOptionValue([FromBody] CreateProductOptionValueRequest request, CancellationToken cancellationToken)
        {
            var id = await _optionService.CreateOptionValueAsync(request, cancellationToken);
            return Ok(new { id });
        }

        [HttpPut("values/{id:int}")]
        public async Task<IActionResult> UpdateOptionValue(int id, [FromBody] UpdateProductOptionValueRequest request, CancellationToken cancellationToken)
        {
            await _optionService.UpdateOptionValueAsync(id, request, cancellationToken);
            return Ok();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteOption(int id, CancellationToken cancellationToken)
        {
            await _optionService.DeleteOptionAsync(id, cancellationToken);
            return Ok();
        }

        [HttpDelete("values/{id:int}")]
        public async Task<IActionResult> DeleteOptionValue(int id, CancellationToken cancellationToken)
        {
            await _optionService.DeleteOptionValueAsync(id, cancellationToken);
            return Ok();
        }
    }
}
