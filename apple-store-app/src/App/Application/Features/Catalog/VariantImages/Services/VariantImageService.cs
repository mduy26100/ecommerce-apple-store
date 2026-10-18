using Application.Common.Interfaces.Persistence;
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

        public VariantImageService(
            IRepository<VariantImage> imageRepository,
            IRepository<ProductVariant> variantRepository)
        {
            _imageRepository = imageRepository;
            _variantRepository = variantRepository;
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

            return images.Select(MapToDto).ToList();
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
                ImageUrl = request.ImageUrl.Trim(),
                AltText = request.AltText?.Trim(),
                DisplayOrder = request.DisplayOrder,
                IsPrimary = isPrimary
            };

            await _imageRepository.AddAsync(newImage, cancellationToken);
            return newImage.Id;
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

            if (wasPrimary)
            {
                image.IsPrimary = false;
                await _imageRepository.UpdateAsync(image, cancellationToken);
            }

            await _imageRepository.DeleteAsync(image, cancellationToken);

            if (wasPrimary)
            {
                var remainingImages = await _imageRepository.ListAsync(
                    new ImagesByVariantIdSpec(variantId),
                    cancellationToken);

                var nextPrimary = remainingImages.FirstOrDefault();
                if (nextPrimary != null)
                {
                    nextPrimary.IsPrimary = true;
                    await _imageRepository.UpdateAsync(nextPrimary, cancellationToken);
                }
            }
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
