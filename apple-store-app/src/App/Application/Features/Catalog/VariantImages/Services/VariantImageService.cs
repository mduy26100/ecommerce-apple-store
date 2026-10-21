using Application.Common.Helpers;
using Application.Common.Interfaces.Persistence;
using Application.Common.Interfaces.Storage;
using Application.Features.Catalog.VariantImages.DTOs;
using Application.Features.Catalog.VariantImages.Specifications;
using Domain.Entities.Catalog;
using Domain.Exceptions;

namespace Application.Features.Catalog.VariantImages.Services
{
    public class VariantImageService : IVariantImageService
    {
        private readonly IRepository<VariantImage> _imageRepository;
        private readonly IRepository<ProductVariant> _variantRepository;
        private readonly IUploadImageService _uploadImageService;

        public VariantImageService(
            IRepository<VariantImage> imageRepository,
            IRepository<ProductVariant> variantRepository,
            IUploadImageService uploadImageService)
        {
            _imageRepository = imageRepository;
            _variantRepository = variantRepository;
            _uploadImageService = uploadImageService;
        }

        public async Task<IReadOnlyList<VariantImageDto>> GetByVariantIdAsync(int variantId, CancellationToken cancellationToken = default)
        {
            var variant = await _variantRepository.GetByIdAsync(variantId, cancellationToken);
            if (variant == null)
            {
                throw new NotFoundException(nameof(ProductVariant), variantId);
            }

            var spec = new ImagesByVariantIdSpec(variantId);
            var images = await _imageRepository.ListAsync(spec, cancellationToken);

            return images.OrderBy(i => i.DisplayOrder).Select(MapToDto).ToList();
        }

        public async Task<VariantImageDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var image = await _imageRepository.GetByIdAsync(id, cancellationToken);
            if (image == null)
            {
                throw new NotFoundException(nameof(VariantImage), id);
            }

            return MapToDto(image);
        }

        public async Task<int> CreateAsync(CreateVariantImageRequest request, CancellationToken cancellationToken = default)
        {
            var variant = await _variantRepository.GetByIdAsync(request.ProductVariantId, cancellationToken);
            if (variant == null)
            {
                throw new NotFoundException(nameof(ProductVariant), request.ProductVariantId);
            }

            var existingImages = await _imageRepository.ListAsync(
                new ImagesByVariantIdSpec(request.ProductVariantId),
                cancellationToken);

            var isPrimary = request.IsPrimary || !existingImages.Any();

            if (isPrimary && existingImages.Any())
            {
                foreach (var img in existingImages.Where(i => i.IsPrimary))
                {
                    img.IsPrimary = false;
                    await _imageRepository.UpdateAsync(img, cancellationToken);
                }
            }

            var newImage = new VariantImage
            {
                ProductVariantId = request.ProductVariantId,
                ImageUrl = request.ImageUrl?.Trim() ?? string.Empty,
                AltText = request.AltText?.Trim(),
                DisplayOrder = request.DisplayOrder,
                IsPrimary = isPrimary
            };

            if (request.ImageStream == null || string.IsNullOrWhiteSpace(request.ImageFileName))
            {
                throw new BusinessRuleException("Vui lòng cung cấp tệp hình ảnh để tải lên.");
            }

            await _uploadImageService.UploadAndReplaceImageAsync(
                request.ImageStream,
                request.ImageFileName,
                request.ImageContentType,
                "variants",
                null,
                async newUrl =>
                {
                    newImage.ImageUrl = newUrl;
                    await _imageRepository.AddAsync(newImage, cancellationToken);
                },
                cancellationToken);

            var allImages = await _imageRepository.ListAsync(
                new ImagesByVariantIdSpec(request.ProductVariantId),
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

        public async Task<IReadOnlyList<VariantImageDto>> CreateBatchAsync(CreateBatchVariantImagesRequest request, CancellationToken cancellationToken = default)
        {
            var variant = await _variantRepository.GetByIdAsync(request.ProductVariantId, cancellationToken);
            if (variant == null)
            {
                throw new NotFoundException(nameof(ProductVariant), request.ProductVariantId);
            }

            if (request.Files == null || request.Files.Count == 0)
            {
                throw new BusinessRuleException("Danh sách tệp hình ảnh không được để trống.");
            }

            var existingImages = await _imageRepository.ListAsync(
                new ImagesByVariantIdSpec(request.ProductVariantId),
                cancellationToken);

            var hasPrimary = existingImages.Any(i => i.IsPrimary);
            var createdImages = new List<VariantImage>();

            for (var index = 0; index < request.Files.Count; index++)
            {
                var fileItem = request.Files[index];
                var isPrimary = !hasPrimary && index == 0;
                var image = new VariantImage
                {
                    ProductVariantId = request.ProductVariantId,
                    ImageUrl = string.Empty,
                    AltText = fileItem.AltText?.Trim(),
                    DisplayOrder = existingImages.Count + index + 1,
                    IsPrimary = isPrimary
                };

                await _uploadImageService.UploadAndReplaceImageAsync(
                    fileItem.Stream,
                    fileItem.FileName,
                    fileItem.ContentType,
                    "variants",
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
                new ImagesByVariantIdSpec(request.ProductVariantId),
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

        public async Task UpdateAsync(int id, UpdateVariantImageRequest request, CancellationToken cancellationToken = default)
        {
            var image = await _imageRepository.GetByIdAsync(id, cancellationToken);
            if (image == null)
            {
                throw new NotFoundException(nameof(VariantImage), id);
            }

            if (request.IsPrimary && !image.IsPrimary)
            {
                var existingImages = await _imageRepository.ListAsync(
                    new ImagesByVariantIdSpec(image.ProductVariantId),
                    cancellationToken);

                foreach (var img in existingImages.Where(i => i.IsPrimary && i.Id != id))
                {
                    img.IsPrimary = false;
                    await _imageRepository.UpdateAsync(img, cancellationToken);
                }
            }

            image.ImageUrl = request.ImageUrl.Trim();
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
                throw new NotFoundException(nameof(VariantImage), id);
            }

            if (targetImage.IsPrimary)
            {
                return;
            }

            var allImages = await _imageRepository.ListAsync(
                new ImagesByVariantIdSpec(targetImage.ProductVariantId),
                cancellationToken);

            foreach (var img in allImages)
            {
                if (img.Id == id)
                {
                    img.IsPrimary = true;
                    await _imageRepository.UpdateAsync(img, cancellationToken);
                }
                else if (img.IsPrimary)
                {
                    img.IsPrimary = false;
                    await _imageRepository.UpdateAsync(img, cancellationToken);
                }
            }
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var image = await _imageRepository.GetByIdAsync(id, cancellationToken);
            if (image == null)
            {
                throw new NotFoundException(nameof(VariantImage), id);
            }

            var wasPrimary = image.IsPrimary;
            var variantId = image.ProductVariantId;

            await _uploadImageService.DeleteImageAsync(
                image.ImageUrl,
                async () =>
                {
                    await _imageRepository.DeleteAsync(image, cancellationToken);
                },
                cancellationToken);

            var remainingImages = await _imageRepository.ListAsync(
                new ImagesByVariantIdSpec(variantId),
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

        private static VariantImageDto MapToDto(VariantImage image)
        {
            return new VariantImageDto
            {
                Id = image.Id,
                ProductVariantId = image.ProductVariantId,
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
