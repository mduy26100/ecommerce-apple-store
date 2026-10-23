using Domain.Constants;
using Domain.Entities.Catalog;

namespace Infrastructure.Persistence.Configurations.Catalog
{
    internal class ProductVariantValueConfiguration : IEntityTypeConfiguration<ProductVariantValue>
    {
        public void Configure(EntityTypeBuilder<ProductVariantValue> builder)
        {
            builder.ToTable("ProductVariantValues", SchemaNames.Catalog);

            builder.HasKey(x => new { x.VariantId, x.OptionValueId });

            builder.HasOne(x => x.Variant)
                .WithMany(v => v.VariantValues)
                .HasForeignKey(x => x.VariantId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.OptionValue)
                .WithMany(ov => ov.VariantValues)
                .HasForeignKey(x => x.OptionValueId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => x.VariantId);
            builder.HasIndex(x => x.OptionValueId);
        }
    }
}
