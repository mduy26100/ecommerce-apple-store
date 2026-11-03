namespace Application.Features.Sales.Reports.DTOs
{
    public class OrderReportExportData
    {
        public List<OrderReportDetailDto> Orders { get; set; } = new();
        public OrderReportFilterRequest Filters { get; set; } = new();
        public decimal TotalNetRevenue { get; set; }
        public decimal TotalGrossRevenue { get; set; }
        public decimal NetGrossRevenue { get; set; }
        public decimal TotalDiscount { get; set; }
        public decimal TotalShippingFee { get; set; }
    }
}

