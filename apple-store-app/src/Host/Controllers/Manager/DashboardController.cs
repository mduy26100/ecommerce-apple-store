using Application.Features.Sales.Dashboard.DTOs;
using Application.Features.Sales.Dashboard.Services;

namespace Host.Controllers.Manager
{
    [Tags("Manager - Dashboard")]
    [Route("api/manager/dashboard")]
    public class DashboardController : BaseManagerController
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("metrics")]
        public async Task<IActionResult> GetMetrics([FromQuery] DashboardFilterRequest request, CancellationToken cancellationToken)
        {
            var result = await _dashboardService.GetMetricsAsync(request, cancellationToken);
            return Ok(result);
        }

        [HttpGet("action-center")]
        public async Task<IActionResult> GetActionCenter([FromQuery] DashboardFilterRequest request, CancellationToken cancellationToken)
        {
            var result = await _dashboardService.GetActionCenterAsync(request, cancellationToken);
            return Ok(result);
        }

        [HttpGet("trends")]
        public async Task<IActionResult> GetTrends([FromQuery] DashboardFilterRequest request, CancellationToken cancellationToken)
        {
            var result = await _dashboardService.GetTrendsAsync(request, cancellationToken);
            return Ok(result);
        }

        [HttpGet("rankings")]
        public async Task<IActionResult> GetRankings([FromQuery] DashboardFilterRequest request, CancellationToken cancellationToken)
        {
            var result = await _dashboardService.GetRankingsAsync(request, cancellationToken);
            return Ok(result);
        }
    }
}

