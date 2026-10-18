using Application.Common.Interfaces.Persistence;
using Application.Features.Catalog.Colors.DTOs;
using Application.Features.Catalog.Colors.Specifications;
using Application.Wrappers;
using Domain.Entities.Catalog;
using Domain.Exceptions;

namespace Application.Features.Catalog.Colors.Services
{
    public class ColorService : IColorService
    {
        private readonly IRepository<Color> _colorRepository;
        private readonly IRepository<ProductVariant> _variantRepository;

        public ColorService(
            IRepository<Color> colorRepository,
            IRepository<ProductVariant> variantRepository)
        {
            _colorRepository = colorRepository;
            _variantRepository = variantRepository;
        }

        public async Task<PagedList<ColorDto>> GetPagedAsync(ColorPagedRequest request, CancellationToken cancellationToken = default)
        {
            var spec = new ColorFilterSpec(request);

            return await _colorRepository.GetPagedAsync(
                spec,
                request.PageNumber,
                request.PageSize,
                MapToDto,
                cancellationToken);
        }

        public async Task<IReadOnlyList<ColorDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var spec = new ActiveColorsSpec();
            var colors = await _colorRepository.ListAsync(spec, cancellationToken);

            return colors.Select(MapToDto).ToList();
        }

        public async Task<ColorDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var color = await GetColorOrThrowAsync(id, cancellationToken);
            return MapToDto(color);
        }

        public async Task CreateAsync(CreateColorRequest request, CancellationToken cancellationToken = default)
        {
            await ValidateColorAsync(request.Name, request.Code, request.HexCode, null, cancellationToken);

            var color = new Color
            {
                Name = request.Name.Trim(),
                Code = request.Code.Trim().ToUpperInvariant(),
                HexCode = NormalizeHexCode(request.HexCode),
                IsActive = request.IsActive
            };

            await _colorRepository.AddAsync(color, cancellationToken);
        }

        public async Task UpdateAsync(int id, UpdateColorRequest request, CancellationToken cancellationToken = default)
        {
            var color = await GetColorOrThrowAsync(id, cancellationToken);

            await ValidateColorAsync(request.Name, request.Code, request.HexCode, id, cancellationToken);

            color.Name = request.Name.Trim();
            color.Code = request.Code.Trim().ToUpperInvariant();
            color.HexCode = NormalizeHexCode(request.HexCode);
            color.IsActive = request.IsActive;

            await _colorRepository.UpdateAsync(color, cancellationToken);
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var color = await GetColorOrThrowAsync(id, cancellationToken);

            var isUsed = await _variantRepository.AnyAsync(new VariantsByColorSpec(id), cancellationToken);
            if (isUsed)
            {
                throw new ConflictException("Không thể xóa màu sắc đang được sử dụng bởi các biến thể sản phẩm.");
            }

            await _colorRepository.DeleteAsync(color, cancellationToken);
        }

        private async Task<Color> GetColorOrThrowAsync(int id, CancellationToken cancellationToken)
        {
            var color = await _colorRepository.GetByIdAsync(id, cancellationToken);
            if (color == null)
            {
                throw new NotFoundException(nameof(Color), id);
            }

            return color;
        }

        private async Task ValidateColorAsync(string name, string code, string? hexCode, int? excludeId = null, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new BusinessRuleException("Tên màu sắc không được để trống.");
            }

            if (string.IsNullOrWhiteSpace(code))
            {
                throw new BusinessRuleException("Mã màu sắc (Code) không được để trống.");
            }

            if (!string.IsNullOrWhiteSpace(hexCode))
            {
                var trimmedHex = hexCode.Trim();
                if (!Regex.IsMatch(trimmedHex, "^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$"))
                {
                    throw new BusinessRuleException("Mã màu Hex không đúng định dạng (#RGB hoặc #RRGGBB).");
                }
            }

            var trimmedName = name.Trim();
            var existingByName = await _colorRepository.FirstOrDefaultAsync(new ColorByNameSpec(trimmedName, excludeId), cancellationToken);
            if (existingByName != null)
            {
                throw new ConflictException($"Tên màu sắc '{trimmedName}' đã tồn tại.");
            }

            var trimmedCode = code.Trim().ToUpperInvariant();
            var existingByCode = await _colorRepository.FirstOrDefaultAsync(new ColorByCodeSpec(trimmedCode, excludeId), cancellationToken);
            if (existingByCode != null)
            {
                throw new ConflictException($"Mã màu sắc (Code) '{trimmedCode}' đã tồn tại.");
            }
        }

        private static string? NormalizeHexCode(string? hexCode)
        {
            if (string.IsNullOrWhiteSpace(hexCode))
            {
                return null;
            }

            var trimmed = hexCode.Trim();
            return trimmed.StartsWith('#') ? trimmed.ToUpperInvariant() : $"#{trimmed}".ToUpperInvariant();
        }

        private static ColorDto MapToDto(Color color) => new ColorDto
        {
            Id = color.Id,
            Name = color.Name,
            Code = color.Code,
            HexCode = color.HexCode,
            IsActive = color.IsActive,
            CreatedOn = color.CreatedOn,
            LastModifiedOn = color.LastModifiedOn
        };
    }
}
