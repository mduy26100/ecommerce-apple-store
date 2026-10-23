namespace Application.Features.Catalog.ProductSpecifications.DTOs
{
    public class CreateProductSpecificationRequest
    {
        public int GroupId { get; set; }
        public string Name { get; set; } = default!;
        public string Value { get; set; } = default!;
        public string? Unit { get; set; }
        public int? DisplayOrder { get; set; }
    }
}
