namespace Application.Features.Catalog.Products.DTOs
{
    public class ProductSearchResultDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
        public string Slug { get; set; } = default!;
        public string CategoryName { get; set; } = default!;
        public string? ChipName { get; set; }
        public decimal Price { get; set; }
        public decimal? CompareAtPrice { get; set; }
        public string? ImageUrl { get; set; }
    }
}
