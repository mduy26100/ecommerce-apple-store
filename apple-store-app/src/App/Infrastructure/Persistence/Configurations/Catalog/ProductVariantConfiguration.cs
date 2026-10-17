using Domain.Constants;
using Domain.Entities.Catalog;

namespace Infrastructure.Persistence.Configurations.Catalog
{
    internal class ProductVariantConfiguration : IEntityTypeConfiguration<ProductVariant>
    {
        public void Configure(EntityTypeBuilder<ProductVariant> builder)
        {
            builder.ToTable("ProductVariants", SchemaNames.Catalog);

            builder.HasKey(x => x.Id);

            builder.Property(x => x.SKU)
                .IsRequired()
                .HasMaxLength(100)
                .IsUnicode(false);

            builder.HasIndex(x => x.SKU)
                .IsUnique();

            builder.Property(x => x.VariantName)
                .HasMaxLength(200);

            builder.Property(x => x.Price)
                .HasPrecision(18, 2)
                .IsRequired();

            builder.Property(x => x.CompareAtPrice)
                .HasPrecision(18, 2);

            builder.Property(x => x.QuantityInStock)
                .IsRequired()
                .HasDefaultValue(0);

            builder.Property(x => x.RowVersion)
                .IsRowVersion();

            builder.HasOne(x => x.Product)
                .WithMany(p => p.Variants)
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Color)
                .WithMany(c => c.Variants)
                .HasForeignKey(x => x.ColorId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(x => x.StorageOption)
                .WithMany(s => s.Variants)
                .HasForeignKey(x => x.StorageOptionId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasIndex(x => x.ProductId);
            builder.HasIndex(x => x.ColorId);
            builder.HasIndex(x => x.StorageOptionId);
        }
    }
}
