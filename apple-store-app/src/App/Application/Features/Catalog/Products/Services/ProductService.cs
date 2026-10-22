using Application.Common.Interfaces.Persistence;
using Application.Features.Catalog.Categories.Specifications;
using Application.Features.Catalog.Products.DTOs;
using Application.Features.Catalog.Products.Specifications;
using Application.Features.Catalog.ProductVariants.DTOs;
using Application.Wrappers;
using Domain.Entities.Catalog;
using Domain.Entities.Sales;
using Domain.Exceptions;

namespace Application.Features.Catalog.Products.Services
{
    public class ProductService : IProductService
    {
        private readonly IRepository<Product> _productRepository;
        private readonly IRepository<Category> _categoryRepository;
        private readonly IRepository<OrderItem> _orderItemRepository;

        public ProductService(
            IRepository<Product> productRepository,
            IRepository<Category> categoryRepository,
            IRepository<OrderItem> orderItemRepository)
        {
            _productRepository = productRepository;
            _categoryRepository = categoryRepository;
            _orderItemRepository = orderItemRepository;
        }

        public async Task<PagedList<ProductSummaryDto>> GetPagedAsync(ProductPagedRequest request, CancellationToken cancellationToken = default)
        {
            var spec = new ProductFilterSpec(request);

            return await _productRepository.GetPagedAsync(
                spec,
                request.PageNumber,
                request.PageSize,
                MapToSummaryDto,
                cancellationToken);
        }

        public async Task<IReadOnlyList<ProductCardDto>> GetCardsAsync(int? categoryId = null, int limit = 100, CancellationToken cancellationToken = default)
        {
            var spec = new ProductCardsSpec(categoryId, limit);
            var products = await _productRepository.ListAsync(spec, cancellationToken);
            return products.Select(MapToCardDto).ToList();
        }

        public async Task<PagedList<ProductCardDto>> GetCardsPagedAsync(ProductCardPagedRequest request, CancellationToken cancellationToken = default)
        {
            var effectivePageSize = request.Limit.HasValue && request.Limit.Value > 0
                ? request.Limit.Value
                : request.PageSize;

            var spec = new ProductCardsPagedSpec(
                request.CategoryId,
                request.CategorySlug,
                request.Search,
                request.SortBy,
                request.MinPrice,
                request.MaxPrice);

            return await _productRepository.GetPagedAsync(
                spec,
                request.PageNumber,
                effectivePageSize,
                MapToCardDto,
                cancellationToken);
        }

        public async Task<IReadOnlyList<CategoryProductShowcaseDto>> GetHomeShowcaseAsync(int countPerCategory = 4, CancellationToken cancellationToken = default)
        {
            var categories = await _categoryRepository.ListAsync(new ActiveCategoriesSpec(), cancellationToken);
            if (categories.Count == 0)
            {
                return Array.Empty<CategoryProductShowcaseDto>();
            }

            var safeCount = countPerCategory <= 0 ? 4 : Math.Min(countPerCategory, 12);
            var showcase = new List<CategoryProductShowcaseDto>(categories.Count);

            foreach (var category in categories)
            {
                var spec = new ProductCardsSpec(category.Id, safeCount);
                var products = await _productRepository.ListAsync(spec, cancellationToken);
                showcase.Add(new CategoryProductShowcaseDto
                {
                    CategoryId = category.Id,
                    CategoryName = category.Name,
                    CategorySlug = category.Slug,
                    CategoryDescription = category.Description,
                    Products = products.Select(MapToCardDto).ToList()
                });
            }

            return showcase;
        }

        public async Task<ProductDetailDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var product = await _productRepository.FirstOrDefaultAsync(new ProductByIdWithDetailsSpec(id), cancellationToken);
            if (product == null)
            {
                throw new NotFoundException(nameof(Product), id);
            }

            return MapToDetailDto(product);
        }

        public async Task<int> CreateAsync(CreateProductRequest request, CancellationToken cancellationToken = default)
        {
            var category = await _categoryRepository.GetByIdAsync(request.CategoryId, cancellationToken);
            if (category == null)
            {
                throw new NotFoundException(nameof(Category), request.CategoryId);
            }

            var trimmedName = request.Name.Trim();
            if (await _productRepository.AnyAsync(new ProductByNameSpec(trimmedName), cancellationToken))
            {
                throw new ConflictException($"Sản phẩm với tên '{trimmedName}' đã tồn tại.");
            }

            var trimmedSlug = request.Slug.Trim().ToLower();
            if (await _productRepository.AnyAsync(new ProductBySlugSpec(trimmedSlug), cancellationToken))
            {
                throw new ConflictException($"Sản phẩm với slug '{trimmedSlug}' đã tồn tại.");
            }

            var product = new Product
            {
                CategoryId = request.CategoryId,
                Name = trimmedName,
                Slug = trimmedSlug,
                ModelCode = request.ModelCode?.Trim(),
                ShortDescription = request.ShortDescription?.Trim(),
                Description = request.Description?.Trim(),
                WarrantyMonths = request.WarrantyMonths,
                IsActive = request.IsActive
            };

            await _productRepository.AddAsync(product, cancellationToken);
            return product.Id;
        }

        public async Task UpdateAsync(int id, UpdateProductRequest request, CancellationToken cancellationToken = default)
        {
            var product = await _productRepository.GetByIdAsync(id, cancellationToken);
            if (product == null)
            {
                throw new NotFoundException(nameof(Product), id);
            }

            var category = await _categoryRepository.GetByIdAsync(request.CategoryId, cancellationToken);
            if (category == null)
            {
                throw new NotFoundException(nameof(Category), request.CategoryId);
            }

            var trimmedName = request.Name.Trim();
            if (await _productRepository.AnyAsync(new ProductByNameSpec(trimmedName, id), cancellationToken))
            {
                throw new ConflictException($"Sản phẩm với tên '{trimmedName}' đã tồn tại.");
            }

            var trimmedSlug = request.Slug.Trim().ToLower();
            if (await _productRepository.AnyAsync(new ProductBySlugSpec(trimmedSlug, id), cancellationToken))
            {
                throw new ConflictException($"Sản phẩm với slug '{trimmedSlug}' đã tồn tại.");
            }

            product.CategoryId = request.CategoryId;
            product.Name = trimmedName;
            product.Slug = trimmedSlug;
            product.ModelCode = request.ModelCode?.Trim();
            product.ShortDescription = request.ShortDescription?.Trim();
            product.Description = request.Description?.Trim();
            product.WarrantyMonths = request.WarrantyMonths;
            product.IsActive = request.IsActive;

            await _productRepository.UpdateAsync(product, cancellationToken);
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var product = await _productRepository.GetByIdAsync(id, cancellationToken);
            if (product == null)
            {
                throw new NotFoundException(nameof(Product), id);
            }

            var hasOrderItems = await _orderItemRepository.AnyAsync(new OrderItemsByProductIdSpec(id), cancellationToken);
            if (hasOrderItems)
            {
                throw new ConflictException("Không thể xoá sản phẩm vì đã có đơn hàng liên kết.");
            }

            await _productRepository.DeleteAsync(product, cancellationToken);
        }

        private static ProductCardDto MapToCardDto(Product product)
        {
            var activeVariants = product.Variants?
                .Where(v => v.IsActive && !v.IsDeleted)
                .ToList();

            var minPrice = activeVariants != null && activeVariants.Any()
                ? activeVariants.Min(v => v.Price)
                : 0;

            var primaryImage = activeVariants?
                .SelectMany(v => v.Images ?? Enumerable.Empty<VariantImage>())
                .Where(img => img.IsActive && !img.IsDeleted && !string.IsNullOrWhiteSpace(img.ImageUrl))
                .OrderByDescending(img => img.IsPrimary)
                .ThenBy(img => img.DisplayOrder)
                .Select(img => img.ImageUrl)
                .FirstOrDefault();

            var chipSpec = product.Specifications?
                .FirstOrDefault(s => s.IsActive && !s.IsDeleted && (s.Name == "Chip xử lý" || s.Name.ToLower().Contains("chip")))?
                .Value;

            var badgeSpec = product.Specifications?
                .FirstOrDefault(s => s.IsActive && !s.IsDeleted && (s.Name == "Huy hiệu" || s.Name == "Trạng thái"))?
                .Value;

            return new ProductCardDto
            {
                Id = product.Id,
                CategoryId = product.CategoryId,
                CategoryName = product.Category?.Name ?? string.Empty,
                Name = product.Name,
                Slug = product.Slug,
                ChipName = chipSpec ?? "Apple Silicon",
                BadgeText = badgeSpec ?? "SẴN HÀNG",
                ShortDescription = product.ShortDescription,
                Price = minPrice,
                ImageUrl = primaryImage
            };
        }

        private static ProductSummaryDto MapToSummaryDto(Product product)
        {
            var variantImages = product.Variants?
                .Where(v => v.Images != null && v.IsActive && !v.IsDeleted)
                .SelectMany(v => v.Images!)
                .Where(img => img.IsActive && !img.IsDeleted && !string.IsNullOrWhiteSpace(img.ImageUrl))
                .OrderBy(img => img.DisplayOrder)
                .Select(img => img.ImageUrl)
                .Distinct()
                .ToList() ?? new List<string>();

            var chipSpec = product.Specifications?
                .FirstOrDefault(s => s.IsActive && !s.IsDeleted && (s.Name == "Chip xử lý" || s.Name.ToLower().Contains("chip")))?
                .Value;

            var badgeSpec = product.Specifications?
                .FirstOrDefault(s => s.IsActive && !s.IsDeleted && (s.Name == "Huy hiệu" || s.Name == "Trạng thái"))?
                .Value;

            return new ProductSummaryDto
            {
                Id = product.Id,
                CategoryId = product.CategoryId,
                CategoryName = product.Category?.Name ?? string.Empty,
                Name = product.Name,
                Slug = product.Slug,
                ModelCode = product.ModelCode,
                ShortDescription = product.ShortDescription,
                WarrantyMonths = product.WarrantyMonths,
                IsActive = product.IsActive,
                VariantsCount = product.Variants?.Count ?? 0,
                MinPrice = product.Variants != null && product.Variants.Any() ? product.Variants.Min(v => v.Price) : null,
                MaxPrice = product.Variants != null && product.Variants.Any() ? product.Variants.Max(v => v.Price) : null,
                PrimaryImageUrl = variantImages.FirstOrDefault(),
                VariantImages = variantImages,
                ChipName = chipSpec ?? "Apple Silicon",
                BadgeText = badgeSpec ?? "SẴN HÀNG",
                CreatedOn = product.CreatedOn,
                LastModifiedOn = product.LastModifiedOn
            };
        }

        private static ProductDetailDto MapToDetailDto(Product product)
        {
            return new ProductDetailDto
            {
                Id = product.Id,
                CategoryId = product.CategoryId,
                CategoryName = product.Category?.Name ?? string.Empty,
                Name = product.Name,
                Slug = product.Slug,
                ModelCode = product.ModelCode,
                ShortDescription = product.ShortDescription,
                Description = product.Description,
                WarrantyMonths = product.WarrantyMonths,
                IsActive = product.IsActive,
                Variants = product.Variants?.Select(MapToVariantDto).ToList() ?? new List<ProductVariantDto>(),
                CreatedOn = product.CreatedOn,
                LastModifiedOn = product.LastModifiedOn
            };
        }

        private static ProductVariantDto MapToVariantDto(ProductVariant variant)
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
