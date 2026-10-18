namespace Application.Features.Catalog.Products.DTOs
{
    public class ProductSummaryDto
    {
        public int Id { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = default!;
        public string Name { get; set; } = default!;
        public string Slug { get; set; } = default!;
        public string? ModelCode { get; set; }
        public string? ShortDescription { get; set; }
        public short? WarrantyMonths { get; set; }
        public bool IsActive { get; set; }
        public int VariantsCount { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public DateTimeOffset CreatedOn { get; set; }
        public DateTimeOffset? LastModifiedOn { get; set; }
    }
}
