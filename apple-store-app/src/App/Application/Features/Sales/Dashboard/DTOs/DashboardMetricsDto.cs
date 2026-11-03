namespace Application.Features.Sales.Dashboard.DTOs
{
    public class DashboardMetricsDto
    {
        public int OrdersCount { get; set; }
        public decimal? OrdersGrowthPercentage { get; set; }
        public decimal NetRevenue { get; set; }
        public decimal? RevenueGrowthPercentage { get; set; }
        public decimal EstimatedRevenue { get; set; }
        public decimal AverageOrderValue { get; set; }
        public int NewUsersCount { get; set; }
        public int ActiveUsersCount { get; set; }
        public decimal RetentionRate { get; set; }
        public int TotalProductsCount { get; set; }
        public int ActiveProductsCount { get; set; }
        public int TotalCategoriesCount { get; set; }
        public int ActiveCategoriesCount { get; set; }
        public int TotalSkusCount { get; set; }
        public int TotalStockQuantity { get; set; }
        public int ActiveSkusCount { get; set; }
        public int LowStockSkusCount { get; set; }
    }
}

