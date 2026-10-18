using Application.Common.Interfaces.Persistence;
using Application.Features.Catalog.StorageOptions.DTOs;
using Application.Features.Catalog.StorageOptions.Specifications;
using Application.Wrappers;
using Domain.Entities.Catalog;
using Domain.Exceptions;

namespace Application.Features.Catalog.StorageOptions.Services
{
    public class StorageOptionService : IStorageOptionService
    {
        private readonly IRepository<StorageOption> _storageOptionRepository;
        private readonly IRepository<ProductVariant> _variantRepository;

        public StorageOptionService(
            IRepository<StorageOption> storageOptionRepository,
            IRepository<ProductVariant> variantRepository)
        {
            _storageOptionRepository = storageOptionRepository;
            _variantRepository = variantRepository;
        }

        public async Task<PagedList<StorageOptionDto>> GetPagedAsync(StorageOptionPagedRequest request, CancellationToken cancellationToken = default)
        {
            var spec = new StorageOptionFilterSpec(request);

            return await _storageOptionRepository.GetPagedAsync(
                spec,
                request.PageNumber,
                request.PageSize,
                MapToDto,
                cancellationToken);
        }

        public async Task<IReadOnlyList<StorageOptionDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var spec = new ActiveStorageOptionsSpec();
            var options = await _storageOptionRepository.ListAsync(spec, cancellationToken);

            return options.Select(MapToDto).ToList();
        }

        public async Task<StorageOptionDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var option = await GetStorageOptionOrThrowAsync(id, cancellationToken);
            return MapToDto(option);
        }

        public async Task CreateAsync(CreateStorageOptionRequest request, CancellationToken cancellationToken = default)
        {
            await ValidateStorageOptionAsync(request.Name, request.CapacityValue, null, cancellationToken);

            var option = new StorageOption
            {
                Name = request.Name.Trim(),
                CapacityValue = request.CapacityValue,
                Unit = NormalizeUnit(request.Unit, request.Name),
                IsActive = request.IsActive
            };

            await _storageOptionRepository.AddAsync(option, cancellationToken);
        }

        public async Task UpdateAsync(int id, UpdateStorageOptionRequest request, CancellationToken cancellationToken = default)
        {
            var option = await GetStorageOptionOrThrowAsync(id, cancellationToken);

            await ValidateStorageOptionAsync(request.Name, request.CapacityValue, id, cancellationToken);

            option.Name = request.Name.Trim();
            option.CapacityValue = request.CapacityValue;
            option.Unit = NormalizeUnit(request.Unit, request.Name);
            option.IsActive = request.IsActive;

            await _storageOptionRepository.UpdateAsync(option, cancellationToken);
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var option = await GetStorageOptionOrThrowAsync(id, cancellationToken);

            var isUsed = await _variantRepository.AnyAsync(new VariantsByStorageOptionSpec(id), cancellationToken);
            if (isUsed)
            {
                throw new ConflictException("Không thể xóa dung lượng đang được sử dụng bởi các biến thể sản phẩm.");
            }

            await _storageOptionRepository.DeleteAsync(option, cancellationToken);
        }

        private async Task<StorageOption> GetStorageOptionOrThrowAsync(int id, CancellationToken cancellationToken)
        {
            var option = await _storageOptionRepository.GetByIdAsync(id, cancellationToken);
            if (option == null)
            {
                throw new NotFoundException(nameof(StorageOption), id);
            }

            return option;
        }

        private async Task ValidateStorageOptionAsync(string name, long? capacityValue, int? excludeId = null, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new BusinessRuleException("Tên tùy chọn dung lượng không được để trống.");
            }

            if (capacityValue.HasValue && capacityValue.Value <= 0)
            {
                throw new BusinessRuleException("Giá trị dung lượng (CapacityValue) phải lớn hơn 0.");
            }

            var trimmedName = name.Trim();
            var existingByName = await _storageOptionRepository.FirstOrDefaultAsync(new StorageOptionByNameSpec(trimmedName, excludeId), cancellationToken);
            if (existingByName != null)
            {
                throw new ConflictException($"Tên dung lượng '{trimmedName}' đã tồn tại.");
            }
        }

        private static string? NormalizeUnit(string? unit, string name)
        {
            if (!string.IsNullOrWhiteSpace(unit))
            {
                return unit.Trim().ToUpperInvariant();
            }

            var upperName = name.ToUpperInvariant();
            if (upperName.EndsWith("TB"))
            {
                return "TB";
            }

            if (upperName.EndsWith("GB"))
            {
                return "GB";
            }

            return "GB";
        }

        private static StorageOptionDto MapToDto(StorageOption option) => new StorageOptionDto
        {
            Id = option.Id,
            Name = option.Name,
            CapacityValue = option.CapacityValue,
            Unit = option.Unit,
            IsActive = option.IsActive,
            CreatedOn = option.CreatedOn,
            LastModifiedOn = option.LastModifiedOn
        };
    }
}
