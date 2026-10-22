namespace Application.Features.Catalog.Products.DTOs
{
    public class CategoryProductShowcaseDto
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string CategorySlug { get; set; } = string.Empty;
        public string? CategoryDescription { get; set; }
        public IReadOnlyList<ProductCardDto> Products { get; set; } = new List<ProductCardDto>();
    }
}
