namespace Application.Features.Sales.Orders.DTOs
{
    public class CreateOrderItemRequest
    {
        public int? ProductVariantId { get; set; }
        public string ProductName { get; set; } = default!;
        public string SKU { get; set; } = default!;
        public string? VariantName { get; set; }
        public string? ThumbnailUrl { get; set; }
        public string? SelectedAttributesJson { get; set; }
        public string? ColorName { get; set; }
        public string? StorageName { get; set; }
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
    }

    public class CreateOrderRequest
    {
        public int? UserId { get; set; }
        public string? GuestId { get; set; }
        public string RecipientName { get; set; } = default!;
        public string RecipientPhone { get; set; } = default!;
        public string? RecipientEmail { get; set; }
        public string ShippingAddressLine { get; set; } = default!;
        public string? ShippingWard { get; set; }
        public string? ShippingDistrict { get; set; }
        public string ShippingProvince { get; set; } = default!;
        public string? CustomerNote { get; set; }
        public string PaymentMethod { get; set; } = "COD";
        public decimal ShippingFee { get; set; } = 0;
        public string? VoucherCode { get; set; }
        public List<CreateOrderItemRequest> Items { get; set; } = new();
    }
}
