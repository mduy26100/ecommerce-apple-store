namespace Application.Features.Catalog.ProductOptions.DTOs
{
    public class CreateProductOptionRequest
    {
        public int ProductId { get; set; }
        public string Name { get; set; } = default!;
        public int DisplayOrder { get; set; } = 0;
    }

    public class CreateProductOptionValueRequest
    {
        public int OptionId { get; set; }
        public string Value { get; set; } = default!;
        public string? ColorHexCode { get; set; }
        public int DisplayOrder { get; set; } = 0;
    }

    public class UpdateProductOptionRequest
    {
        public string Name { get; set; } = default!;
        public int DisplayOrder { get; set; } = 0;
    }

    public class UpdateProductOptionValueRequest
    {
        public string Value { get; set; } = default!;
        public string? ColorHexCode { get; set; }
        public int DisplayOrder { get; set; } = 0;
    }
}
