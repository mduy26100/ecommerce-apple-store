using Application.Common.Interfaces.Persistence;
using Application.Features.Catalog.ProductOptions.Specifications;
using Application.Features.Catalog.ProductVariants.DTOs;
using Application.Features.Catalog.ProductVariants.Specifications;
using Domain.Entities.Catalog;
using Domain.Entities.Sales;
using Domain.Exceptions;

namespace Application.Features.Catalog.ProductVariants.Services
{
    public class ProductVariantService : IProductVariantService
    {
        private readonly IRepository<ProductVariant> _variantRepository;
        private readonly IRepository<Product> _productRepository;
        private readonly IRepository<ProductOptionValue> _optionValueRepository;
        private readonly IRepository<OrderItem> _orderItemRepository;

        public ProductVariantService(
            IRepository<ProductVariant> variantRepository,
            IRepository<Product> productRepository,
            IRepository<ProductOptionValue> optionValueRepository,
            IRepository<OrderItem> orderItemRepository)
        {
            _variantRepository = variantRepository;
            _productRepository = productRepository;
            _optionValueRepository = optionValueRepository;
            _orderItemRepository = orderItemRepository;
        }

        public async Task<IReadOnlyList<ProductVariantDto>> GetByProductIdAsync(int productId, CancellationToken cancellationToken = default)
        {
            var product = await _productRepository.GetByIdAsync(productId, cancellationToken);
            if (product == null)
            {
                throw new NotFoundException(nameof(Product), productId);
            }

            var spec = new VariantsByProductIdSpec(productId);
            var variants = await _variantRepository.ListAsync(spec, cancellationToken);

            return variants.Select(MapToDto).ToList();
        }

        public async Task<ProductVariantDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var variant = await _variantRepository.FirstOrDefaultAsync(new VariantByIdWithDetailsSpec(id), cancellationToken);
            if (variant == null)
            {
                throw new NotFoundException(nameof(ProductVariant), id);
            }

            return MapToDto(variant);
        }

        public async Task<int> CreateAsync(CreateProductVariantRequest request, CancellationToken cancellationToken = default)
        {
            var product = await _productRepository.GetByIdAsync(request.ProductId, cancellationToken);
            if (product == null)
            {
                throw new NotFoundException(nameof(Product), request.ProductId);
            }

            if (string.IsNullOrWhiteSpace(request.SKU))
            {
                throw new BusinessRuleException("Mã SKU không được để trống.");
            }

            var normalizedSku = request.SKU.Trim().ToUpperInvariant();
            if (!Regex.IsMatch(normalizedSku, @"^[A-Z0-9_-]+$"))
            {
                throw new BusinessRuleException("Mã SKU chỉ được chứa ký tự chữ cái, số, dấu gạch ngang (-) hoặc gạch dưới (_).");
            }

            if (await _variantRepository.AnyAsync(new VariantBySkuSpec(normalizedSku), cancellationToken))
            {
                throw new ConflictException($"Mã SKU '{normalizedSku}' đã tồn tại.");
            }

            if (request.Price < 0)
            {
                throw new BusinessRuleException("Giá bán không được nhỏ hơn 0.");
            }

            if (request.CompareAtPrice.HasValue && request.CompareAtPrice.Value < request.Price)
            {
                throw new BusinessRuleException("Giá gốc (so sánh) không được nhỏ hơn giá bán.");
            }

            if (request.QuantityInStock < 0)
            {
                throw new BusinessRuleException("Số lượng tồn kho không được âm.");
            }

            if (request.OptionValueIds != null && request.OptionValueIds.Count > 0)
            {
                await ValidateOptionValuesAsync(request.ProductId, request.OptionValueIds, null, cancellationToken);
            }

            var variant = new ProductVariant
            {
                ProductId = request.ProductId,
                SKU = normalizedSku,
                VariantName = request.VariantName?.Trim(),
                Price = request.Price,
                CompareAtPrice = request.CompareAtPrice,
                QuantityInStock = request.QuantityInStock,
                IsActive = request.IsActive
            };

            if (request.OptionValueIds != null && request.OptionValueIds.Count > 0)
            {
                foreach (var valId in request.OptionValueIds.Distinct())
                {
                    variant.VariantValues.Add(new ProductVariantValue
                    {
                        OptionValueId = valId
                    });
                }
            }

            await _variantRepository.AddAsync(variant, cancellationToken);
            return variant.Id;
        }

        public async Task UpdateAsync(int id, UpdateProductVariantRequest request, CancellationToken cancellationToken = default)
        {
            var variant = await _variantRepository.FirstOrDefaultAsync(new VariantByIdWithDetailsSpec(id), cancellationToken);
            if (variant == null)
            {
                throw new NotFoundException(nameof(ProductVariant), id);
            }

            if (!string.IsNullOrEmpty(request.RowVersion) && variant.RowVersion != null)
            {
                var clientRowVersion = Convert.FromBase64String(request.RowVersion);
                if (!variant.RowVersion.SequenceEqual(clientRowVersion))
                {
                    throw new ConcurrencyException("Dữ liệu phiên bản đã bị thay đổi bởi người dùng khác. Vui lòng tải lại trang.");
                }
            }

            if (string.IsNullOrWhiteSpace(request.SKU))
            {
                throw new BusinessRuleException("Mã SKU không được để trống.");
            }

            var normalizedSku = request.SKU.Trim().ToUpperInvariant();
            if (!Regex.IsMatch(normalizedSku, @"^[A-Z0-9_-]+$"))
            {
                throw new BusinessRuleException("Mã SKU chỉ được chứa ký tự chữ cái, số, dấu gạch ngang (-) hoặc gạch dưới (_).");
            }

            if (await _variantRepository.AnyAsync(new VariantBySkuSpec(normalizedSku, id), cancellationToken))
            {
                throw new ConflictException($"Mã SKU '{normalizedSku}' đã tồn tại.");
            }

            if (request.Price < 0)
            {
                throw new BusinessRuleException("Giá bán không được nhỏ hơn 0.");
            }

            if (request.CompareAtPrice.HasValue && request.CompareAtPrice.Value < request.Price)
            {
                throw new BusinessRuleException("Giá gốc (so sánh) không được nhỏ hơn giá bán.");
            }

            if (request.QuantityInStock < 0)
            {
                throw new BusinessRuleException("Số lượng tồn kho không được âm.");
            }

            if (request.OptionValueIds != null && request.OptionValueIds.Count > 0)
            {
                await ValidateOptionValuesAsync(variant.ProductId, request.OptionValueIds, id, cancellationToken);
            }

            variant.SKU = normalizedSku;
            variant.VariantName = request.VariantName?.Trim();
            variant.Price = request.Price;
            variant.CompareAtPrice = request.CompareAtPrice;
            variant.QuantityInStock = request.QuantityInStock;
            variant.IsActive = request.IsActive;

            if (request.OptionValueIds != null)
            {
                variant.VariantValues.Clear();
                foreach (var valId in request.OptionValueIds.Distinct())
                {
                    variant.VariantValues.Add(new ProductVariantValue
                    {
                        VariantId = variant.Id,
                        OptionValueId = valId
                    });
                }
            }

            await _variantRepository.UpdateAsync(variant, cancellationToken);
        }

        private async Task ValidateOptionValuesAsync(int productId, IReadOnlyList<int> optionValueIds, int? excludeVariantId, CancellationToken cancellationToken)
        {
            var distinctIds = optionValueIds.Distinct().ToList();
            var spec = new OptionValuesByIdsWithOptionSpec(distinctIds);
            var optionValues = await _optionValueRepository.ListAsync(spec, cancellationToken);

            if (optionValues.Count != distinctIds.Count)
            {
                throw new BusinessRuleException("Một hoặc nhiều giá trị thuộc tính không tồn tại trong hệ thống.");
            }

            if (optionValues.Any(ov => ov.Option.ProductId != productId))
            {
                throw new BusinessRuleException("Giá trị thuộc tính được chọn không thuộc về sản phẩm này.");
            }

            var groupedByOption = optionValues.GroupBy(ov => ov.OptionId).ToList();
            if (groupedByOption.Any(g => g.Count() > 1))
            {
                throw new BusinessRuleException("Mỗi nhóm thuộc tính chỉ được chọn tối đa một giá trị cho một phiên bản.");
            }

            var existingVariants = await _variantRepository.ListAsync(new VariantsByProductIdSpec(productId), cancellationToken);
            var newIdSet = new HashSet<int>(distinctIds);

            var duplicateExists = existingVariants
                .Where(v => !excludeVariantId.HasValue || v.Id != excludeVariantId.Value)
                .Any(v =>
                {
                    var existingSet = new HashSet<int>(v.VariantValues.Select(vv => vv.OptionValueId));
                    return existingSet.SetEquals(newIdSet);
                });

            if (duplicateExists)
            {
                throw new ConflictException("Đã tồn tại một phiên bản khác với cùng tổ hợp thuộc tính này.");
            }
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var variant = await _variantRepository.GetByIdAsync(id, cancellationToken);
            if (variant == null)
            {
                throw new NotFoundException(nameof(ProductVariant), id);
            }

            var hasOrderItems = await _orderItemRepository.AnyAsync(new OrderItemsByVariantIdSpec(id), cancellationToken);
            if (hasOrderItems)
            {
                throw new ConflictException("Không thể xoá phiên bản vì đã có đơn hàng liên kết.");
            }

            await _variantRepository.DeleteAsync(variant, cancellationToken);
        }

        private static ProductVariantDto MapToDto(ProductVariant variant)
        {
            var variantValues = variant.VariantValues?
                .Select(vv => new ProductVariantValueDto
                {
                    OptionId = vv.OptionValue?.OptionId ?? 0,
                    OptionName = vv.OptionValue?.Option?.Name ?? string.Empty,
                    OptionValueId = vv.OptionValueId,
                    Value = vv.OptionValue?.Value ?? string.Empty,
                    ColorHexCode = vv.OptionValue?.ColorHexCode
                }).ToList() ?? new List<ProductVariantValueDto>();

            return new ProductVariantDto
            {
                Id = variant.Id,
                ProductId = variant.ProductId,
                ProductName = variant.Product?.Name ?? string.Empty,
                SKU = variant.SKU,
                VariantName = variant.VariantName,
                Price = variant.Price,
                CompareAtPrice = variant.CompareAtPrice,
                QuantityInStock = variant.QuantityInStock,
                RowVersion = variant.RowVersion != null ? Convert.ToBase64String(variant.RowVersion) : string.Empty,
                IsActive = variant.IsActive,
                PrimaryImageUrl = null,
                VariantValues = variantValues,
                OptionValueIds = variantValues.Select(vv => vv.OptionValueId).ToList(),
                CreatedOn = variant.CreatedOn,
                LastModifiedOn = variant.LastModifiedOn
            };
        }
    }
}
