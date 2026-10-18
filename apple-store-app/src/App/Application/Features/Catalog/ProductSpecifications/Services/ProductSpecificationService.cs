using Application.Common.Interfaces.Persistence;
using Application.Features.Catalog.ProductSpecifications.DTOs;
using Application.Features.Catalog.ProductSpecifications.Specifications;
using Domain.Entities.Catalog;
using Domain.Exceptions;

namespace Application.Features.Catalog.ProductSpecifications.Services
{
    public class ProductSpecificationService : IProductSpecificationService
    {
        private readonly IRepository<ProductSpecification> _specRepository;
        private readonly IRepository<Product> _productRepository;

        public ProductSpecificationService(
            IRepository<ProductSpecification> specRepository,
            IRepository<Product> productRepository)
        {
            _specRepository = specRepository;
            _productRepository = productRepository;
        }

        public async Task<IReadOnlyList<ProductSpecificationDto>> GetByProductIdAsync(int productId, CancellationToken cancellationToken = default)
        {
            var product = await _productRepository.GetByIdAsync(productId, cancellationToken);
            if (product == null)
            {
                throw new NotFoundException(nameof(Product), productId);
            }

            var spec = new SpecsByProductIdSpec(productId);
            var specs = await _specRepository.ListAsync(spec, cancellationToken);

            return specs.Select(MapToDto).ToList();
        }

        public async Task<ProductSpecificationDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var entity = await _specRepository.GetByIdAsync(id, cancellationToken);
            if (entity == null)
            {
                throw new NotFoundException(nameof(ProductSpecification), id);
            }

            return MapToDto(entity);
        }

        public async Task<int> CreateAsync(CreateProductSpecificationRequest request, CancellationToken cancellationToken = default)
        {
            var product = await _productRepository.GetByIdAsync(request.ProductId, cancellationToken);
            if (product == null)
            {
                throw new NotFoundException(nameof(Product), request.ProductId);
            }

            var entity = new ProductSpecification
            {
                ProductId = request.ProductId,
                ProductVariantId = request.ProductVariantId > 0 ? request.ProductVariantId : null,
                GroupName = request.GroupName?.Trim(),
                Name = request.Name.Trim(),
                Value = request.Value.Trim(),
                Unit = request.Unit?.Trim(),
                DisplayOrder = request.DisplayOrder
            };

            await _specRepository.AddAsync(entity, cancellationToken);
            return entity.Id;
        }

        public async Task UpdateAsync(int id, UpdateProductSpecificationRequest request, CancellationToken cancellationToken = default)
        {
            var entity = await _specRepository.GetByIdAsync(id, cancellationToken);
            if (entity == null)
            {
                throw new NotFoundException(nameof(ProductSpecification), id);
            }

            entity.ProductVariantId = request.ProductVariantId > 0 ? request.ProductVariantId : null;
            entity.GroupName = request.GroupName?.Trim();
            entity.Name = request.Name.Trim();
            entity.Value = request.Value.Trim();
            entity.Unit = request.Unit?.Trim();
            entity.DisplayOrder = request.DisplayOrder;

            await _specRepository.UpdateAsync(entity, cancellationToken);
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var entity = await _specRepository.GetByIdAsync(id, cancellationToken);
            if (entity == null)
            {
                throw new NotFoundException(nameof(ProductSpecification), id);
            }

            await _specRepository.DeleteAsync(entity, cancellationToken);
        }

        private static ProductSpecificationDto MapToDto(ProductSpecification spec)
        {
            return new ProductSpecificationDto
            {
                Id = spec.Id,
                ProductId = spec.ProductId,
                ProductVariantId = spec.ProductVariantId,
                GroupName = spec.GroupName,
                Name = spec.Name,
                Value = spec.Value,
                Unit = spec.Unit,
                DisplayOrder = spec.DisplayOrder,
                CreatedOn = spec.CreatedOn,
                LastModifiedOn = spec.LastModifiedOn
            };
        }
    }
}
