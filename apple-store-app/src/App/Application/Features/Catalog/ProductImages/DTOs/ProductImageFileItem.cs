namespace Application.Features.Catalog.ProductImages.DTOs
{
    public class ProductImageFileItem
    {
        public Stream Stream { get; set; } = default!;
        public string FileName { get; set; } = default!;
        public string ContentType { get; set; } = default!;
        public string? AltText { get; set; }
    }
}
