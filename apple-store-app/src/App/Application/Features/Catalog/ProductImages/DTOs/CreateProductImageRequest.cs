namespace Application.Features.Catalog.ProductImages.DTOs
{
    public class CreateProductImageRequest
    {
        public int ProductId { get; set; }
        public int? OptionValueId { get; set; }
        public string? AltText { get; set; }
        public int DisplayOrder { get; set; } = 0;
        public bool IsPrimary { get; set; } = false;
        public Stream? ImageStream { get; set; }
        public string? ImageFileName { get; set; }
        public string? ImageContentType { get; set; }
    }
}
