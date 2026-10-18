using Application.Common.Interfaces.Persistence;
using Application.Features.Catalog.Products.DTOs;
using Application.Features.Catalog.Products.Specifications;
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
            var product = await _productRepository.FirstOrDefaultAsync(new ProductBySlugSpec(slug), cancellationToken);
            if (product == null || !product.IsActive)
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

        private static ProductSummaryDto MapToSummaryDto(Product product)
        {
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
                CreatedOn = product.CreatedOn,
                LastModifiedOn = product.LastModifiedOn
            };
        }
    }
}
