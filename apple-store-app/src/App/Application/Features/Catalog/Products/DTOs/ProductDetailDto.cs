using Application.Features.Catalog.ProductImages.DTOs;
using Application.Features.Catalog.ProductSpecifications.DTOs;
using Application.Features.Catalog.ProductVariants.DTOs;

namespace Application.Features.Catalog.Products.DTOs
{
    public class ProductDetailDto
    {
        public int Id { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = default!;
        public string CategorySlug { get; set; } = default!;
        public string Name { get; set; } = default!;
        public string Slug { get; set; } = default!;
        public string? ModelCode { get; set; }
        public string? ShortDescription { get; set; }
        public string? Description { get; set; }
        public short? WarrantyMonths { get; set; }
        public bool IsActive { get; set; }
        public IReadOnlyList<ProductImageDto> Images { get; set; } = new List<ProductImageDto>();
        public IReadOnlyList<ProductOptionDto> Options { get; set; } = new List<ProductOptionDto>();
        public IReadOnlyList<ProductVariantDto> Variants { get; set; } = new List<ProductVariantDto>();
        public IReadOnlyList<ProductSpecificationGroupDto> SpecificationGroups { get; set; } = new List<ProductSpecificationGroupDto>();
        public IReadOnlyList<ProductSpecificationDto> Specifications { get; set; } = new List<ProductSpecificationDto>();
        public DateTimeOffset CreatedOn { get; set; }
        public DateTimeOffset? LastModifiedOn { get; set; }
    }
}
