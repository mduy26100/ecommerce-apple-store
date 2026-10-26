using Application.Features.Sales.Orders.DTOs;
using Application.Wrappers;

namespace Application.Features.Sales.Orders.Services
{
    public interface IPublicOrderService
    {
        Task<OrderSuccessDto> CreateOrderAsync(CreateOrderRequest request, int? currentUserId, CancellationToken cancellationToken = default);
        Task<PagedList<OrderSummaryDto>> GetMyOrdersAsync(int userId, UserOrderPagedRequest request, CancellationToken cancellationToken = default);
        Task<OrderDetailDto> GetUserOrderDetailAsync(int orderId, int userId, CancellationToken cancellationToken = default);
        Task<List<OrderSummaryDto>> GetGuestRecentOrdersAsync(string guestId, CancellationToken cancellationToken = default);
        Task<OrderDetailDto> LookupOrderAsync(OrderLookupRequest request, CancellationToken cancellationToken = default);
        Task<int> AutoMergeOrdersByEmailAsync(int userId, string email, CancellationToken cancellationToken = default);
        Task<int> GetUnmergedGuestOrdersCountAsync(string guestId, int currentUserId, CancellationToken cancellationToken = default);
        Task<int> MergeGuestOrdersAsync(string guestId, int userId, CancellationToken cancellationToken = default);
        Task UpdateShippingAddressAsync(int id, UpdateOrderShippingAddressRequest request, int currentUserId, CancellationToken cancellationToken = default);
        Task CancelOrderAsync(int id, CancelOrderRequest request, int currentUserId, CancellationToken cancellationToken = default);
        Task ConfirmReceivedAsync(int id, int currentUserId, CancellationToken cancellationToken = default);
        Task<string> CreateRepayUrlAsync(int orderId, int currentUserId, string? clientIpAddress, CancellationToken cancellationToken = default);
    }
}
