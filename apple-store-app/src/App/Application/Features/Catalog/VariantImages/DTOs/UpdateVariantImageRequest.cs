namespace Application.Features.Catalog.VariantImages.DTOs
{
    public class UpdateVariantImageRequest
    {
        public string ImageUrl { get; set; } = default!;
        public string? AltText { get; set; }
        public int DisplayOrder { get; set; } = 0;
        public bool IsPrimary { get; set; } = false;
    }
}
