namespace Application.Features.Catalog.ProductSpecifications.DTOs
{
    public class ProductSpecificationDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public int? ProductVariantId { get; set; }
        public string? GroupName { get; set; }
        public string Name { get; set; } = default!;
        public string Value { get; set; } = default!;
        public string? Unit { get; set; }
        public int DisplayOrder { get; set; }
        public DateTimeOffset CreatedOn { get; set; }
        public DateTimeOffset? LastModifiedOn { get; set; }
    }
}
