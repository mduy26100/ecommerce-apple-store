namespace Application.Features.Catalog.ProductSpecifications.DTOs
{
    public class CreateProductSpecificationRequest
    {
        public int ProductId { get; set; }
        public int? ProductVariantId { get; set; }
        public string? GroupName { get; set; }
        public string Name { get; set; } = default!;
        public string Value { get; set; } = default!;
        public string? Unit { get; set; }
        public int DisplayOrder { get; set; } = 0;
    }
}
