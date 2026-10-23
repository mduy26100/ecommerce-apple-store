using Application.Features.Catalog.Products.DTOs;
using Application.Features.Catalog.ProductOptions.DTOs;

namespace Application.Features.Catalog.ProductOptions.Services
{
    public interface IProductOptionService
    {
        Task<IReadOnlyList<ProductOptionDto>> GetByProductIdAsync(int productId, CancellationToken cancellationToken = default);
        Task<int> CreateOptionAsync(CreateProductOptionRequest request, CancellationToken cancellationToken = default);
        Task UpdateOptionAsync(int id, UpdateProductOptionRequest request, CancellationToken cancellationToken = default);
        Task<int> CreateOptionValueAsync(CreateProductOptionValueRequest request, CancellationToken cancellationToken = default);
        Task UpdateOptionValueAsync(int id, UpdateProductOptionValueRequest request, CancellationToken cancellationToken = default);
        Task DeleteOptionAsync(int id, CancellationToken cancellationToken = default);
        Task DeleteOptionValueAsync(int id, CancellationToken cancellationToken = default);
    }
}
