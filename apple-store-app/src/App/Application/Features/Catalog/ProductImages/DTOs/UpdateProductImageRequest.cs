namespace Application.Features.Catalog.ProductImages.DTOs
{
    public class UpdateProductImageRequest
    {
        public int? OptionValueId { get; set; }
        public string? AltText { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsPrimary { get; set; }
    }
}
