using Application.Common.Interfaces.Persistence;
using Application.Features.Catalog.Categories.DTOs;
using Application.Features.Catalog.Categories.Specifications;
using Application.Wrappers;
using Domain.Entities.Catalog;
using Domain.Exceptions;

namespace Application.Features.Catalog.Categories.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly IRepository<Category> _categoryRepository;
        private readonly IRepository<Product> _productRepository;

        public CategoryService(
            IRepository<Category> categoryRepository,
            IRepository<Product> productRepository)
        {
            _categoryRepository = categoryRepository;
            _productRepository = productRepository;
        }

        public async Task<PagedList<CategoryDto>> GetPagedAsync(CategoryPagedRequest request, CancellationToken cancellationToken = default)
        {
            var spec = new CategoryFilterSpec(request);

            return await _categoryRepository.GetPagedAsync(
                spec,
                request.PageNumber,
                request.PageSize,
                MapToDto,
                cancellationToken);
        }

        public async Task<IReadOnlyList<CategoryDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var spec = new ActiveCategoriesSpec();
            var categories = await _categoryRepository.ListAsync(spec, cancellationToken);

            return categories.Select(MapToDto).ToList();
        }

        public async Task<CategoryDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var category = await GetCategoryOrThrowAsync(id, cancellationToken);
            return MapToDto(category);
        }

        public async Task<CategoryDto> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
        {
            var category = await _categoryRepository.FirstOrDefaultAsync(new CategoryBySlugSpec(slug), cancellationToken);
            if (category == null || !category.IsActive)
            {
                throw new NotFoundException(nameof(Category), slug);
            }

            return MapToDto(category);
        }

        public async Task CreateAsync(CreateCategoryRequest request, CancellationToken cancellationToken = default)
        {
            await ValidateCategoryAsync(request.Name, request.Slug, null, cancellationToken);

            var category = new Category
            {
                Name = request.Name.Trim(),
                Slug = request.Slug.Trim().ToLower(),
                Description = request.Description?.Trim(),
                ImageUrl = request.ImageUrl?.Trim(),
                DisplayOrder = request.DisplayOrder,
                IsActive = request.IsActive
            };

            await _categoryRepository.AddAsync(category, cancellationToken);
        }

        public async Task UpdateAsync(int id, UpdateCategoryRequest request, CancellationToken cancellationToken = default)
        {
            var category = await GetCategoryOrThrowAsync(id, cancellationToken);

            await ValidateCategoryAsync(request.Name, request.Slug, id, cancellationToken);

            category.Name = request.Name.Trim();
            category.Slug = request.Slug.Trim().ToLower();
            category.Description = request.Description?.Trim();
            category.ImageUrl = request.ImageUrl?.Trim();
            category.DisplayOrder = request.DisplayOrder;
            category.IsActive = request.IsActive;

            await _categoryRepository.UpdateAsync(category, cancellationToken);
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var category = await GetCategoryOrThrowAsync(id, cancellationToken);

            var hasProducts = await _productRepository.AnyAsync(new ProductsByCategorySpec(id), cancellationToken);
            if (hasProducts)
            {
                throw new ConflictException("Không thể xóa danh mục đang chứa sản phẩm liên kết.");
            }

            await _categoryRepository.DeleteAsync(category, cancellationToken);
        }

        private async Task<Category> GetCategoryOrThrowAsync(int id, CancellationToken cancellationToken)
        {
            var category = await _categoryRepository.GetByIdAsync(id, cancellationToken);
            if (category == null)
            {
                throw new NotFoundException(nameof(Category), id);
            }

            return category;
        }

        private async Task ValidateCategoryAsync(string name, string slug, int? excludeId = null, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new BusinessRuleException("Tên danh mục không được để trống.");
            }

            if (string.IsNullOrWhiteSpace(slug))
            {
                throw new BusinessRuleException("Đường dẫn danh mục (slug) không được để trống.");
            }

            var trimmedName = name.Trim();
            var existingByName = await _categoryRepository.FirstOrDefaultAsync(new CategoryByNameSpec(trimmedName, excludeId), cancellationToken);
            if (existingByName != null)
            {
                throw new ConflictException($"Tên danh mục '{trimmedName}' đã tồn tại.");
            }

            var trimmedSlug = slug.Trim().ToLower();
            var existingBySlug = await _categoryRepository.FirstOrDefaultAsync(new CategoryBySlugSpec(trimmedSlug, excludeId), cancellationToken);
            if (existingBySlug != null)
            {
                throw new ConflictException($"Đường dẫn danh mục (slug) '{trimmedSlug}' đã tồn tại.");
            }
        }

        private static CategoryDto MapToDto(Category category) => new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Slug = category.Slug,
            Description = category.Description,
            ImageUrl = category.ImageUrl,
            DisplayOrder = category.DisplayOrder,
            IsActive = category.IsActive,
            CreatedOn = category.CreatedOn,
            LastModifiedOn = category.LastModifiedOn
        };
    }
}
