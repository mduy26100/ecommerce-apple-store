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
        public async Task<IActionResult> GetCards([FromQuery] int? categoryId, [FromQuery] int limit = 100, CancellationToken cancellationToken = default)
        {
            var result = await _productService.GetCardsAsync(categoryId, limit, cancellationToken);
            return Ok(result);
        }
    }
}
