using Domain.Constants;
using Domain.Entities.Catalog;

namespace Infrastructure.Persistence.Configurations.Catalog
{
    internal class VariantImageConfiguration : IEntityTypeConfiguration<VariantImage>
    {
        public void Configure(EntityTypeBuilder<VariantImage> builder)
        {
            builder.ToTable("VariantImages", SchemaNames.Catalog);

            builder.HasKey(x => x.Id);

            builder.Property(x => x.ImageUrl)
                .IsRequired()
                .HasMaxLength(1000);

            builder.Property(x => x.AltText)
                .HasMaxLength(250);

            builder.Property(x => x.DisplayOrder)
                .HasDefaultValue(0);

            builder.Property(x => x.IsPrimary)
                .HasDefaultValue(false);

            builder.HasOne(x => x.ProductVariant)
                .WithMany(v => v.Images)
                .HasForeignKey(x => x.ProductVariantId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(x => x.ProductVariantId);

            // Maximum one primary image per variant
            builder.HasIndex(x => new { x.ProductVariantId, x.IsPrimary })
                .IsUnique()
                .HasFilter("[IsPrimary] = 1 AND [IsDeleted] = 0");
        }
    }
}
