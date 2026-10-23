namespace Application.Features.Catalog.ProductSpecifications.DTOs
{
    public class UpdateProductSpecificationGroupRequest
    {
        public string Name { get; set; } = default!;
        public int? DisplayOrder { get; set; }
    }
}
