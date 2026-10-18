using Application.Features.Catalog.StorageOptions.DTOs;
using Application.Wrappers;

namespace Application.Features.Catalog.StorageOptions.Services
{
    public interface IStorageOptionService
    {
        Task<PagedList<StorageOptionDto>> GetPagedAsync(StorageOptionPagedRequest request, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<StorageOptionDto>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<StorageOptionDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task CreateAsync(CreateStorageOptionRequest request, CancellationToken cancellationToken = default);
        Task UpdateAsync(int id, UpdateStorageOptionRequest request, CancellationToken cancellationToken = default);
        Task DeleteAsync(int id, CancellationToken cancellationToken = default);
    }
}
