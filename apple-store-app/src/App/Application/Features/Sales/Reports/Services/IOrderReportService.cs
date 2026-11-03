using Application.Features.Sales.Reports.DTOs;
using Application.Wrappers;

namespace Application.Features.Sales.Reports.Services
{
    public interface IOrderReportService
    {
        Task<OrderKpiSummaryDto> GetSummaryAsync(OrderReportFilterRequest request, CancellationToken cancellationToken = default);
        Task<List<OrderStatusBreakdownDto>> GetStatusBreakdownAsync(OrderReportFilterRequest request, CancellationToken cancellationToken = default);
        Task<PagedList<OrderReportDetailDto>> GetDetailsAsync(OrderReportFilterRequest request, CancellationToken cancellationToken = default);
        Task<List<OrderReportDetailDto>> GetExportOrdersAsync(OrderReportFilterRequest request, CancellationToken cancellationToken = default);
        Task<(byte[] FileBytes, string FileName, int TotalRows)> ExportOrdersExcelAsync(OrderReportFilterRequest request, CancellationToken cancellationToken = default);
        Task<OrderReportAnalyticsDto> GetAnalyticsAsync(OrderReportFilterRequest request, CancellationToken cancellationToken = default);
        Task<OrderTrendsReportDto> GetTrendsAsync(OrderReportFilterRequest request, CancellationToken cancellationToken = default);
        Task<PaymentMethodsReportDto> GetPaymentsAsync(OrderReportFilterRequest request, CancellationToken cancellationToken = default);
        Task<CustomerSegmentsReportDto> GetCustomersAsync(OrderReportFilterRequest request, CancellationToken cancellationToken = default);
        Task<CashflowReportDto> GetCashflowAsync(OrderReportFilterRequest request, CancellationToken cancellationToken = default);
        Task<ProductPerformanceReportDto> GetProductsAsync(OrderReportFilterRequest request, CancellationToken cancellationToken = default);
    }
}

