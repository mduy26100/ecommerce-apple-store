using Application.Common.Interfaces.Persistence;
using Domain.Constants;
using Domain.Entities.Catalog;
using Domain.Entities.Sales;
using Infrastructure.Identity.Models;

namespace Infrastructure.Persistence
{
    public class AppDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, int>, IAppDbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // Identity & Security
        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

        // Catalog Module
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Product> Products => Set<Product>();
        public DbSet<Color> Colors => Set<Color>();
        public DbSet<StorageOption> StorageOptions => Set<StorageOption>();
        public DbSet<ProductOption> ProductOptions => Set<ProductOption>();
        public DbSet<ProductOptionValue> ProductOptionValues => Set<ProductOptionValue>();
        public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();
        public DbSet<ProductVariantValue> ProductVariantValues => Set<ProductVariantValue>();
        public DbSet<ProductImage> ProductImages => Set<ProductImage>();
        public DbSet<ProductSpecificationGroup> ProductSpecificationGroups => Set<ProductSpecificationGroup>();
        public DbSet<ProductSpecification> ProductSpecifications => Set<ProductSpecification>();

        // Sales Module
        public DbSet<Cart> Carts => Set<Cart>();
        public DbSet<CartItem> CartItems => Set<CartItem>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();
        public DbSet<Voucher> Vouchers => Set<Voucher>();
        public DbSet<VoucherUsage> VoucherUsages => Set<VoucherUsage>();
        public DbSet<UserVoucher> UserVouchers => Set<UserVoucher>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // 1. Identity Tables Mapping with Custom Schema
            ConfigureIdentityTables(builder);

            // 2. Apply all IEntityTypeConfiguration configurations in this assembly
            builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

            // 3. Apply Global Query Filters (Soft Delete for entities with IsDeleted)
            ApplyGlobalFilters(builder);
        }

        public override int SaveChanges()
        {
            ApplyAuditing();
            return base.SaveChanges();
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            ApplyAuditing();
            return base.SaveChangesAsync(cancellationToken);
        }

        public async Task<IDatabaseTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default)
        {
            var transaction = await Database.BeginTransactionAsync(cancellationToken);
            return new DatabaseTransaction(transaction);
        }

        private static void ConfigureIdentityTables(ModelBuilder builder)
        {
            builder.Entity<ApplicationUser>(entity =>
            {
                entity.ToTable("Users", SchemaNames.Identity);
                entity.Property(u => u.FirstName).HasMaxLength(100);
                entity.Property(u => u.LastName).HasMaxLength(100);
                entity.Property(u => u.AvatarUrl).HasMaxLength(500);
            });

            builder.Entity<ApplicationRole>(entity =>
            {
                entity.ToTable("Roles", SchemaNames.Identity);
                entity.Property(r => r.Description).HasMaxLength(500);
            });

            builder.Entity<IdentityUserClaim<int>>().ToTable("UserClaims", SchemaNames.Identity);
            builder.Entity<IdentityUserRole<int>>().ToTable("UserRoles", SchemaNames.Identity);
            builder.Entity<IdentityUserLogin<int>>().ToTable("UserLogins", SchemaNames.Identity);
            builder.Entity<IdentityRoleClaim<int>>().ToTable("RoleClaims", SchemaNames.Identity);
            builder.Entity<IdentityUserToken<int>>().ToTable("UserTokens", SchemaNames.Identity);
        }

        private static void ApplyGlobalFilters(ModelBuilder builder)
        {
            foreach (var entityType in builder.Model.GetEntityTypes().ToList())
            {
                if (entityType.BaseType != null)
                {
                    continue;
                }

                var isDeletedProperty = entityType.FindProperty("IsDeleted");
                if (isDeletedProperty != null && isDeletedProperty.ClrType == typeof(bool))
                {
                    var parameter = Expression.Parameter(entityType.ClrType, "e");
                    var propertyAccess = Expression.PropertyOrField(parameter, "IsDeleted");
                    var notDeleted = Expression.Not(propertyAccess);
                    var lambda = Expression.Lambda(notDeleted, parameter);

                    builder.Entity(entityType.ClrType).HasQueryFilter(lambda);
                }
            }
        }

        private void ApplyAuditing()
        {
            var utcNow = DateTimeOffset.UtcNow;

            foreach (var entry in ChangeTracker.Entries())
            {
                if (entry.State == EntityState.Added)
                {
                    if (entry.Metadata.FindProperty("CreatedOn") != null)
                    {
                        var createdOn = entry.Property("CreatedOn").CurrentValue;
                        if (createdOn == null || (createdOn is DateTimeOffset dto && dto == default))
                        {
                            entry.Property("CreatedOn").CurrentValue = utcNow;
                        }
                    }
                }
                else if (entry.State == EntityState.Modified)
                {
                    if (entry.Metadata.FindProperty("LastModifiedOn") != null)
                    {
                        entry.Property("LastModifiedOn").CurrentValue = utcNow;
                    }
                }
                else if (entry.State == EntityState.Deleted)
                {
                    var isDeletedProp = entry.Metadata.FindProperty("IsDeleted");
                    if (isDeletedProp != null && isDeletedProp.ClrType == typeof(bool))
                    {
                        entry.State = EntityState.Modified;
                        entry.Property("IsDeleted").CurrentValue = true;

                        if (entry.Metadata.FindProperty("DeletedOn") != null)
                        {
                            entry.Property("DeletedOn").CurrentValue = utcNow;
                        }
                    }
                }
            }
        }
    }
}
