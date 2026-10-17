using Application.Wrappers;

namespace Application.Common.Interfaces.Persistence
{
    public interface IRepository<T> : IRepositoryBase<T> where T : class
    {
        Task<PagedList<T>> GetPagedAsync(
            ISpecification<T> spec,
            int pageNumber,
            int pageSize,
            CancellationToken cancellationToken = default);

        Task<PagedList<TDestination>> GetPagedAsync<TDestination>(
            ISpecification<T> spec,
            int pageNumber,
            int pageSize,
            Func<T, TDestination> mapper,
            CancellationToken cancellationToken = default);
    }
}
