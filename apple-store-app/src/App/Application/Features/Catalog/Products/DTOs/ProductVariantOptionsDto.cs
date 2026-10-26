namespace Application.Features.Catalog.Products.DTOs
{
    public class ProductVariantOptionsDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = default!;
        public string ProductSlug { get; set; } = default!;
        public string? PrimaryImageUrl { get; set; }
        public IReadOnlyList<ProductOptionSelectorDto> Options { get; set; } = new List<ProductOptionSelectorDto>();
        public IReadOnlyList<ProductVariantSelectorDto> Variants { get; set; } = new List<ProductVariantSelectorDto>();
    }

    public class ProductOptionSelectorDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
        public int DisplayOrder { get; set; }
        public IReadOnlyList<ProductOptionValueSelectorDto> Values { get; set; } = new List<ProductOptionValueSelectorDto>();
    }

    public class ProductOptionValueSelectorDto
    {
        public int Id { get; set; }
        public string Value { get; set; } = default!;
        public string? ColorHexCode { get; set; }
        public int DisplayOrder { get; set; }
    }

    public class ProductVariantSelectorDto
    {
        public int Id { get; set; }
        public string SKU { get; set; } = default!;
        public string? VariantName { get; set; }
        public decimal Price { get; set; }
        public decimal? CompareAtPrice { get; set; }
        public int QuantityInStock { get; set; }
        public bool IsActive { get; set; }
        public string? ImageUrl { get; set; }
        public IReadOnlyList<int> OptionValueIds { get; set; } = new List<int>();
    }
}
