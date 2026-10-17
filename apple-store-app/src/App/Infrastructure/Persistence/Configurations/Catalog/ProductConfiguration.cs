using Domain.Constants;
using Domain.Entities.Catalog;

namespace Infrastructure.Persistence.Configurations.Catalog
{
    internal class ProductConfiguration : IEntityTypeConfiguration<Product>
    {
        public void Configure(EntityTypeBuilder<Product> builder)
        {
            builder.ToTable("Products", SchemaNames.Catalog);

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(250);

            builder.Property(x => x.Slug)
                .IsRequired()
                .HasMaxLength(280)
                .IsUnicode(false);

            builder.HasIndex(x => x.Slug)
                .IsUnique();

            builder.Property(x => x.ModelCode)
                .HasMaxLength(100)
                .IsUnicode(false);

            builder.Property(x => x.ShortDescription)
                .HasMaxLength(500);

            builder.Property(x => x.Description);

            builder.Property(x => x.WarrantyMonths);

            builder.HasOne(x => x.Category)
                .WithMany(c => c.Products)
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => x.CategoryId);
        }
    }
}
