namespace Application.Features.Sales.Reports.DTOs
{
    public class OrderKpiSummaryDto
    {
        public decimal TotalRevenue { get; set; }
        public decimal TotalGrossAmount { get; set; }
        public decimal NetGrossAmount { get; set; }
        public int TotalOrders { get; set; }
        public int TotalCustomers { get; set; }
        public decimal SuccessRate { get; set; }
        public decimal CancelledRate { get; set; }
        public decimal AverageOrderValue { get; set; }
        public decimal TotalDiscount { get; set; }
        public decimal TotalShippingFee { get; set; }
        public decimal? GrowthRevenuePercentage { get; set; }
        public decimal? GrowthOrdersPercentage { get; set; }
        public decimal? GrowthCustomersPercentage { get; set; }
        public decimal PreviousRevenue { get; set; }
        public int PreviousOrders { get; set; }
        public int PreviousCustomers { get; set; }
    }
}

