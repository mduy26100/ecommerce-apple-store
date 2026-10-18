using Application.Features.Catalog.Products.DTOs;
using Application.Features.Catalog.Products.Services;

namespace Host.Controllers.Manager
{
    [Tags("Manager - Products")]
    [Route("api/manager/products")]
    public class ProductsController : BaseManagerController
    {
        private readonly IProductService _productService;

        public ProductsController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        public async Task<IActionResult> GetPaged([FromQuery] ProductPagedRequest request, CancellationToken cancellationToken)
        {
            var result = await _productService.GetPagedAsync(request, cancellationToken);
            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var result = await _productService.GetByIdAsync(id, cancellationToken);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateProductRequest request, CancellationToken cancellationToken)
        {
            var id = await _productService.CreateAsync(request, cancellationToken);
            return Ok(new { id });
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateProductRequest request, CancellationToken cancellationToken)
        {
            await _productService.UpdateAsync(id, request, cancellationToken);
            return Ok();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            await _productService.DeleteAsync(id, cancellationToken);
            return Ok();
        }
    }
}
