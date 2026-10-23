using Application.Common.Interfaces.Persistence;
using Application.Features.Catalog.Products.DTOs;
using Application.Features.Catalog.ProductOptions.DTOs;
using Application.Features.Catalog.ProductOptions.Specifications;
using Domain.Entities.Catalog;
using Domain.Exceptions;

namespace Application.Features.Catalog.ProductOptions.Services
{
    public class ProductOptionService : IProductOptionService
    {
        private readonly IRepository<ProductOption> _optionRepository;
        private readonly IRepository<ProductOptionValue> _optionValueRepository;
        private readonly IRepository<Product> _productRepository;

        public ProductOptionService(
            IRepository<ProductOption> optionRepository,
            IRepository<ProductOptionValue> optionValueRepository,
            IRepository<Product> productRepository)
        {
            _optionRepository = optionRepository;
            _optionValueRepository = optionValueRepository;
            _productRepository = productRepository;
        }

        public async Task<IReadOnlyList<ProductOptionDto>> GetByProductIdAsync(int productId, CancellationToken cancellationToken = default)
        {
            var options = await _optionRepository.ListAsync(new ProductOptionsByProductIdSpec(productId), cancellationToken);
            return options.Select(o => new ProductOptionDto
            {
                Id = o.Id,
                ProductId = o.ProductId,
                Name = o.Name,
                DisplayOrder = o.DisplayOrder,
                Values = o.Values
                    .OrderBy(v => v.DisplayOrder)
                    .Select(v => new ProductOptionValueDto
                    {
                        Id = v.Id,
                        OptionId = v.OptionId,
                        Value = v.Value,
                        ColorHexCode = v.ColorHexCode,
                        DisplayOrder = v.DisplayOrder
                    }).ToList()
            }).ToList();
        }

        public async Task<int> CreateOptionAsync(CreateProductOptionRequest request, CancellationToken cancellationToken = default)
        {
            var product = await _productRepository.GetByIdAsync(request.ProductId, cancellationToken);
            if (product == null)
            {
                throw new NotFoundException(nameof(Product), request.ProductId);
            }

            if (string.IsNullOrWhiteSpace(request.Name))
            {
                throw new BusinessRuleException("Tên nhóm thuộc tính không được để trống.");
            }

            var trimmedName = request.Name.Trim();
            if (await _optionRepository.AnyAsync(new ProductOptionByNameSpec(request.ProductId, trimmedName), cancellationToken))
            {
                throw new ConflictException($"Nhóm thuộc tính '{trimmedName}' đã tồn tại cho sản phẩm này.");
            }

            var option = new ProductOption
            {
                ProductId = request.ProductId,
                Name = trimmedName,
                DisplayOrder = request.DisplayOrder
            };

            await _optionRepository.AddAsync(option, cancellationToken);
            return option.Id;
        }

        public async Task UpdateOptionAsync(int id, UpdateProductOptionRequest request, CancellationToken cancellationToken = default)
        {
            var option = await _optionRepository.GetByIdAsync(id, cancellationToken);
            if (option == null)
            {
                throw new NotFoundException(nameof(ProductOption), id);
            }

            if (string.IsNullOrWhiteSpace(request.Name))
            {
                throw new BusinessRuleException("Tên nhóm thuộc tính không được để trống.");
            }

            var trimmedName = request.Name.Trim();
            if (await _optionRepository.AnyAsync(new ProductOptionByNameSpec(option.ProductId, trimmedName, id), cancellationToken))
            {
                throw new ConflictException($"Nhóm thuộc tính '{trimmedName}' đã tồn tại cho sản phẩm này.");
            }

            option.Name = trimmedName;
            option.DisplayOrder = request.DisplayOrder;

            await _optionRepository.UpdateAsync(option, cancellationToken);
        }

        public async Task<int> CreateOptionValueAsync(CreateProductOptionValueRequest request, CancellationToken cancellationToken = default)
        {
            var option = await _optionRepository.GetByIdAsync(request.OptionId, cancellationToken);
            if (option == null)
            {
                throw new NotFoundException(nameof(ProductOption), request.OptionId);
            }

            if (string.IsNullOrWhiteSpace(request.Value))
            {
                throw new BusinessRuleException("Giá trị thuộc tính không được để trống.");
            }

            var trimmedValue = request.Value.Trim();
            if (await _optionValueRepository.AnyAsync(new ProductOptionValueByNameSpec(request.OptionId, trimmedValue), cancellationToken))
            {
                throw new ConflictException($"Giá trị '{trimmedValue}' đã tồn tại trong nhóm thuộc tính này.");
            }

            string? trimmedHex = null;
            if (!string.IsNullOrWhiteSpace(request.ColorHexCode))
            {
                trimmedHex = request.ColorHexCode.Trim();
                if (!Regex.IsMatch(trimmedHex, @"^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$"))
                {
                    throw new BusinessRuleException("Mã màu hex không đúng định dạng (Ví dụ: #FF5733 hoặc #FFF).");
                }
            }

            var optionValue = new ProductOptionValue
            {
                OptionId = request.OptionId,
                Value = trimmedValue,
                ColorHexCode = trimmedHex,
                DisplayOrder = request.DisplayOrder
            };

            await _optionValueRepository.AddAsync(optionValue, cancellationToken);
            return optionValue.Id;
        }

        public async Task UpdateOptionValueAsync(int id, UpdateProductOptionValueRequest request, CancellationToken cancellationToken = default)
        {
            var optionValue = await _optionValueRepository.GetByIdAsync(id, cancellationToken);
            if (optionValue == null)
            {
                throw new NotFoundException(nameof(ProductOptionValue), id);
            }

            if (string.IsNullOrWhiteSpace(request.Value))
            {
                throw new BusinessRuleException("Giá trị thuộc tính không được để trống.");
            }

            var trimmedValue = request.Value.Trim();
            if (await _optionValueRepository.AnyAsync(new ProductOptionValueByNameSpec(optionValue.OptionId, trimmedValue, id), cancellationToken))
            {
                throw new ConflictException($"Giá trị '{trimmedValue}' đã tồn tại trong nhóm thuộc tính này.");
            }

            string? trimmedHex = null;
            if (!string.IsNullOrWhiteSpace(request.ColorHexCode))
            {
                trimmedHex = request.ColorHexCode.Trim();
                if (!Regex.IsMatch(trimmedHex, @"^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$"))
                {
                    throw new BusinessRuleException("Mã màu hex không đúng định dạng (Ví dụ: #FF5733 hoặc #FFF).");
                }
            }

            optionValue.Value = trimmedValue;
            optionValue.ColorHexCode = trimmedHex;
            optionValue.DisplayOrder = request.DisplayOrder;

            await _optionValueRepository.UpdateAsync(optionValue, cancellationToken);
        }

        public async Task DeleteOptionAsync(int id, CancellationToken cancellationToken = default)
        {
            var option = await _optionRepository.GetByIdAsync(id, cancellationToken);
            if (option == null)
            {
                throw new NotFoundException(nameof(ProductOption), id);
            }

            await _optionRepository.DeleteAsync(option, cancellationToken);
        }

        public async Task DeleteOptionValueAsync(int id, CancellationToken cancellationToken = default)
        {
            var optionValue = await _optionValueRepository.GetByIdAsync(id, cancellationToken);
            if (optionValue == null)
            {
                throw new NotFoundException(nameof(ProductOptionValue), id);
            }

            await _optionValueRepository.DeleteAsync(optionValue, cancellationToken);
        }
    }
}
