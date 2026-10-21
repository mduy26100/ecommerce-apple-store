using Application.Features.Catalog.VariantImages.DTOs;

namespace Application.Features.Catalog.VariantImages.Services
{
    public interface IVariantImageService
    {
        Task<IReadOnlyList<VariantImageDto>> GetByVariantIdAsync(int variantId, CancellationToken cancellationToken = default);
        Task<VariantImageDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<int> CreateAsync(CreateVariantImageRequest request, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<VariantImageDto>> CreateBatchAsync(CreateBatchVariantImagesRequest request, CancellationToken cancellationToken = default);
        Task UpdateAsync(int id, UpdateVariantImageRequest request, CancellationToken cancellationToken = default);
        Task SetPrimaryAsync(int id, CancellationToken cancellationToken = default);
        Task DeleteAsync(int id, CancellationToken cancellationToken = default);
    }
}
