using Domain.Constants;
using Domain.Entities.Catalog;

namespace Infrastructure.Persistence.Configurations.Catalog
{
    internal class CategoryConfiguration : IEntityTypeConfiguration<Category>
    {
        public void Configure(EntityTypeBuilder<Category> builder)
        {
            builder.ToTable("Categories", SchemaNames.Catalog);

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(x => x.Slug)
                .IsRequired()
                .HasMaxLength(120)
                .IsUnicode(false);

            builder.HasIndex(x => x.Slug)
                .IsUnique();

            builder.Property(x => x.Description)
                .HasMaxLength(500);

            builder.Property(x => x.ImageUrl)
                .HasMaxLength(500);

            builder.Property(x => x.DisplayOrder)
                .HasDefaultValue(0);

            builder.HasMany(x => x.Products)
                .WithOne(x => x.Category)
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
