namespace Application.Common.Interfaces.Reports
{
    public interface IExcelExportService
    {
        byte[] ExportOrderReportToExcel(Application.Features.Sales.Reports.DTOs.OrderReportExportData data);
    }
}

