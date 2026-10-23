using Application.Features.Catalog.ProductSpecifications.DTOs;

namespace Application.Features.Catalog.ProductSpecifications.Services
{
    public interface IProductSpecificationService
    {
        Task<IReadOnlyList<ProductSpecificationGroupDto>> GetGroupsByProductIdAsync(int productId, CancellationToken cancellationToken = default);
        Task<ProductSpecificationGroupDto> GetGroupByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<int> CreateGroupAsync(CreateProductSpecificationGroupRequest request, CancellationToken cancellationToken = default);
        Task UpdateGroupAsync(int id, UpdateProductSpecificationGroupRequest request, CancellationToken cancellationToken = default);
        Task DeleteGroupAsync(int id, CancellationToken cancellationToken = default);
        Task ReorderGroupsAsync(int productId, List<int> orderedGroupIds, CancellationToken cancellationToken = default);

        Task<ProductSpecificationDto> GetSpecByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<int> CreateSpecAsync(CreateProductSpecificationRequest request, CancellationToken cancellationToken = default);
        Task UpdateSpecAsync(int id, UpdateProductSpecificationRequest request, CancellationToken cancellationToken = default);
        Task DeleteSpecAsync(int id, CancellationToken cancellationToken = default);
        Task ReorderSpecsAsync(int groupId, List<int> orderedSpecIds, CancellationToken cancellationToken = default);
    }
}
