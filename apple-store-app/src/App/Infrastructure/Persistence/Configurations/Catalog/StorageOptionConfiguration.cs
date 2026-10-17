using Domain.Constants;
using Domain.Entities.Catalog;

namespace Infrastructure.Persistence.Configurations.Catalog
{
    internal class StorageOptionConfiguration : IEntityTypeConfiguration<StorageOption>
    {
        public void Configure(EntityTypeBuilder<StorageOption> builder)
        {
            builder.ToTable("StorageOptions", SchemaNames.Catalog);

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(x => x.CapacityValue);

            builder.Property(x => x.Unit)
                .HasMaxLength(10)
                .IsUnicode(false);
        }
    }
}
