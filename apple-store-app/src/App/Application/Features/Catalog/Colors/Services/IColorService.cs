using Application.Features.Catalog.Colors.DTOs;
using Application.Wrappers;

namespace Application.Features.Catalog.Colors.Services
{
    public interface IColorService
    {
        Task<PagedList<ColorDto>> GetPagedAsync(ColorPagedRequest request, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<ColorDto>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<ColorDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task CreateAsync(CreateColorRequest request, CancellationToken cancellationToken = default);
        Task UpdateAsync(int id, UpdateColorRequest request, CancellationToken cancellationToken = default);
        Task DeleteAsync(int id, CancellationToken cancellationToken = default);
    }
}
