namespace Application.Features.Sales.Carts.DTOs
{
    public class CartItemDto
    {
        public int Id { get; set; }
        public int CartId { get; set; }
        public int ProductVariantId { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = default!;
        public string ProductSlug { get; set; } = default!;
        public string SKU { get; set; } = default!;
        public string? VariantName { get; set; }
        public string? ImageUrl { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal OriginalPrice { get; set; }
        public decimal? CompareAtPrice { get; set; }
        public int Quantity { get; set; }
        public int QuantityInStock { get; set; }
        public bool IsSelected { get; set; }
        public bool IsActive { get; set; }
        public bool IsAvailable { get; set; }
        public decimal LineTotal { get; set; }
        public IReadOnlyList<CartItemAttributeDto> Attributes { get; set; } = new List<CartItemAttributeDto>();
    }
}
