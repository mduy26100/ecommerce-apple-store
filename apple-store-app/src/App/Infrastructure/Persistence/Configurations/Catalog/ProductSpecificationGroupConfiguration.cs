using Domain.Constants;
using Domain.Entities.Catalog;

namespace Infrastructure.Persistence.Configurations.Catalog
{
    internal class ProductSpecificationGroupConfiguration : IEntityTypeConfiguration<ProductSpecificationGroup>
    {
        public void Configure(EntityTypeBuilder<ProductSpecificationGroup> builder)
        {
            builder.ToTable("ProductSpecificationGroups", SchemaNames.Catalog);

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(x => x.DisplayOrder)
                .HasDefaultValue(0);

            builder.HasOne(x => x.Product)
                .WithMany(p => p.SpecificationGroups)
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(x => x.ProductId);
        }
    }
}
