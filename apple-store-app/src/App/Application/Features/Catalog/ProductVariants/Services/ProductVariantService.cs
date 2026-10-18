using Application.Common.Interfaces.Persistence;
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
        private readonly IRepository<Color> _colorRepository;
        private readonly IRepository<StorageOption> _storageRepository;
        private readonly IRepository<OrderItem> _orderItemRepository;

        public ProductVariantService(
            IRepository<ProductVariant> variantRepository,
            IRepository<Product> productRepository,
            IRepository<Color> colorRepository,
            IRepository<StorageOption> storageRepository,
            IRepository<OrderItem> orderItemRepository)
        {
            _variantRepository = variantRepository;
            _productRepository = productRepository;
            _colorRepository = colorRepository;
            _storageRepository = storageRepository;
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

            var normalizedSku = request.SKU.Trim().ToUpperInvariant();
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

            if (request.ColorId.HasValue && request.ColorId.Value > 0)
            {
                var color = await _colorRepository.GetByIdAsync(request.ColorId.Value, cancellationToken);
                if (color == null)
                {
                    throw new NotFoundException(nameof(Color), request.ColorId.Value);
                }
            }

            if (request.StorageOptionId.HasValue && request.StorageOptionId.Value > 0)
            {
                var storage = await _storageRepository.GetByIdAsync(request.StorageOptionId.Value, cancellationToken);
                if (storage == null)
                {
                    throw new NotFoundException(nameof(StorageOption), request.StorageOptionId.Value);
                }
            }

            var variant = new ProductVariant
            {
                ProductId = request.ProductId,
                SKU = normalizedSku,
                VariantName = request.VariantName?.Trim(),
                ColorId = request.ColorId > 0 ? request.ColorId : null,
                StorageOptionId = request.StorageOptionId > 0 ? request.StorageOptionId : null,
                Price = request.Price,
                CompareAtPrice = request.CompareAtPrice,
                QuantityInStock = request.QuantityInStock,
                IsActive = request.IsActive
            };

            await _variantRepository.AddAsync(variant, cancellationToken);
            return variant.Id;
        }

        public async Task UpdateAsync(int id, UpdateProductVariantRequest request, CancellationToken cancellationToken = default)
        {
            var variant = await _variantRepository.GetByIdAsync(id, cancellationToken);
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

            var normalizedSku = request.SKU.Trim().ToUpperInvariant();
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

            if (request.ColorId.HasValue && request.ColorId.Value > 0)
            {
                var color = await _colorRepository.GetByIdAsync(request.ColorId.Value, cancellationToken);
                if (color == null)
                {
                    throw new NotFoundException(nameof(Color), request.ColorId.Value);
                }
            }

            if (request.StorageOptionId.HasValue && request.StorageOptionId.Value > 0)
            {
                var storage = await _storageRepository.GetByIdAsync(request.StorageOptionId.Value, cancellationToken);
                if (storage == null)
                {
                    throw new NotFoundException(nameof(StorageOption), request.StorageOptionId.Value);
                }
            }

            variant.SKU = normalizedSku;
            variant.VariantName = request.VariantName?.Trim();
            variant.ColorId = request.ColorId > 0 ? request.ColorId : null;
            variant.StorageOptionId = request.StorageOptionId > 0 ? request.StorageOptionId : null;
            variant.Price = request.Price;
            variant.CompareAtPrice = request.CompareAtPrice;
            variant.QuantityInStock = request.QuantityInStock;
            variant.IsActive = request.IsActive;

            await _variantRepository.UpdateAsync(variant, cancellationToken);
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
            return new ProductVariantDto
            {
                Id = variant.Id,
                ProductId = variant.ProductId,
                ProductName = variant.Product?.Name ?? string.Empty,
                SKU = variant.SKU,
                VariantName = variant.VariantName,
                ColorId = variant.ColorId,
                ColorName = variant.Color?.Name,
                ColorHexCode = variant.Color?.HexCode,
                StorageOptionId = variant.StorageOptionId,
                StorageCapacity = variant.StorageOption?.Name,
                Price = variant.Price,
                CompareAtPrice = variant.CompareAtPrice,
                QuantityInStock = variant.QuantityInStock,
                RowVersion = variant.RowVersion != null ? Convert.ToBase64String(variant.RowVersion) : string.Empty,
                IsActive = variant.IsActive,
                PrimaryImageUrl = variant.Images?.FirstOrDefault(i => i.IsPrimary)?.ImageUrl ?? variant.Images?.FirstOrDefault()?.ImageUrl,
                CreatedOn = variant.CreatedOn,
                LastModifiedOn = variant.LastModifiedOn
            };
        }
    }
}
