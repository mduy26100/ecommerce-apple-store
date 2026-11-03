using Application.Wrappers;

namespace Application.Features.Sales.Reports.DTOs
{
    public class OrderReportFilterRequest : PagedRequest
    {
        public DateTimeOffset? FromDate { get; set; }
        public DateTimeOffset? ToDate { get; set; }
        public string? DateCriteria { get; set; } = "placed";
        public string? Status { get; set; }
        public string? PaymentStatus { get; set; }
        public string? PaymentMethod { get; set; }
    }
}

