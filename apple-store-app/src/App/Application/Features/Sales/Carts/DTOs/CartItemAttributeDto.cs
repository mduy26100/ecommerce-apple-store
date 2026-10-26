namespace Application.Features.Sales.Carts.DTOs
{
    public class CartItemAttributeDto
    {
        public string OptionName { get; set; } = default!;
        public string Value { get; set; } = default!;
        public string? ColorHexCode { get; set; }
    }
}
