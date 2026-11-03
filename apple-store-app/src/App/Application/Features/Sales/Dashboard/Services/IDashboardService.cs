using Application.Features.Sales.Dashboard.DTOs;

namespace Application.Features.Sales.Dashboard.Services
{
    public interface IDashboardService
    {
        Task<DashboardMetricsDto> GetMetricsAsync(DashboardFilterRequest request, CancellationToken cancellationToken = default);
        Task<DashboardActionCenterDto> GetActionCenterAsync(DashboardFilterRequest request, CancellationToken cancellationToken = default);
        Task<DashboardTrendsDto> GetTrendsAsync(DashboardFilterRequest request, CancellationToken cancellationToken = default);
        Task<DashboardRankingsDto> GetRankingsAsync(DashboardFilterRequest request, CancellationToken cancellationToken = default);
    }
}

