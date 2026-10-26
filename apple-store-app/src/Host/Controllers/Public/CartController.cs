using Application.Features.Sales.Carts.DTOs;
using Application.Features.Sales.Carts.Services;

namespace Host.Controllers.Public
{
    [Tags("Public - Cart")]
    [Route("api/cart")]
    public class CartController : BasePublicController
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }

        [HttpGet]
        public async Task<IActionResult> GetCart([FromQuery] string? guestId, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserIdOptional();
            var cart = await _cartService.GetCartAsync(userId, guestId, cancellationToken);
            return Ok(cart);
        }

        [HttpPost("items")]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartRequest request, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserIdOptional();
            await _cartService.AddToCartAsync(userId, request, cancellationToken);
            return Ok();
        }

        [HttpPut("items/quantity")]
        public async Task<IActionResult> UpdateQuantity([FromBody] UpdateCartItemQuantityRequest request, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserIdOptional();
            await _cartService.UpdateQuantityAsync(userId, request, cancellationToken);
            return Ok();
        }

        [HttpPut("items/selection")]
        public async Task<IActionResult> UpdateSelection([FromBody] UpdateCartItemSelectionRequest request, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserIdOptional();
            await _cartService.UpdateSelectionAsync(userId, request, cancellationToken);
            return Ok();
        }

        [HttpPut("items/variant")]
        public async Task<IActionResult> ChangeItemVariant([FromBody] ChangeCartItemVariantRequest request, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserIdOptional();
            await _cartService.ChangeItemVariantAsync(userId, request, cancellationToken);
            return Ok();
        }

        [HttpDelete("items/{productVariantId:int}")]
        public async Task<IActionResult> RemoveItem([FromRoute] int productVariantId, [FromQuery] string? guestId, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserIdOptional();
            await _cartService.RemoveItemAsync(userId, guestId, productVariantId, cancellationToken);
            return Ok();
        }

        [HttpDelete]
        public async Task<IActionResult> ClearCart([FromQuery] string? guestId, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserIdOptional();
            await _cartService.ClearCartAsync(userId, guestId, cancellationToken);
            return Ok();
        }

        [Authorize]
        [HttpPost("merge")]
        public async Task<IActionResult> MergeCart([FromBody] MergeCartRequest request, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            await _cartService.MergeCartAsync(userId, request, cancellationToken);
            return Ok();
        }
    }
}
