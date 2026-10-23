namespace Application.Features.Catalog.ProductImages.DTOs
{
    public class CreateBatchProductImagesRequest
    {
        public int ProductId { get; set; }
        public int? OptionValueId { get; set; }
        public List<ProductImageFileItem> Files { get; set; } = new();
    }
}
