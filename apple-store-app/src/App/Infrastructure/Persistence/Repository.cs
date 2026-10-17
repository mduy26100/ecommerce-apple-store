using Application.Common.Interfaces.Persistence;
using Application.Wrappers;

namespace Infrastructure.Persistence
{
    public class Repository<T> : RepositoryBase<T>, IRepository<T> where T : class
    {
        protected readonly AppDbContext _context;
        protected readonly DbSet<T> _dbSet;

        public Repository(AppDbContext context) : base(context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }

        public async Task<PagedList<T>> GetPagedAsync(
            ISpecification<T> spec,
            int pageNumber,
            int pageSize,
            CancellationToken cancellationToken = default)
        {
            int totalCount = await CountAsync(spec, cancellationToken);

            var query = ApplySpecification(spec);
            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return new PagedList<T>(items, totalCount, pageNumber, pageSize);
        }

        public async Task<PagedList<TDestination>> GetPagedAsync<TDestination>(
            ISpecification<T> spec,
            int pageNumber,
            int pageSize,
            Func<T, TDestination> mapper,
            CancellationToken cancellationToken = default)
        {
            int totalCount = await CountAsync(spec, cancellationToken);

            var query = ApplySpecification(spec);
            var entities = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var items = entities.Select(mapper).ToList();

            return new PagedList<TDestination>(items, totalCount, pageNumber, pageSize);
        }
    }
}
