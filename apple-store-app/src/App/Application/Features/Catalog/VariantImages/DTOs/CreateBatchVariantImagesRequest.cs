namespace Application.Features.Catalog.VariantImages.DTOs
{
    public class VariantImageFileItem
    {
        public Stream Stream { get; set; } = default!;
        public string FileName { get; set; } = default!;
        public string? ContentType { get; set; }
        public string? AltText { get; set; }
    }

    public class CreateBatchVariantImagesRequest
    {
        public int ProductVariantId { get; set; }
        public List<VariantImageFileItem> Files { get; set; } = new();
    }
}
