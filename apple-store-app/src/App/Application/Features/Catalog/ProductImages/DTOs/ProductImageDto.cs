namespace Application.Features.Catalog.ProductImages.DTOs
{
    public class ProductImageDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public int? OptionValueId { get; set; }
        public string? OptionValueName { get; set; }
        public string? ColorHexCode { get; set; }
        public string ImageUrl { get; set; } = default!;
        public string? AltText { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsPrimary { get; set; }
        public DateTimeOffset CreatedOn { get; set; }
        public DateTimeOffset? LastModifiedOn { get; set; }
    }
}
