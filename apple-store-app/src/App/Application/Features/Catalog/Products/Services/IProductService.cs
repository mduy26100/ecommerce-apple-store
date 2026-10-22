using Application.Features.Catalog.Products.DTOs;
using Application.Wrappers;

namespace Application.Features.Catalog.Products.Services
{
    public interface IProductService
    {
        Task<PagedList<ProductSummaryDto>> GetPagedAsync(ProductPagedRequest request, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<ProductCardDto>> GetCardsAsync(int? categoryId = null, int limit = 100, CancellationToken cancellationToken = default);
        Task<ProductDetailDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<int> CreateAsync(CreateProductRequest request, CancellationToken cancellationToken = default);
        Task UpdateAsync(int id, UpdateProductRequest request, CancellationToken cancellationToken = default);
        Task DeleteAsync(int id, CancellationToken cancellationToken = default);
    }
}
