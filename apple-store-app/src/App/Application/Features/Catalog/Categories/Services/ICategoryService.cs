using Application.Features.Catalog.Categories.DTOs;
using Application.Wrappers;

namespace Application.Features.Catalog.Categories.Services
{
    public interface ICategoryService
    {
        Task<PagedList<CategoryDto>> GetPagedAsync(CategoryPagedRequest request, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<CategoryDto>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<CategoryDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<CategoryDto> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
        Task CreateAsync(CreateCategoryRequest request, CancellationToken cancellationToken = default);
        Task UpdateAsync(int id, UpdateCategoryRequest request, CancellationToken cancellationToken = default);
        Task DeleteAsync(int id, CancellationToken cancellationToken = default);
    }
}
