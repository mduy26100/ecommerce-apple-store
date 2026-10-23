using Application.Common.Interfaces.Persistence;
using Application.Features.Catalog.Categories.Specifications;
using Application.Features.Catalog.Products.DTOs;
using Application.Features.Catalog.Products.Specifications;
using Application.Features.Catalog.ProductImages.DTOs;
using Application.Features.Catalog.ProductSpecifications.DTOs;
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

        public async Task<IReadOnlyList<ProductCardDto>> GetRandomCardsAsync(int count = 12, int? excludeId = null, CancellationToken cancellationToken = default)
        {
            var safeCount = count <= 0 ? 12 : Math.Min(count, 50);
            var spec = new ProductCardsSpec(null, 500);
            var products = await _productRepository.ListAsync(spec, cancellationToken);

            var query = products.AsEnumerable();
            if (excludeId.HasValue && excludeId.Value > 0)
            {
                query = query.Where(p => p.Id != excludeId.Value);
            }

            var list = query.ToList();
            if (list.Count == 0)
            {
                return Array.Empty<ProductCardDto>();
            }

            var randomized = list.OrderBy(_ => Guid.NewGuid()).Take(safeCount);
            return randomized.Select(MapToCardDto).ToList();
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

        public async Task<ProductDetailDto> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
        {
            var product = await _productRepository.FirstOrDefaultAsync(new ProductBySlugWithDetailsSpec(slug), cancellationToken);
            if (product == null)
            {
                throw new NotFoundException(nameof(Product), slug);
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

            if (string.IsNullOrWhiteSpace(request.Name))
            {
                throw new BusinessRuleException("Tên sản phẩm không được để trống.");
            }

            if (string.IsNullOrWhiteSpace(request.Slug))
            {
                throw new BusinessRuleException("Đường dẫn (slug) sản phẩm không được để trống.");
            }

            var trimmedName = request.Name.Trim();
            var trimmedSlug = request.Slug.Trim().ToLowerInvariant();

            if (!Regex.IsMatch(trimmedSlug, @"^[a-z0-9]+(-[a-z0-9]+)*$"))
            {
                throw new BusinessRuleException("Đường dẫn (slug) chỉ được chứa chữ cái thường, chữ số và dấu gạch nối (-).");
            }

            if (request.WarrantyMonths.HasValue && request.WarrantyMonths.Value < 0)
            {
                throw new BusinessRuleException("Thời gian bảo hành không được là số âm.");
            }

            if (await _productRepository.AnyAsync(new ProductByNameSpec(trimmedName), cancellationToken))
            {
                throw new ConflictException($"Sản phẩm với tên '{trimmedName}' đã tồn tại.");
            }

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

            if (string.IsNullOrWhiteSpace(request.Name))
            {
                throw new BusinessRuleException("Tên sản phẩm không được để trống.");
            }

            if (string.IsNullOrWhiteSpace(request.Slug))
            {
                throw new BusinessRuleException("Đường dẫn (slug) sản phẩm không được để trống.");
            }

            var trimmedName = request.Name.Trim();
            var trimmedSlug = request.Slug.Trim().ToLowerInvariant();

            if (!Regex.IsMatch(trimmedSlug, @"^[a-z0-9]+(-[a-z0-9]+)*$"))
            {
                throw new BusinessRuleException("Đường dẫn (slug) chỉ được chứa chữ cái thường, chữ số và dấu gạch nối (-).");
            }

            if (request.WarrantyMonths.HasValue && request.WarrantyMonths.Value < 0)
            {
                throw new BusinessRuleException("Thời gian bảo hành không được là số âm.");
            }

            if (await _productRepository.AnyAsync(new ProductByNameSpec(trimmedName, id), cancellationToken))
            {
                throw new ConflictException($"Sản phẩm với tên '{trimmedName}' đã tồn tại.");
            }

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

            var primaryImage = product.Images?
                .Where(img => img.IsActive && !img.IsDeleted && !string.IsNullOrWhiteSpace(img.ImageUrl))
                .OrderBy(img => img.OptionValue?.DisplayOrder ?? 999)
                .ThenByDescending(img => img.IsPrimary)
                .ThenBy(img => img.DisplayOrder)
                .Select(img => img.ImageUrl)
                .FirstOrDefault();

            var chipSpec = product.SpecificationGroups?
                .SelectMany(g => g.Specifications)
                .FirstOrDefault(s => s.IsActive && !s.IsDeleted && (s.Name == "Chip xử lý" || s.Name.ToLower().Contains("chip")))?
                .Value;

            var badgeSpec = product.SpecificationGroups?
                .SelectMany(g => g.Specifications)
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
            var productImages = product.Images?
                .Where(img => img.IsActive && !img.IsDeleted && !string.IsNullOrWhiteSpace(img.ImageUrl))
                .OrderBy(img => img.OptionValue?.DisplayOrder ?? 999)
                .ThenByDescending(img => img.IsPrimary)
                .ThenBy(img => img.DisplayOrder)
                .Select(img => img.ImageUrl)
                .Distinct()
                .ToList() ?? new List<string>();

            var chipSpec = product.SpecificationGroups?
                .SelectMany(g => g.Specifications)
                .FirstOrDefault(s => s.IsActive && !s.IsDeleted && (s.Name == "Chip xử lý" || s.Name.ToLower().Contains("chip")))?
                .Value;

            var badgeSpec = product.SpecificationGroups?
                .SelectMany(g => g.Specifications)
                .FirstOrDefault(s => s.IsActive && !s.IsDeleted && (s.Name == "Huy hiệu" || s.Name == "Trạng thái"))?
                .Value;

            var activeVariants = product.Variants?.Where(v => v.IsActive).ToList() ?? new List<ProductVariant>();

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
                VariantsCount = activeVariants.Count,
                MinPrice = activeVariants.Any() ? activeVariants.Min(v => v.Price) : null,
                MaxPrice = activeVariants.Any() ? activeVariants.Max(v => v.Price) : null,
                PrimaryImageUrl = productImages.FirstOrDefault(),
                VariantImages = productImages,
                ChipName = chipSpec ?? "Apple Silicon",
                BadgeText = badgeSpec ?? "SẴN HÀNG",
                CreatedOn = product.CreatedOn,
                LastModifiedOn = product.LastModifiedOn
            };
        }

        private static ProductDetailDto MapToDetailDto(Product product)
        {
            var activeVariants = product.Variants?.Where(v => v.IsActive).ToList() ?? new List<ProductVariant>();

            return new ProductDetailDto
            {
                Id = product.Id,
                CategoryId = product.CategoryId,
                CategoryName = product.Category?.Name ?? string.Empty,
                CategorySlug = product.Category?.Slug ?? string.Empty,
                Name = product.Name,
                Slug = product.Slug,
                ModelCode = product.ModelCode,
                ShortDescription = product.ShortDescription,
                Description = product.Description,
                WarrantyMonths = product.WarrantyMonths,
                IsActive = product.IsActive,
                Images = product.Images?
                    .OrderBy(i => i.OptionValue?.DisplayOrder ?? 999)
                    .ThenByDescending(i => i.IsPrimary)
                    .ThenBy(i => i.DisplayOrder)
                    .Select(i => new ProductImageDto
                    {
                        Id = i.Id,
                        ProductId = i.ProductId,
                        OptionValueId = i.OptionValueId,
                        OptionValueName = i.OptionValue?.Value,
                        ColorHexCode = i.OptionValue?.ColorHexCode,
                        ImageUrl = i.ImageUrl,
                        AltText = i.AltText,
                        DisplayOrder = i.DisplayOrder,
                        IsPrimary = i.IsPrimary,
                        CreatedOn = i.CreatedOn,
                        LastModifiedOn = i.LastModifiedOn
                    }).ToList() ?? new List<ProductImageDto>(),
                Options = product.Options?
                    .OrderBy(o => o.DisplayOrder)
                    .Select(o => new ProductOptionDto
                    {
                        Id = o.Id,
                        ProductId = o.ProductId,
                        Name = o.Name,
                        DisplayOrder = o.DisplayOrder,
                        Values = o.Values?
                            .OrderBy(v => v.DisplayOrder)
                            .Select(v =>
                            {
                                var matchingVariants = activeVariants
                                    .Where(var => var.VariantValues?.Any(vv => vv.OptionValueId == v.Id) ?? false)
                                    .ToList();
                                var hasVariants = matchingVariants.Count > 0;
                                var inStock = hasVariants && matchingVariants.Any(var => var.QuantityInStock > 0);

                                return new ProductOptionValueDto
                                {
                                    Id = v.Id,
                                    OptionId = v.OptionId,
                                    Value = v.Value,
                                    ColorHexCode = v.ColorHexCode,
                                    DisplayOrder = v.DisplayOrder,
                                    HasVariants = hasVariants,
                                    InStock = inStock
                                };
                            }).ToList() ?? new List<ProductOptionValueDto>()
                    }).ToList() ?? new List<ProductOptionDto>(),
                Variants = activeVariants.Select(MapToVariantDto).ToList(),
                SpecificationGroups = product.SpecificationGroups?
                    .OrderBy(g => g.DisplayOrder)
                    .Select(g => new ProductSpecificationGroupDto
                    {
                        Id = g.Id,
                        ProductId = g.ProductId,
                        Name = g.Name,
                        DisplayOrder = g.DisplayOrder,
                        Specifications = g.Specifications?
                            .OrderBy(s => s.DisplayOrder)
                            .Select(s => new ProductSpecificationDto
                            {
                                Id = s.Id,
                                GroupId = s.GroupId,
                                GroupName = g.Name,
                                Name = s.Name,
                                Value = s.Value,
                                Unit = s.Unit,
                                DisplayOrder = s.DisplayOrder,
                                CreatedOn = s.CreatedOn,
                                LastModifiedOn = s.LastModifiedOn
                            }).ToList() ?? new List<ProductSpecificationDto>(),
                        CreatedOn = g.CreatedOn,
                        LastModifiedOn = g.LastModifiedOn
                    }).ToList() ?? new List<ProductSpecificationGroupDto>(),
                Specifications = product.SpecificationGroups?
                    .OrderBy(g => g.DisplayOrder)
                    .SelectMany(g => (g.Specifications ?? new List<ProductSpecification>())
                        .OrderBy(s => s.DisplayOrder)
                        .Select(s => new ProductSpecificationDto
                        {
                            Id = s.Id,
                            GroupId = s.GroupId,
                            GroupName = g.Name,
                            Name = s.Name,
                            Value = s.Value,
                            Unit = s.Unit,
                            DisplayOrder = s.DisplayOrder,
                            CreatedOn = s.CreatedOn,
                            LastModifiedOn = s.LastModifiedOn
                        }))
                    .ToList() ?? new List<ProductSpecificationDto>(),
                CreatedOn = product.CreatedOn,
                LastModifiedOn = product.LastModifiedOn
            };
        }

        private static ProductVariantDto MapToVariantDto(ProductVariant variant)
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
