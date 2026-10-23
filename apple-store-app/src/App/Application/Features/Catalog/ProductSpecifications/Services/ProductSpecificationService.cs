using Application.Common.Helpers;
using Application.Common.Interfaces.Persistence;
using Application.Features.Catalog.ProductSpecifications.DTOs;
using Application.Features.Catalog.ProductSpecifications.Specifications;
using Domain.Entities.Catalog;
using Domain.Exceptions;

namespace Application.Features.Catalog.ProductSpecifications.Services
{
    public class ProductSpecificationService : IProductSpecificationService
    {
        private readonly IRepository<ProductSpecificationGroup> _groupRepository;
        private readonly IRepository<ProductSpecification> _specRepository;
        private readonly IRepository<Product> _productRepository;

        public ProductSpecificationService(
            IRepository<ProductSpecificationGroup> groupRepository,
            IRepository<ProductSpecification> specRepository,
            IRepository<Product> productRepository)
        {
            _groupRepository = groupRepository;
            _specRepository = specRepository;
            _productRepository = productRepository;
        }

        public async Task<IReadOnlyList<ProductSpecificationGroupDto>> GetGroupsByProductIdAsync(int productId, CancellationToken cancellationToken = default)
        {
            var product = await _productRepository.GetByIdAsync(productId, cancellationToken);
            if (product == null)
            {
                throw new NotFoundException(nameof(Product), productId);
            }

            var spec = new SpecGroupsByProductIdSpec(productId);
            var groups = await _groupRepository.ListAsync(spec, cancellationToken);

            SequenceNormalizer.Normalize(groups, g => g.DisplayOrder, (g, o) => g.DisplayOrder = o, g => g.Id);

            foreach (var group in groups)
            {
                var specList = group.Specifications.ToList();
                SequenceNormalizer.Normalize(specList, s => s.DisplayOrder, (s, o) => s.DisplayOrder = o, s => s.Id);
            }

            return groups.OrderBy(g => g.DisplayOrder).Select(MapToGroupDto).ToList();
        }

        public async Task<ProductSpecificationGroupDto> GetGroupByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var spec = new SpecGroupByIdWithSpecsSpec(id);
            var group = await _groupRepository.FirstOrDefaultAsync(spec, cancellationToken);
            if (group == null)
            {
                throw new NotFoundException(nameof(ProductSpecificationGroup), id);
            }

            return MapToGroupDto(group);
        }

        public async Task<int> CreateGroupAsync(CreateProductSpecificationGroupRequest request, CancellationToken cancellationToken = default)
        {
            var product = await _productRepository.GetByIdAsync(request.ProductId, cancellationToken);
            if (product == null)
            {
                throw new NotFoundException(nameof(Product), request.ProductId);
            }

            var spec = new SpecGroupsByProductIdSpec(request.ProductId);
            var existingGroups = await _groupRepository.ListAsync(spec, cancellationToken);

            int targetOrder = request.DisplayOrder.HasValue && request.DisplayOrder.Value > 0
                ? request.DisplayOrder.Value
                : existingGroups.Count + 1;

            var newGroup = new ProductSpecificationGroup
            {
                ProductId = request.ProductId,
                Name = request.Name.Trim(),
                DisplayOrder = targetOrder
            };

            await _groupRepository.AddAsync(newGroup, cancellationToken);

            existingGroups.Add(newGroup);
            SequenceNormalizer.Normalize(existingGroups, g => g.DisplayOrder, (g, o) => g.DisplayOrder = o, g => g.Id);

            foreach (var group in existingGroups)
            {
                await _groupRepository.UpdateAsync(group, cancellationToken);
            }

            return newGroup.Id;
        }

        public async Task UpdateGroupAsync(int id, UpdateProductSpecificationGroupRequest request, CancellationToken cancellationToken = default)
        {
            var group = await _groupRepository.GetByIdAsync(id, cancellationToken);
            if (group == null)
            {
                throw new NotFoundException(nameof(ProductSpecificationGroup), id);
            }

            group.Name = request.Name.Trim();

            if (request.DisplayOrder.HasValue && request.DisplayOrder.Value != group.DisplayOrder)
            {
                var spec = new SpecGroupsByProductIdSpec(group.ProductId);
                var allGroups = await _groupRepository.ListAsync(spec, cancellationToken);
                var target = allGroups.FirstOrDefault(g => g.Id == id) ?? group;

                SequenceNormalizer.Reorder(allGroups, target, request.DisplayOrder.Value, g => g.DisplayOrder, (g, o) => g.DisplayOrder = o);

                foreach (var g in allGroups)
                {
                    await _groupRepository.UpdateAsync(g, cancellationToken);
                }
            }
            else
            {
                await _groupRepository.UpdateAsync(group, cancellationToken);
            }
        }

        public async Task DeleteGroupAsync(int id, CancellationToken cancellationToken = default)
        {
            var group = await _groupRepository.GetByIdAsync(id, cancellationToken);
            if (group == null)
            {
                throw new NotFoundException(nameof(ProductSpecificationGroup), id);
            }

            int productId = group.ProductId;
            await _groupRepository.DeleteAsync(group, cancellationToken);

            var spec = new SpecGroupsByProductIdSpec(productId);
            var remainingGroups = await _groupRepository.ListAsync(spec, cancellationToken);

            SequenceNormalizer.Normalize(remainingGroups, g => g.DisplayOrder, (g, o) => g.DisplayOrder = o, g => g.Id);

            foreach (var g in remainingGroups)
            {
                await _groupRepository.UpdateAsync(g, cancellationToken);
            }
        }

        public async Task ReorderGroupsAsync(int productId, List<int> orderedGroupIds, CancellationToken cancellationToken = default)
        {
            var spec = new SpecGroupsByProductIdSpec(productId);
            var groups = await _groupRepository.ListAsync(spec, cancellationToken);
            var groupDict = groups.ToDictionary(g => g.Id);

            int order = 1;
            foreach (var id in orderedGroupIds)
            {
                if (groupDict.TryGetValue(id, out var group))
                {
                    group.DisplayOrder = order++;
                    await _groupRepository.UpdateAsync(group, cancellationToken);
                }
            }

            var unassigned = groups.Where(g => !orderedGroupIds.Contains(g.Id)).OrderBy(g => g.DisplayOrder).ToList();
            foreach (var group in unassigned)
            {
                group.DisplayOrder = order++;
                await _groupRepository.UpdateAsync(group, cancellationToken);
            }
        }

        public async Task<ProductSpecificationDto> GetSpecByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var entity = await _specRepository.GetByIdAsync(id, cancellationToken);
            if (entity == null)
            {
                throw new NotFoundException(nameof(ProductSpecification), id);
            }

            var group = await _groupRepository.GetByIdAsync(entity.GroupId, cancellationToken);
            return MapToSpecDto(entity, group?.Name);
        }

        public async Task<int> CreateSpecAsync(CreateProductSpecificationRequest request, CancellationToken cancellationToken = default)
        {
            var group = await _groupRepository.GetByIdAsync(request.GroupId, cancellationToken);
            if (group == null)
            {
                throw new NotFoundException(nameof(ProductSpecificationGroup), request.GroupId);
            }

            var spec = new SpecsByGroupIdSpec(request.GroupId);
            var existingSpecs = await _specRepository.ListAsync(spec, cancellationToken);

            int targetOrder = request.DisplayOrder.HasValue && request.DisplayOrder.Value > 0
                ? request.DisplayOrder.Value
                : existingSpecs.Count + 1;

            var newSpec = new ProductSpecification
            {
                GroupId = request.GroupId,
                Name = request.Name.Trim(),
                Value = request.Value.Trim(),
                Unit = request.Unit?.Trim(),
                DisplayOrder = targetOrder
            };

            await _specRepository.AddAsync(newSpec, cancellationToken);

            existingSpecs.Add(newSpec);
            SequenceNormalizer.Normalize(existingSpecs, s => s.DisplayOrder, (s, o) => s.DisplayOrder = o, s => s.Id);

            foreach (var item in existingSpecs)
            {
                await _specRepository.UpdateAsync(item, cancellationToken);
            }

            return newSpec.Id;
        }

        public async Task UpdateSpecAsync(int id, UpdateProductSpecificationRequest request, CancellationToken cancellationToken = default)
        {
            var entity = await _specRepository.GetByIdAsync(id, cancellationToken);
            if (entity == null)
            {
                throw new NotFoundException(nameof(ProductSpecification), id);
            }

            entity.Name = request.Name.Trim();
            entity.Value = request.Value.Trim();
            entity.Unit = request.Unit?.Trim();

            if (request.DisplayOrder.HasValue && request.DisplayOrder.Value != entity.DisplayOrder)
            {
                var spec = new SpecsByGroupIdSpec(entity.GroupId);
                var allSpecs = await _specRepository.ListAsync(spec, cancellationToken);
                var target = allSpecs.FirstOrDefault(s => s.Id == id) ?? entity;

                SequenceNormalizer.Reorder(allSpecs, target, request.DisplayOrder.Value, s => s.DisplayOrder, (s, o) => s.DisplayOrder = o);

                foreach (var s in allSpecs)
                {
                    await _specRepository.UpdateAsync(s, cancellationToken);
                }
            }
            else
            {
                await _specRepository.UpdateAsync(entity, cancellationToken);
            }
        }

        public async Task DeleteSpecAsync(int id, CancellationToken cancellationToken = default)
        {
            var entity = await _specRepository.GetByIdAsync(id, cancellationToken);
            if (entity == null)
            {
                throw new NotFoundException(nameof(ProductSpecification), id);
            }

            int groupId = entity.GroupId;
            await _specRepository.DeleteAsync(entity, cancellationToken);

            var spec = new SpecsByGroupIdSpec(groupId);
            var remainingSpecs = await _specRepository.ListAsync(spec, cancellationToken);

            SequenceNormalizer.Normalize(remainingSpecs, s => s.DisplayOrder, (s, o) => s.DisplayOrder = o, s => s.Id);

            foreach (var s in remainingSpecs)
            {
                await _specRepository.UpdateAsync(s, cancellationToken);
            }
        }

        public async Task ReorderSpecsAsync(int groupId, List<int> orderedSpecIds, CancellationToken cancellationToken = default)
        {
            var spec = new SpecsByGroupIdSpec(groupId);
            var specs = await _specRepository.ListAsync(spec, cancellationToken);
            var specDict = specs.ToDictionary(s => s.Id);

            int order = 1;
            foreach (var id in orderedSpecIds)
            {
                if (specDict.TryGetValue(id, out var item))
                {
                    item.DisplayOrder = order++;
                    await _specRepository.UpdateAsync(item, cancellationToken);
                }
            }

            var unassigned = specs.Where(s => !orderedSpecIds.Contains(s.Id)).OrderBy(s => s.DisplayOrder).ToList();
            foreach (var item in unassigned)
            {
                item.DisplayOrder = order++;
                await _specRepository.UpdateAsync(item, cancellationToken);
            }
        }

        private static ProductSpecificationGroupDto MapToGroupDto(ProductSpecificationGroup group)
        {
            return new ProductSpecificationGroupDto
            {
                Id = group.Id,
                ProductId = group.ProductId,
                Name = group.Name,
                DisplayOrder = group.DisplayOrder,
                Specifications = group.Specifications
                    .OrderBy(s => s.DisplayOrder)
                    .Select(s => MapToSpecDto(s, group.Name))
                    .ToList(),
                CreatedOn = group.CreatedOn,
                LastModifiedOn = group.LastModifiedOn
            };
        }

        private static ProductSpecificationDto MapToSpecDto(ProductSpecification spec, string? groupName = null)
        {
            return new ProductSpecificationDto
            {
                Id = spec.Id,
                GroupId = spec.GroupId,
                GroupName = groupName,
                Name = spec.Name,
                Value = spec.Value,
                Unit = spec.Unit,
                DisplayOrder = spec.DisplayOrder,
                CreatedOn = spec.CreatedOn,
                LastModifiedOn = spec.LastModifiedOn
            };
        }
    }
}
