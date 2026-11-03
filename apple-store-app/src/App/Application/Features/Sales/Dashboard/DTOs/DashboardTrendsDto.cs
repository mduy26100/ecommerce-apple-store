namespace Application.Features.Sales.Dashboard.DTOs
{
    public class DailyRevenueTrendDto
    {
        public string Date { get; set; } = default!;
        public string DateLabel { get; set; } = default!;
        public decimal Revenue { get; set; }
        public int OrdersCount { get; set; }
    }

    public class StatusDistributionDto
    {
        public string Status { get; set; } = default!;
        public string StatusName { get; set; } = default!;
        public int Count { get; set; }
        public decimal Percentage { get; set; }
    }

    public class PaymentMethodDistributionDto
    {
        public string Method { get; set; } = default!;
        public string MethodName { get; set; } = default!;
        public int Count { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal Percentage { get; set; }
    }

    public class CustomerGrowthTrendDto
    {
        public string DateLabel { get; set; } = default!;
        public int NewCustomers { get; set; }
        public int ActiveCustomers { get; set; }
    }

    public class CategoryDistributionDto
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = default!;
        public int ProductsCount { get; set; }
        public int VariantsCount { get; set; }
        public int TotalStock { get; set; }
        public decimal Percentage { get; set; }
    }

    public class DashboardTrendsDto
    {
        public List<DailyRevenueTrendDto> RevenueTrends { get; set; } = new();
        public List<StatusDistributionDto> StatusDistribution { get; set; } = new();
        public List<PaymentMethodDistributionDto> PaymentDistribution { get; set; } = new();
        public List<CustomerGrowthTrendDto> CustomerTrends { get; set; } = new();
        public List<CategoryDistributionDto> CategoryDistribution { get; set; } = new();
    }
}

