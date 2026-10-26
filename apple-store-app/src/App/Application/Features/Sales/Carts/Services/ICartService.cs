using Application.Features.Sales.Carts.DTOs;

namespace Application.Features.Sales.Carts.Services
{
    public interface ICartService
    {
        Task<CartDto> GetCartAsync(int? userId, string? guestId, CancellationToken cancellationToken = default);
        Task AddToCartAsync(int? userId, AddToCartRequest request, CancellationToken cancellationToken = default);
        Task UpdateQuantityAsync(int? userId, UpdateCartItemQuantityRequest request, CancellationToken cancellationToken = default);
        Task UpdateSelectionAsync(int? userId, UpdateCartItemSelectionRequest request, CancellationToken cancellationToken = default);
        Task ChangeItemVariantAsync(int? userId, ChangeCartItemVariantRequest request, CancellationToken cancellationToken = default);
        Task RemoveItemAsync(int? userId, string? guestId, int productVariantId, CancellationToken cancellationToken = default);
        Task ClearCartAsync(int? userId, string? guestId, CancellationToken cancellationToken = default);
        Task MergeCartAsync(int userId, MergeCartRequest request, CancellationToken cancellationToken = default);
    }
}
