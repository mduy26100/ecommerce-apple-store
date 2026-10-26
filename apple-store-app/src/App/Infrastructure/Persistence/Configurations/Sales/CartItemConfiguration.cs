using Domain.Constants;
using Domain.Entities.Sales;

namespace Infrastructure.Persistence.Configurations.Sales
{
    internal class CartItemConfiguration : IEntityTypeConfiguration<CartItem>
    {
        public void Configure(EntityTypeBuilder<CartItem> builder)
        {
            builder.ToTable("CartItems", SchemaNames.Sales, table =>
            {
                table.HasCheckConstraint("CK_CartItems_Quantity", "[Quantity] > 0");
            });

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Quantity)
                .IsRequired();

            builder.Property(x => x.UnitPrice)
                .HasPrecision(18, 2)
                .IsRequired();

            builder.Property(x => x.IsSelected)
                .HasDefaultValue(true)
                .IsRequired();

            builder.HasOne(x => x.Cart)
                .WithMany(c => c.Items)
                .HasForeignKey(x => x.CartId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.ProductVariant)
                .WithMany()
                .HasForeignKey(x => x.ProductVariantId)
                .OnDelete(DeleteBehavior.Cascade);

            // Unique cart item per variant with Soft Delete filter
            builder.HasIndex(x => new { x.CartId, x.ProductVariantId })
                .IsUnique()
                .HasFilter("[IsDeleted] = 0");
        }
    }
}
