namespace Application.Features.Catalog.ProductSpecifications.DTOs
{
    public class CreateProductSpecificationGroupRequest
    {
        public int ProductId { get; set; }
        public string Name { get; set; } = default!;
        public int? DisplayOrder { get; set; }
    }
}
