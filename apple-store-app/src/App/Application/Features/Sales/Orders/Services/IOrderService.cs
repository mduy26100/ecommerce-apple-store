using Application.Features.Sales.Orders.DTOs;
using Application.Wrappers;

namespace Application.Features.Sales.Orders.Services
{
    public interface IOrderService
    {
        Task<PagedList<OrderSummaryDto>> GetPagedAsync(OrderPagedRequest request, CancellationToken cancellationToken = default);
        Task<OrderDetailDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<OrderDetailDto> GetByOrderNumberAsync(string orderNumber, CancellationToken cancellationToken = default);
        Task<int> CreateAsync(CreateOrderRequest request, CancellationToken cancellationToken = default);
        Task UpdateStatusAsync(int id, UpdateOrderStatusRequest request, CancellationToken cancellationToken = default);
        Task CancelOrderAsync(int id, CancelOrderRequest request, CancellationToken cancellationToken = default);
    }
}
