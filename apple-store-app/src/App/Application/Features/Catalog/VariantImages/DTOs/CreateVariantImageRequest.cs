namespace Application.Features.Catalog.VariantImages.DTOs
{
    public class CreateVariantImageRequest
    {
        public int ProductVariantId { get; set; }
        public string? ImageUrl { get; set; }
        public string? AltText { get; set; }
        public int DisplayOrder { get; set; } = 0;
        public bool IsPrimary { get; set; } = false;
        public Stream? ImageStream { get; set; }
        public string? ImageFileName { get; set; }
        public string? ImageContentType { get; set; }
    }
}
