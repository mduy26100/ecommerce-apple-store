using Domain.Constants;
using Domain.Entities.Catalog;

namespace Infrastructure.Persistence.Configurations.Catalog
{
    internal class ProductSpecificationConfiguration : IEntityTypeConfiguration<ProductSpecification>
    {
        public void Configure(EntityTypeBuilder<ProductSpecification> builder)
        {
            builder.ToTable("ProductSpecifications", SchemaNames.Catalog);

            builder.HasKey(x => x.Id);

            builder.Property(x => x.GroupName)
                .HasMaxLength(100);

            builder.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(x => x.Value)
                .IsRequired()
                .HasMaxLength(1000);

            builder.Property(x => x.Unit)
                .HasMaxLength(30);

            builder.Property(x => x.DisplayOrder)
                .HasDefaultValue(0);

            builder.HasOne(x => x.Product)
                .WithMany(p => p.Specifications)
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.ProductVariant)
                .WithMany(v => v.Specifications)
                .HasForeignKey(x => x.ProductVariantId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => x.ProductId);
            builder.HasIndex(x => x.ProductVariantId);
        }
    }
}
