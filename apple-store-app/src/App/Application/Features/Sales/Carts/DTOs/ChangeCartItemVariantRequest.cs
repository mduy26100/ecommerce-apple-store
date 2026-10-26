namespace Application.Features.Sales.Carts.DTOs
{
    public class ChangeCartItemVariantRequest
    {
        public int CartItemId { get; set; }
        public int NewProductVariantId { get; set; }
        public string? GuestId { get; set; }
    }
}
