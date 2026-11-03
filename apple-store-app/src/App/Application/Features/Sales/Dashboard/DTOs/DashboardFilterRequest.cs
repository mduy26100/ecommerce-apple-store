namespace Application.Features.Sales.Dashboard.DTOs
{
    public class DashboardFilterRequest
    {
        public string? TimeScope { get; set; } = "30days";
        public string? ChannelScope { get; set; } = "all";
    }
}

