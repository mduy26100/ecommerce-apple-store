using Application.Features.Catalog.Products.DTOs;
using Application.Features.Catalog.Products.Services;

namespace Host.Controllers.Public
{
    [Tags("Public - Products")]
    [Route("api/products")]
    public class ProductsController : BasePublicController
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

        [HttpGet("slug/{slug}")]
        public async Task<IActionResult> GetBySlug(string slug, CancellationToken cancellationToken)
        {
            var result = await _productService.GetBySlugAsync(slug, cancellationToken);
            return Ok(result);
        }
    }
}
