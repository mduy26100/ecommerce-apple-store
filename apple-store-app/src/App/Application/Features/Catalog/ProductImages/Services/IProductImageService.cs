using Application.Features.Catalog.ProductImages.DTOs;

namespace Application.Features.Catalog.ProductImages.Services
{
    public interface IProductImageService
    {
        Task<IReadOnlyList<ProductImageDto>> GetByProductIdAsync(int productId, int? optionValueId = null, CancellationToken cancellationToken = default);
        Task<ProductImageDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<int> CreateAsync(CreateProductImageRequest request, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<ProductImageDto>> CreateBatchAsync(CreateBatchProductImagesRequest request, CancellationToken cancellationToken = default);
        Task UpdateAsync(int id, UpdateProductImageRequest request, CancellationToken cancellationToken = default);
        Task SetPrimaryAsync(int id, CancellationToken cancellationToken = default);
        Task SetDefaultColorAsync(int productId, int optionValueId, CancellationToken cancellationToken = default);
        Task DeleteAsync(int id, CancellationToken cancellationToken = default);
    }
}
