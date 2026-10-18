using Application.Features.Sales.Orders.DTOs;
using Application.Features.Sales.Orders.Services;

namespace Host.Controllers.Public
{
    [Tags("Public - Orders")]
    [Route("api/orders")]
    public class OrdersController : BasePublicController
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateOrderRequest request, CancellationToken cancellationToken)
        {
            var id = await _orderService.CreateAsync(request, cancellationToken);
            return Ok(new { id });
        }

        [HttpGet("lookup/{orderNumber}")]
        public async Task<IActionResult> Lookup(string orderNumber, CancellationToken cancellationToken)
        {
            var result = await _orderService.GetByOrderNumberAsync(orderNumber, cancellationToken);
            return Ok(result);
        }
    }
}
