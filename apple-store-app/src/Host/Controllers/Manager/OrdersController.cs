using Application.Features.Sales.Orders.DTOs;
using Application.Features.Sales.Orders.Services;

namespace Host.Controllers.Manager
{
    [Tags("Manager - Orders")]
    [Route("api/manager/orders")]
    public class OrdersController : BaseManagerController
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpGet]
        public async Task<IActionResult> GetPaged([FromQuery] OrderPagedRequest request, CancellationToken cancellationToken)
        {
            var result = await _orderService.GetPagedAsync(request, cancellationToken);
            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var result = await _orderService.GetByIdAsync(id, cancellationToken);
            return Ok(result);
        }

        [HttpGet("by-number/{orderNumber}")]
        public async Task<IActionResult> GetByNumber(string orderNumber, CancellationToken cancellationToken)
        {
            var result = await _orderService.GetByOrderNumberAsync(orderNumber, cancellationToken);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateOrderRequest request, CancellationToken cancellationToken)
        {
            var id = await _orderService.CreateAsync(request, cancellationToken);
            return Ok(new { id });
        }

        [HttpPut("{id:int}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateOrderStatusRequest request, CancellationToken cancellationToken)
        {
            await _orderService.UpdateStatusAsync(id, request, cancellationToken);
            return Ok();
        }

        [HttpPost("{id:int}/cancel")]
        public async Task<IActionResult> Cancel(int id, [FromBody] CancelOrderRequest request, CancellationToken cancellationToken)
        {
            await _orderService.CancelOrderAsync(id, request, cancellationToken);
            return Ok();
        }
    }
}
