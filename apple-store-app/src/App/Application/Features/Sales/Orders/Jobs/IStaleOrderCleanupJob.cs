namespace Application.Features.Sales.Orders.Jobs
{
    public interface IStaleOrderCleanupJob
    {
        Task<int> ProcessStaleOrdersAsync(CancellationToken cancellationToken = default);
    }
}

