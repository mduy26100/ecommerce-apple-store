namespace Application.Features.Sales.Carts.DTOs
{
    public class CartDto
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public string? GuestId { get; set; }
        public int TotalItems { get; set; }
        public int SelectedItemsCount { get; set; }
        public decimal Subtotal { get; set; }
        public IReadOnlyList<CartItemDto> Items { get; set; } = new List<CartItemDto>();
    }
}
