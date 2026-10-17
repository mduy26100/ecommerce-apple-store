using Application.Common.Interfaces.Persistence;

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
    }
}
