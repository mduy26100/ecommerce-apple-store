using Domain.Constants;
using Domain.Entities.Catalog;

namespace Infrastructure.Persistence.Configurations.Catalog
{
    internal class ProductOptionValueConfiguration : IEntityTypeConfiguration<ProductOptionValue>
    {
        public void Configure(EntityTypeBuilder<ProductOptionValue> builder)
        {
            builder.ToTable("ProductOptionValues", SchemaNames.Catalog);

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Value)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(x => x.ColorHexCode)
                .HasMaxLength(50);

            builder.Property(x => x.DisplayOrder)
                .HasDefaultValue(0);

            builder.HasOne(x => x.Option)
                .WithMany(o => o.Values)
                .HasForeignKey(x => x.OptionId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(x => x.OptionId);
        }
    }
}
