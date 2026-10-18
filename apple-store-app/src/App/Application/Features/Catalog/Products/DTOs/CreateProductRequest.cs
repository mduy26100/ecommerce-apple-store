namespace Application.Features.Catalog.Products.DTOs
{
    public class CreateProductRequest
    {
        public int CategoryId { get; set; }
        public string Name { get; set; } = default!;
        public string Slug { get; set; } = default!;
        public string? ModelCode { get; set; }
        public string? ShortDescription { get; set; }
        public string? Description { get; set; }
        public short? WarrantyMonths { get; set; } = 12;
        public bool IsActive { get; set; } = true;
    }
}
