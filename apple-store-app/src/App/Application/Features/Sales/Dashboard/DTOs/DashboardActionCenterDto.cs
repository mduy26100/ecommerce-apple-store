namespace Application.Features.Sales.Dashboard.DTOs
{
    public class DashboardActionCenterDto
    {
        public int PendingConfirmationCount { get; set; }
        public int ProcessingShippingCount { get; set; }
        public int ComplaintsReturnsCount { get; set; }
        public int PaymentAlertsCount { get; set; }
        public int DelayedSlaCount { get; set; }
    }
}

