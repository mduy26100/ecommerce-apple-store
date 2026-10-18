using Application.Features.Catalog.ProductVariants.DTOs;

namespace Application.Features.Catalog.ProductVariants.Services
{
    public interface IProductVariantService
    {
        Task<IReadOnlyList<ProductVariantDto>> GetByProductIdAsync(int productId, CancellationToken cancellationToken = default);
        Task<ProductVariantDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<int> CreateAsync(CreateProductVariantRequest request, CancellationToken cancellationToken = default);
        Task UpdateAsync(int id, UpdateProductVariantRequest request, CancellationToken cancellationToken = default);
        Task DeleteAsync(int id, CancellationToken cancellationToken = default);
    }
}
