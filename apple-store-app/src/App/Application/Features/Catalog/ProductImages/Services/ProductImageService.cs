using Application.Common.Helpers;
using Application.Common.Interfaces.Persistence;
using Application.Common.Interfaces.Storage;
using Application.Features.Catalog.ProductImages.DTOs;
using Application.Features.Catalog.ProductImages.Specifications;
using Application.Features.Catalog.ProductOptions.Specifications;
using Domain.Entities.Catalog;
using Domain.Exceptions;

namespace Application.Features.Catalog.ProductImages.Services
{
    public class ProductImageService : IProductImageService
    {
        private readonly IRepository<ProductImage> _imageRepository;
        private readonly IRepository<Product> _productRepository;
        private readonly IRepository<ProductOptionValue> _optionValueRepository;
        private readonly IUploadImageService _uploadImageService;

        public ProductImageService(
            IRepository<ProductImage> imageRepository,
            IRepository<Product> productRepository,
            IRepository<ProductOptionValue> optionValueRepository,
            IUploadImageService uploadImageService)
        {
            _imageRepository = imageRepository;
            _productRepository = productRepository;
            _optionValueRepository = optionValueRepository;
            _uploadImageService = uploadImageService;
        }

        public async Task<IReadOnlyList<ProductImageDto>> GetByProductIdAsync(int productId, int? optionValueId = null, CancellationToken cancellationToken = default)
        {
            var product = await _productRepository.GetByIdAsync(productId, cancellationToken);
            if (product == null)
            {
                throw new NotFoundException(nameof(Product), productId);
            }

            var spec = new ImagesByProductIdSpec(productId, optionValueId);
            var images = await _imageRepository.ListAsync(spec, cancellationToken);

            return images.OrderBy(i => i.DisplayOrder).Select(MapToDto).ToList();
        }

        public async Task<ProductImageDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var spec = new ProductImageByIdSpec(id);
            var image = await _imageRepository.FirstOrDefaultAsync(spec, cancellationToken);
            if (image == null)
            {
                throw new NotFoundException(nameof(ProductImage), id);
            }

            return MapToDto(image);
        }

        public async Task<int> CreateAsync(CreateProductImageRequest request, CancellationToken cancellationToken = default)
        {
            var product = await _productRepository.GetByIdAsync(request.ProductId, cancellationToken);
            if (product == null)
            {
                throw new NotFoundException(nameof(Product), request.ProductId);
            }

            if (request.OptionValueId.HasValue)
            {
                var optionVal = await _optionValueRepository.GetByIdAsync(request.OptionValueId.Value, cancellationToken);
                if (optionVal == null)
                {
                    throw new NotFoundException(nameof(ProductOptionValue), request.OptionValueId.Value);
                }
            }

            if (request.ImageStream == null || string.IsNullOrWhiteSpace(request.ImageFileName))
            {
                throw new BusinessRuleException("Vui lòng cung cấp tệp hình ảnh để tải lên.");
            }

            var existingImages = await _imageRepository.ListAsync(
                new ImagesByProductIdSpec(request.ProductId, request.OptionValueId),
                cancellationToken);

            var shouldBePrimary = request.IsPrimary || !existingImages.Any();

            if (shouldBePrimary && existingImages.Any())
            {
                foreach (var img in existingImages.Where(i => i.IsPrimary))
                {
                    img.IsPrimary = false;
                    await _imageRepository.UpdateAsync(img, cancellationToken);
                }
            }

            var newImage = new ProductImage
            {
                ProductId = request.ProductId,
                OptionValueId = request.OptionValueId,
                ImageUrl = string.Empty,
                AltText = request.AltText?.Trim(),
                DisplayOrder = request.DisplayOrder > 0 ? request.DisplayOrder : existingImages.Count + 1,
                IsPrimary = shouldBePrimary
            };

            await _uploadImageService.UploadAndReplaceImageAsync(
                request.ImageStream,
                request.ImageFileName,
                request.ImageContentType,
                "products",
                null,
                async newUrl =>
                {
                    newImage.ImageUrl = newUrl;
                    await _imageRepository.AddAsync(newImage, cancellationToken);
                },
                cancellationToken);

            var allImages = await _imageRepository.ListAsync(
                new ImagesByProductIdSpec(request.ProductId, request.OptionValueId),
                cancellationToken);

            SequenceNormalizer.Normalize(
                allImages,
                i => i.DisplayOrder,
                (i, order) => i.DisplayOrder = order,
                i => i.Id,
                startFrom: 1);

            await _imageRepository.SaveChangesAsync(cancellationToken);

            return newImage.Id;
        }

        public async Task<IReadOnlyList<ProductImageDto>> CreateBatchAsync(CreateBatchProductImagesRequest request, CancellationToken cancellationToken = default)
        {
            var product = await _productRepository.GetByIdAsync(request.ProductId, cancellationToken);
            if (product == null)
            {
                throw new NotFoundException(nameof(Product), request.ProductId);
            }

            if (request.OptionValueId.HasValue)
            {
                var optionVal = await _optionValueRepository.GetByIdAsync(request.OptionValueId.Value, cancellationToken);
                if (optionVal == null)
                {
                    throw new NotFoundException(nameof(ProductOptionValue), request.OptionValueId.Value);
                }
            }

            if (request.Files == null || request.Files.Count == 0)
            {
                throw new BusinessRuleException("Danh sách tệp hình ảnh không được để trống.");
            }

            var existingImages = await _imageRepository.ListAsync(
                new ImagesByProductIdSpec(request.ProductId, request.OptionValueId),
                cancellationToken);

            var hasPrimary = existingImages.Any(i => i.IsPrimary);
            var createdImages = new List<ProductImage>();

            for (var index = 0; index < request.Files.Count; index++)
            {
                var fileItem = request.Files[index];
                var isPrimary = !hasPrimary && index == 0;
                var image = new ProductImage
                {
                    ProductId = request.ProductId,
                    OptionValueId = request.OptionValueId,
                    ImageUrl = string.Empty,
                    AltText = fileItem.AltText?.Trim(),
                    DisplayOrder = existingImages.Count + index + 1,
                    IsPrimary = isPrimary
                };

                await _uploadImageService.UploadAndReplaceImageAsync(
                    fileItem.Stream,
                    fileItem.FileName,
                    fileItem.ContentType,
                    "products",
                    null,
                    async newUrl =>
                    {
                        image.ImageUrl = newUrl;
                        await _imageRepository.AddAsync(image, cancellationToken);
                    },
                    cancellationToken);

                createdImages.Add(image);
            }

            var allImages = await _imageRepository.ListAsync(
                new ImagesByProductIdSpec(request.ProductId, request.OptionValueId),
                cancellationToken);

            SequenceNormalizer.Normalize(
                allImages,
                img => img.DisplayOrder,
                (img, order) => img.DisplayOrder = order,
                img => img.Id,
                startFrom: 1);

            await _imageRepository.SaveChangesAsync(cancellationToken);

            return createdImages.Select(MapToDto).ToList();
        }

        public async Task UpdateAsync(int id, UpdateProductImageRequest request, CancellationToken cancellationToken = default)
        {
            var image = await _imageRepository.GetByIdAsync(id, cancellationToken);
            if (image == null)
            {
                throw new NotFoundException(nameof(ProductImage), id);
            }

            if (request.OptionValueId.HasValue && request.OptionValueId != image.OptionValueId)
            {
                var optionVal = await _optionValueRepository.GetByIdAsync(request.OptionValueId.Value, cancellationToken);
                if (optionVal == null)
                {
                    throw new NotFoundException(nameof(ProductOptionValue), request.OptionValueId.Value);
                }
                image.OptionValueId = request.OptionValueId;
            }

            if (request.IsPrimary && !image.IsPrimary)
            {
                var existingImages = await _imageRepository.ListAsync(
                    new ImagesByProductIdSpec(image.ProductId, image.OptionValueId),
                    cancellationToken);

                foreach (var img in existingImages.Where(i => i.IsPrimary && i.Id != id))
                {
                    img.IsPrimary = false;
                    await _imageRepository.UpdateAsync(img, cancellationToken);
                }
            }

            image.AltText = request.AltText?.Trim();
            image.DisplayOrder = request.DisplayOrder;
            image.IsPrimary = request.IsPrimary;

            await _imageRepository.UpdateAsync(image, cancellationToken);
        }

        public async Task SetPrimaryAsync(int id, CancellationToken cancellationToken = default)
        {
            var targetImage = await _imageRepository.GetByIdAsync(id, cancellationToken);
            if (targetImage == null)
            {
                throw new NotFoundException(nameof(ProductImage), id);
            }

            var colorImages = await _imageRepository.ListAsync(
                new ImagesByProductIdSpec(targetImage.ProductId, targetImage.OptionValueId),
                cancellationToken);

            foreach (var img in colorImages)
            {
                if (img.Id == id)
                {
                    img.IsPrimary = true;
                    img.DisplayOrder = 1;
                    await _imageRepository.UpdateAsync(img, cancellationToken);
                }
                else if (img.IsPrimary)
                {
                    img.IsPrimary = false;
                    await _imageRepository.UpdateAsync(img, cancellationToken);
                }
            }

            var reordered = colorImages
                .OrderByDescending(i => i.Id == id)
                .ThenBy(i => i.DisplayOrder)
                .ToList();

            SequenceNormalizer.Normalize(
                reordered,
                img => img.DisplayOrder,
                (img, order) => img.DisplayOrder = order,
                img => img.Id,
                startFrom: 1);

            await _imageRepository.SaveChangesAsync(cancellationToken);
        }

        public async Task SetDefaultColorAsync(int productId, int optionValueId, CancellationToken cancellationToken = default)
        {
            var product = await _productRepository.GetByIdAsync(productId, cancellationToken);
            if (product == null)
            {
                throw new NotFoundException(nameof(Product), productId);
            }

            var targetValue = await _optionValueRepository.GetByIdAsync(optionValueId, cancellationToken);
            if (targetValue == null)
            {
                throw new NotFoundException(nameof(ProductOptionValue), optionValueId);
            }

            await ReorderOptionValuesForDefaultColorAsync(optionValueId, cancellationToken);

            var allImages = await _imageRepository.ListAsync(
                new ImagesByProductIdSpec(productId),
                cancellationToken);

            var firstColorImage = allImages
                .Where(i => i.OptionValueId == optionValueId)
                .OrderBy(i => i.DisplayOrder)
                .FirstOrDefault();

            if (firstColorImage != null)
            {
                foreach (var img in allImages)
                {
                    if (img.Id == firstColorImage.Id)
                    {
                        img.IsPrimary = true;
                        img.DisplayOrder = 1;
                        await _imageRepository.UpdateAsync(img, cancellationToken);
                    }
                    else if (img.IsPrimary)
                    {
                        img.IsPrimary = false;
                        await _imageRepository.UpdateAsync(img, cancellationToken);
                    }
                }
            }
        }

        private async Task ReorderOptionValuesForDefaultColorAsync(int targetValueId, CancellationToken cancellationToken)
        {
            var targetValue = await _optionValueRepository.GetByIdAsync(targetValueId, cancellationToken);
            if (targetValue == null) return;

            var siblingValues = await _optionValueRepository.ListAsync(
                new ProductOptionValuesByOptionIdSpec(targetValue.OptionId),
                cancellationToken);

            targetValue.DisplayOrder = 1;
            await _optionValueRepository.UpdateAsync(targetValue, cancellationToken);

            var order = 2;
            foreach (var val in siblingValues.Where(v => v.Id != targetValueId))
            {
                val.DisplayOrder = order++;
                await _optionValueRepository.UpdateAsync(val, cancellationToken);
            }
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var image = await _imageRepository.GetByIdAsync(id, cancellationToken);
            if (image == null)
            {
                throw new NotFoundException(nameof(ProductImage), id);
            }

            var wasPrimary = image.IsPrimary;
            var productId = image.ProductId;
            var optionValueId = image.OptionValueId;

            await _uploadImageService.DeleteImageAsync(
                image.ImageUrl,
                async () =>
                {
                    await _imageRepository.DeleteAsync(image, cancellationToken);
                },
                cancellationToken);

            var remainingImages = await _imageRepository.ListAsync(
                new ImagesByProductIdSpec(productId, optionValueId),
                cancellationToken);

            if (wasPrimary && remainingImages.Any())
            {
                var nextPrimary = remainingImages.OrderBy(i => i.DisplayOrder).First();
                nextPrimary.IsPrimary = true;
                await _imageRepository.UpdateAsync(nextPrimary, cancellationToken);
            }

            SequenceNormalizer.Normalize(
                remainingImages,
                i => i.DisplayOrder,
                (i, order) => i.DisplayOrder = order,
                i => i.Id,
                startFrom: 1);

            await _imageRepository.SaveChangesAsync(cancellationToken);
        }

        private static ProductImageDto MapToDto(ProductImage image)
        {
            return new ProductImageDto
            {
                Id = image.Id,
                ProductId = image.ProductId,
                OptionValueId = image.OptionValueId,
                OptionValueName = image.OptionValue?.Value,
                ColorHexCode = image.OptionValue?.ColorHexCode,
                ImageUrl = image.ImageUrl,
                AltText = image.AltText,
                DisplayOrder = image.DisplayOrder,
                IsPrimary = image.IsPrimary,
                CreatedOn = image.CreatedOn,
                LastModifiedOn = image.LastModifiedOn
            };
        }
    }
}
