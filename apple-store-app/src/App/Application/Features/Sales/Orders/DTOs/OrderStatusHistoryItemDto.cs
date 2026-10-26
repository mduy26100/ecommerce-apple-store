namespace Application.Features.Sales.Orders.DTOs
{
    public class OrderStatusHistoryItemDto
    {
        public string Status { get; set; } = default!;
        public string StatusName { get; set; } = default!;
        public DateTimeOffset ChangedAt { get; set; }
        public string Actor { get; set; } = default!;
        public string? ActorName { get; set; }
        public string? Note { get; set; }
    }
}
