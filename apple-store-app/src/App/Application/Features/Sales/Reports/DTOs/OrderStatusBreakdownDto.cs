namespace Application.Features.Sales.Reports.DTOs
{
    public class OrderStatusBreakdownDto
    {
        public string Status { get; set; } = default!;
        public string StatusName { get; set; } = default!;
        public int Count { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal Percentage { get; set; }
    }
}

