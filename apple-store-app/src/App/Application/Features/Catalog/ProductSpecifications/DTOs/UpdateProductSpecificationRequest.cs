namespace Application.Features.Catalog.ProductSpecifications.DTOs
{
    public class UpdateProductSpecificationRequest
    {
        public string Name { get; set; } = default!;
        public string Value { get; set; } = default!;
        public string? Unit { get; set; }
        public int? DisplayOrder { get; set; }
    }
}
