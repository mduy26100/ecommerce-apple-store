using Application.Features.Catalog.ProductSpecifications.DTOs;

namespace Application.Features.Catalog.ProductSpecifications.Services
{
    public interface IProductSpecificationService
    {
        Task<IReadOnlyList<ProductSpecificationDto>> GetByProductIdAsync(int productId, CancellationToken cancellationToken = default);
        Task<ProductSpecificationDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<int> CreateAsync(CreateProductSpecificationRequest request, CancellationToken cancellationToken = default);
        Task UpdateAsync(int id, UpdateProductSpecificationRequest request, CancellationToken cancellationToken = default);
        Task DeleteAsync(int id, CancellationToken cancellationToken = default);
    }
}
