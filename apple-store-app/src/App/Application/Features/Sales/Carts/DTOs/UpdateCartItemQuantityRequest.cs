namespace Application.Features.Sales.Carts.DTOs
{
    public class UpdateCartItemQuantityRequest
    {
        public int ProductVariantId { get; set; }
        public int Quantity { get; set; }
        public string? GuestId { get; set; }
    }
}
