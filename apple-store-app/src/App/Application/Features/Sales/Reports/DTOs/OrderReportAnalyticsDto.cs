namespace Application.Features.Sales.Reports.DTOs
{
    public class OrderReportAnalyticsDto
    {
        public List<DailyOrderTrendDto> DailyTrends { get; set; } = new();
        public List<PaymentMethodAnalyticsDto> PaymentMethods { get; set; } = new();
        public CustomerSegmentAnalyticsDto CustomerSegments { get; set; } = new();
        public List<OrderStatusAnalyticsDto> StatusDistribution { get; set; } = new();
        public List<TopSellingProductDto> TopSellingProducts { get; set; } = new();
        public List<SlowMovingProductDto> SlowMovingProducts { get; set; } = new();
        public CashflowSummaryDto CashflowSummary { get; set; } = new();
        public PeriodMetricsDto PeriodMetrics { get; set; } = new();
    }

    public class CashflowSummaryDto
    {
        public decimal SafeCashflow { get; set; }
        public decimal OperatingCashflow { get; set; }
        public decimal LostCashflow { get; set; }
    }

    public class PeriodMetricsDto
    {
        public decimal TotalNetRevenue { get; set; }
        public decimal TotalGrossRevenue { get; set; }
        public decimal NetGrossRevenue { get; set; }
        public int TotalOrders { get; set; }
        public int SuccessfulOrders { get; set; }
        public decimal SuccessRate { get; set; }
        public decimal TotalPaymentRevenue { get; set; }
        public decimal VnpayPercentage { get; set; }
        public decimal CodPercentage { get; set; }
        public int TotalCustomerOrders { get; set; }
        public decimal TotalCustomerRevenue { get; set; }
        public decimal MemberOrdersRatio { get; set; }
        public decimal GuestOrdersRatio { get; set; }
    }

    public class TopSellingProductDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? CategoryName { get; set; }
        public int UnitsSold { get; set; }
        public decimal TotalRevenue { get; set; }
        public int CurrentStock { get; set; }
    }

    public class SlowMovingProductDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? CategoryName { get; set; }
        public int UnitsSold { get; set; }
        public int CurrentStock { get; set; }
        public decimal Price { get; set; }
    }

    public class DailyOrderTrendDto
    {
        public string Date { get; set; } = string.Empty;
        public string FormattedDate { get; set; } = string.Empty;
        public decimal NetRevenue { get; set; }
        public decimal GrossRevenue { get; set; }
        public int TotalOrders { get; set; }
        public int SuccessfulOrders { get; set; }
        public int CancelledOrders { get; set; }
        public decimal AverageOrderValue { get; set; }
    }

    public class PaymentMethodAnalyticsDto
    {
        public string Method { get; set; } = string.Empty;
        public string MethodName { get; set; } = string.Empty;
        public int TotalOrders { get; set; }
        public int SuccessfulOrders { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal RevenuePercentage { get; set; }
        public decimal SuccessRate { get; set; }
        public decimal AverageOrderValue { get; set; }
    }

    public class CustomerSegmentAnalyticsDto
    {
        public int MemberOrders { get; set; }
        public decimal MemberRevenue { get; set; }
        public decimal MemberAov { get; set; }
        public decimal MemberPercentage { get; set; }
        public int GuestOrders { get; set; }
        public decimal GuestRevenue { get; set; }
        public decimal GuestAov { get; set; }
        public decimal GuestPercentage { get; set; }
    }

    public class OrderStatusAnalyticsDto
    {
        public string Status { get; set; } = string.Empty;
        public string StatusName { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal Percentage { get; set; }
    }

    public class OrderTrendsReportDto
    {
        public List<DailyOrderTrendDto> DailyTrends { get; set; } = new();
        public PeriodMetricsDto PeriodMetrics { get; set; } = new();
    }

    public class PaymentMethodsReportDto
    {
        public List<PaymentMethodAnalyticsDto> PaymentMethods { get; set; } = new();
        public decimal TotalPaymentRevenue { get; set; }
        public decimal VnpayPercentage { get; set; }
        public decimal CodPercentage { get; set; }
    }

    public class CustomerSegmentsReportDto
    {
        public CustomerSegmentAnalyticsDto CustomerSegments { get; set; } = new();
        public int TotalCustomerOrders { get; set; }
        public decimal TotalCustomerRevenue { get; set; }
        public decimal MemberOrdersRatio { get; set; }
        public decimal GuestOrdersRatio { get; set; }
    }

    public class CashflowReportDto
    {
        public CashflowSummaryDto CashflowSummary { get; set; } = new();
        public List<OrderStatusAnalyticsDto> StatusDistribution { get; set; } = new();
    }

    public class ProductPerformanceReportDto
    {
        public List<TopSellingProductDto> TopSellingProducts { get; set; } = new();
        public List<SlowMovingProductDto> SlowMovingProducts { get; set; } = new();
    }
}
