using Domain.Constants;
using Domain.Entities.Catalog;

namespace Infrastructure.Persistence.Configurations.Catalog
{
    internal class ColorConfiguration : IEntityTypeConfiguration<Color>
    {
        public void Configure(EntityTypeBuilder<Color> builder)
        {
            builder.ToTable("Colors", SchemaNames.Catalog);

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(x => x.Code)
                .IsRequired()
                .HasMaxLength(50)
                .IsUnicode(false);

            builder.HasIndex(x => x.Code)
                .IsUnique();

            builder.Property(x => x.HexCode)
                .HasMaxLength(7)
                .IsUnicode(false);
        }
    }
}
