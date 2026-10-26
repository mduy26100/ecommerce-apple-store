namespace Application.Features.Sales.Carts.DTOs
{
    public class UpdateCartItemSelectionRequest
    {
        public int ProductVariantId { get; set; }
        public bool IsSelected { get; set; }
        public string? GuestId { get; set; }
    }
}
