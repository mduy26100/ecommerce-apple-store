using Application.Features.Sales.Reports.DTOs;
using Application.Features.Sales.Reports.Services;

namespace Host.Controllers.Manager
{
    [Tags("Manager - Reports")]
    [Route("api/manager/reports/orders")]
    public class OrderReportsController : BaseManagerController
    {
        private readonly IOrderReportService _reportService;

        public OrderReportsController(IOrderReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary([FromQuery] OrderReportFilterRequest request, CancellationToken cancellationToken)
        {
            var result = await _reportService.GetSummaryAsync(request, cancellationToken);
            return Ok(result);
        }

        [HttpGet("status-breakdown")]
        public async Task<IActionResult> GetStatusBreakdown([FromQuery] OrderReportFilterRequest request, CancellationToken cancellationToken)
        {
            var result = await _reportService.GetStatusBreakdownAsync(request, cancellationToken);
            return Ok(result);
        }

        [HttpGet("details")]
        public async Task<IActionResult> GetDetails([FromQuery] OrderReportFilterRequest request, CancellationToken cancellationToken)
        {
            var result = await _reportService.GetDetailsAsync(request, cancellationToken);
            return Ok(result);
        }

        [HttpGet("export")]
        public async Task<IActionResult> GetExportOrders([FromQuery] OrderReportFilterRequest request, CancellationToken cancellationToken)
        {
            var result = await _reportService.GetExportOrdersAsync(request, cancellationToken);
            return Ok(result);
        }

        [HttpGet("export-excel")]
        public async Task<IActionResult> ExportExcel([FromQuery] OrderReportFilterRequest request, CancellationToken cancellationToken)
        {
            var (fileBytes, fileName, _) = await _reportService.ExportOrdersExcelAsync(request, cancellationToken);
            return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }

        [HttpGet("analytics")]
        public async Task<IActionResult> GetAnalytics([FromQuery] OrderReportFilterRequest request, CancellationToken cancellationToken)
        {
            var result = await _reportService.GetAnalyticsAsync(request, cancellationToken);
            return Ok(result);
        }

        [HttpGet("trends")]
        public async Task<IActionResult> GetTrends([FromQuery] OrderReportFilterRequest request, CancellationToken cancellationToken)
        {
            var result = await _reportService.GetTrendsAsync(request, cancellationToken);
            return Ok(result);
        }

        [HttpGet("payments")]
        public async Task<IActionResult> GetPayments([FromQuery] OrderReportFilterRequest request, CancellationToken cancellationToken)
        {
            var result = await _reportService.GetPaymentsAsync(request, cancellationToken);
            return Ok(result);
        }

        [HttpGet("customers")]
        public async Task<IActionResult> GetCustomers([FromQuery] OrderReportFilterRequest request, CancellationToken cancellationToken)
        {
            var result = await _reportService.GetCustomersAsync(request, cancellationToken);
            return Ok(result);
        }

        [HttpGet("cashflow")]
        public async Task<IActionResult> GetCashflow([FromQuery] OrderReportFilterRequest request, CancellationToken cancellationToken)
        {
            var result = await _reportService.GetCashflowAsync(request, cancellationToken);
            return Ok(result);
        }

        [HttpGet("products")]
        public async Task<IActionResult> GetProducts([FromQuery] OrderReportFilterRequest request, CancellationToken cancellationToken)
        {
            var result = await _reportService.GetProductsAsync(request, cancellationToken);
            return Ok(result);
        }
    }
}

