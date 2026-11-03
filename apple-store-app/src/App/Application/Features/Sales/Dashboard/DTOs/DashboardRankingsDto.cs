namespace Application.Features.Sales.Dashboard.DTOs
{
    public class TopSellingProductDto
    {
        public string ProductName { get; set; } = default!;
        public string Sku { get; set; } = default!;
        public string? ThumbnailUrl { get; set; }
        public int QuantitySold { get; set; }
        public decimal TotalRevenue { get; set; }
    }

    public class LowStockProductDto
    {
        public string ProductName { get; set; } = default!;
        public string Sku { get; set; } = default!;
        public int QuantityInStock { get; set; }
        public decimal Price { get; set; }
    }

    public class TopCustomerDto
    {
        public string CustomerName { get; set; } = default!;
        public string CustomerPhone { get; set; } = default!;
        public string? CustomerEmail { get; set; }
        public string CustomerType { get; set; } = default!;
        public int OrdersCount { get; set; }
        public decimal TotalSpent { get; set; }
    }

    public class RecentActivityOrderDto
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; } = default!;
        public string RecipientName { get; set; } = default!;
        public string RecipientPhone { get; set; } = default!;
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = default!;
        public string StatusName { get; set; } = default!;
        public string PaymentMethodName { get; set; } = default!;
        public string PaymentStatusName { get; set; } = default!;
        public DateTimeOffset PlacedAt { get; set; }
    }

    public class DashboardRankingsDto
    {
        public List<TopSellingProductDto> TopSellingProducts { get; set; } = new();
        public List<LowStockProductDto> LowStockProducts { get; set; } = new();
        public List<TopCustomerDto> TopCustomers { get; set; } = new();
        public List<RecentActivityOrderDto> RecentOrders { get; set; } = new();
    }
}

