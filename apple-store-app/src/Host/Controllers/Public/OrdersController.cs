using Application.Features.Sales.Orders.DTOs;
using Application.Features.Sales.Orders.Services;

namespace Host.Controllers.Public
{
    [Tags("Public - Orders")]
    [Route("api/orders")]
    public class OrdersController : BasePublicController
    {
        private readonly IPublicOrderService _publicOrderService;

        public OrdersController(IPublicOrderService publicOrderService)
        {
            _publicOrderService = publicOrderService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserIdOptional();
            var result = await _publicOrderService.CreateOrderAsync(request, userId, cancellationToken);
            return Ok(result);
        }

        [Authorize]
        [HttpGet("my-orders")]
        public async Task<IActionResult> GetMyOrders([FromQuery] UserOrderPagedRequest request, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            var orders = await _publicOrderService.GetMyOrdersAsync(userId, request, cancellationToken);
            return Ok(orders);
        }

        [Authorize]
        [HttpGet("my-orders/{id:int}")]
        public async Task<IActionResult> GetMyOrderDetail(int id, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            var order = await _publicOrderService.GetUserOrderDetailAsync(id, userId, cancellationToken);
            return Ok(order);
        }

        [HttpGet("guest-recent")]
        public async Task<IActionResult> GetGuestRecentOrders([FromQuery] string guestId, CancellationToken cancellationToken)
        {
            var orders = await _publicOrderService.GetGuestRecentOrdersAsync(guestId, cancellationToken);
            return Ok(orders);
        }

        [HttpPost("lookup")]
        public async Task<IActionResult> LookupOrder([FromBody] OrderLookupRequest request, CancellationToken cancellationToken)
        {
            var order = await _publicOrderService.LookupOrderAsync(request, cancellationToken);
            return Ok(order);
        }

        [Authorize]
        [HttpGet("unmerged-guest-count")]
        public async Task<IActionResult> GetUnmergedGuestOrdersCount([FromQuery] string guestId, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            var count = await _publicOrderService.GetUnmergedGuestOrdersCountAsync(guestId, userId, cancellationToken);
            return Ok(new { count });
        }

        [Authorize]
        [HttpPost("merge-guest")]
        public async Task<IActionResult> MergeGuestOrders([FromBody] MergeGuestOrdersRequest request, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            var mergedCount = await _publicOrderService.MergeGuestOrdersAsync(request.GuestId, userId, cancellationToken);
            return Ok(new { mergedCount });
        }

        [Authorize]
        [HttpPut("my-orders/{id:int}/shipping-address")]
        public async Task<IActionResult> UpdateShippingAddress(int id, [FromBody] UpdateOrderShippingAddressRequest request, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            await _publicOrderService.UpdateShippingAddressAsync(id, request, userId, cancellationToken);
            return Ok();
        }

        [Authorize]
        [HttpPost("{id:int}/cancel")]
        public async Task<IActionResult> CancelOrder(int id, [FromBody] CancelOrderRequest request, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            await _publicOrderService.CancelOrderAsync(id, request, userId, cancellationToken);
            return Ok();
        }

        [Authorize]
        [HttpPost("{id:int}/confirm-received")]
        public async Task<IActionResult> ConfirmReceived(int id, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            await _publicOrderService.ConfirmReceivedAsync(id, userId, cancellationToken);
            return Ok();
        }

        [Authorize]
        [HttpPost("{id:int}/repay-vnpay")]
        public async Task<IActionResult> RepayVnPay(int id, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString();
            var paymentUrl = await _publicOrderService.CreateRepayUrlAsync(id, userId, clientIp, cancellationToken);
            return Ok(new { paymentUrl });
        }
    }
}
