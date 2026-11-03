namespace Application.Features.Sales.Reports.DTOs
{
    public class OrderReportItemDto
    {
        public int Id { get; set; }
        public string ProductName { get; set; } = default!;
        public string Sku { get; set; } = default!;
        public string? VariantName { get; set; }
        public string? ColorName { get; set; }
        public string? StorageName { get; set; }
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal LineTotal { get; set; }
        public string? ThumbnailUrl { get; set; }
    }
}

