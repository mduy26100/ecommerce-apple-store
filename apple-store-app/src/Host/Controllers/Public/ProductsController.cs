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

        [HttpGet("cards")]
        public async Task<IActionResult> GetCards([FromQuery] ProductCardPagedRequest request, CancellationToken cancellationToken = default)
        {
            var result = await _productService.GetCardsPagedAsync(request, cancellationToken);
            return Ok(result);
        }

        [HttpGet("showcase")]
        public async Task<IActionResult> GetHomeShowcase([FromQuery] int countPerCategory = 4, CancellationToken cancellationToken = default)
        {
            var result = await _productService.GetHomeShowcaseAsync(countPerCategory, cancellationToken);
            return Ok(result);
        }

        [HttpGet("random")]
        public async Task<IActionResult> GetRandom([FromQuery] int count = 12, [FromQuery] int? excludeId = null, CancellationToken cancellationToken = default)
        {
            var result = await _productService.GetRandomCardsAsync(count, excludeId, cancellationToken);
            return Ok(result);
        }

        [HttpGet("{slug}")]
        public async Task<IActionResult> GetBySlug([FromRoute] string slug, CancellationToken cancellationToken = default)
        {
            var result = await _productService.GetBySlugAsync(slug, cancellationToken);
            return Ok(result);
        }
    }
}
