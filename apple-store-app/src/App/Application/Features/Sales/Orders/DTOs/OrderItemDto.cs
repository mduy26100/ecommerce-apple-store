namespace Application.Features.Sales.Orders.DTOs
{
    public class OrderItemDto
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public int? ProductVariantId { get; set; }
        public string ProductName { get; set; } = default!;
        public string SKU { get; set; } = default!;
        public string? VariantName { get; set; }
        public string? ThumbnailUrl { get; set; }
        public string? SelectedAttributesJson { get; set; }
        public string? ColorName { get; set; }
        public string? StorageName { get; set; }
        public decimal CostPrice { get; set; }
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal LineTotal { get; set; }
    }
}
