using Application.Common.Helpers;
using Application.Common.Interfaces.Persistence;
using Application.Common.Interfaces.Storage;
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
        private readonly IUploadImageService _uploadImageService;

        public CategoryService(
            IRepository<Category> categoryRepository,
            IRepository<Product> productRepository,
            IUploadImageService uploadImageService)
        {
            _categoryRepository = categoryRepository;
            _productRepository = productRepository;
            _uploadImageService = uploadImageService;
        }

        public async Task<PagedList<CategoryDto>> GetPagedAsync(CategoryPagedRequest request, CancellationToken cancellationToken = default)
        {
            await EnsureNormalizedOrdersAsync(cancellationToken);

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
            await EnsureNormalizedOrdersAsync(cancellationToken);

            var spec = new ActiveCategoriesSpec();
            var categories = await _categoryRepository.ListAsync(spec, cancellationToken);

            return categories.Select(MapToDto).ToList();
        }

        public async Task<CategoryDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var category = await GetCategoryOrThrowAsync(id, cancellationToken);
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

            if (request.ImageStream != null && !string.IsNullOrWhiteSpace(request.ImageFileName))
            {
                await _uploadImageService.UploadAndReplaceImageAsync(
                    request.ImageStream,
                    request.ImageFileName,
                    request.ImageContentType,
                    "categories",
                    null,
                    async newUrl =>
                    {
                        category.ImageUrl = newUrl;
                        await _categoryRepository.AddAsync(category, cancellationToken);
                    },
                    cancellationToken);
            }
            else
            {
                await _categoryRepository.AddAsync(category, cancellationToken);
            }

            var allCategories = await _categoryRepository.ListAsync(cancellationToken);
            var target = allCategories.FirstOrDefault(c => c.Id == category.Id) ?? category;

            SequenceNormalizer.Reorder(
                allCategories,
                target,
                request.DisplayOrder,
                c => c.DisplayOrder,
                (c, order) => c.DisplayOrder = order,
                startFrom: 1);

            await _categoryRepository.SaveChangesAsync(cancellationToken);
        }

        public async Task UpdateAsync(int id, UpdateCategoryRequest request, CancellationToken cancellationToken = default)
        {
            var category = await GetCategoryOrThrowAsync(id, cancellationToken);

            await ValidateCategoryAsync(request.Name, request.Slug, id, cancellationToken);

            category.Name = request.Name.Trim();
            category.Slug = request.Slug.Trim().ToLower();
            category.Description = request.Description?.Trim();
            category.DisplayOrder = request.DisplayOrder;
            category.IsActive = request.IsActive;

            if (request.ImageStream != null && !string.IsNullOrWhiteSpace(request.ImageFileName))
            {
                await _uploadImageService.UploadAndReplaceImageAsync(
                    request.ImageStream,
                    request.ImageFileName,
                    request.ImageContentType,
                    "categories",
                    category.ImageUrl,
                    async newUrl =>
                    {
                        category.ImageUrl = newUrl;
                        await _categoryRepository.UpdateAsync(category, cancellationToken);
                    },
                    cancellationToken);
            }
            else
            {
                category.ImageUrl = request.ImageUrl?.Trim();
                await _categoryRepository.UpdateAsync(category, cancellationToken);
            }

            var allCategories = await _categoryRepository.ListAsync(cancellationToken);
            var target = allCategories.FirstOrDefault(c => c.Id == category.Id) ?? category;

            SequenceNormalizer.Reorder(
                allCategories,
                target,
                request.DisplayOrder,
                c => c.DisplayOrder,
                (c, order) => c.DisplayOrder = order,
                startFrom: 1);

            await _categoryRepository.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var category = await GetCategoryOrThrowAsync(id, cancellationToken);

            var hasProducts = await _productRepository.AnyAsync(new ProductsByCategorySpec(id), cancellationToken);
            if (hasProducts)
            {
                throw new ConflictException("Không thể xóa danh mục đang chứa sản phẩm liên kết.");
            }

            await _uploadImageService.DeleteImageAsync(
                category.ImageUrl,
                async () =>
                {
                    await _categoryRepository.DeleteAsync(category, cancellationToken);
                },
                cancellationToken);

            var remainingCategories = await _categoryRepository.ListAsync(cancellationToken);
            SequenceNormalizer.Normalize(
                remainingCategories,
                c => c.DisplayOrder,
                (c, order) => c.DisplayOrder = order,
                c => c.Id,
                startFrom: 1);

            await _categoryRepository.SaveChangesAsync(cancellationToken);
        }

        private async Task EnsureNormalizedOrdersAsync(CancellationToken cancellationToken)
        {
            var allCategories = await _categoryRepository.ListAsync(cancellationToken);
            if (allCategories.Count == 0) return;

            var isSequential = true;
            var sorted = allCategories.OrderBy(c => c.DisplayOrder).ToList();
            for (var i = 0; i < sorted.Count; i++)
            {
                if (sorted[i].DisplayOrder != i + 1)
                {
                    isSequential = false;
                    break;
                }
            }

            if (!isSequential)
            {
                SequenceNormalizer.Normalize(
                    allCategories,
                    c => c.DisplayOrder,
                    (c, order) => c.DisplayOrder = order,
                    c => c.Id,
                    startFrom: 1);

                await _categoryRepository.SaveChangesAsync(cancellationToken);
            }
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
