namespace Application.Features.Catalog.Products.DTOs
{
    public class ProductCardDto
    {
        public int Id { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = default!;
        public string Name { get; set; } = default!;
        public string Slug { get; set; } = default!;
        public string? ChipName { get; set; }
        public string? BadgeText { get; set; }
        public string? ShortDescription { get; set; }
        public decimal Price { get; set; }
        public string? ImageUrl { get; set; }
    }
}
