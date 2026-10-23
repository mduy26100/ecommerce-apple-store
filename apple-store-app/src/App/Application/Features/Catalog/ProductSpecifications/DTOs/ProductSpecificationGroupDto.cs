namespace Application.Features.Catalog.ProductSpecifications.DTOs
{
    public class ProductSpecificationGroupDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string Name { get; set; } = default!;
        public int DisplayOrder { get; set; }
        public IReadOnlyList<ProductSpecificationDto> Specifications { get; set; } = new List<ProductSpecificationDto>();
        public DateTimeOffset CreatedOn { get; set; }
        public DateTimeOffset? LastModifiedOn { get; set; }
    }
}
