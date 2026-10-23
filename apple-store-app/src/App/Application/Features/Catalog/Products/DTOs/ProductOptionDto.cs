namespace Application.Features.Catalog.Products.DTOs
{
    public class ProductOptionDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string Name { get; set; } = default!;
        public int DisplayOrder { get; set; }
        public IReadOnlyList<ProductOptionValueDto> Values { get; set; } = new List<ProductOptionValueDto>();
    }

    public class ProductOptionValueDto
    {
        public int Id { get; set; }
        public int OptionId { get; set; }
        public string Value { get; set; } = default!;
        public string? ColorHexCode { get; set; }
        public int DisplayOrder { get; set; }
        public bool HasVariants { get; set; }
        public bool InStock { get; set; }
    }
}
