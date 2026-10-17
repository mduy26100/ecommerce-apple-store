using Domain.Constants;
using Domain.Entities.Sales;

namespace Infrastructure.Persistence.Configurations.Sales
{
    internal class CartItemConfiguration : IEntityTypeConfiguration<CartItem>
    {
        public void Configure(EntityTypeBuilder<CartItem> builder)
        {
            builder.ToTable("CartItems", SchemaNames.Sales);

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Quantity)
                .IsRequired();

            builder.HasOne(x => x.Cart)
                .WithMany(c => c.Items)
                .HasForeignKey(x => x.CartId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.ProductVariant)
                .WithMany()
                .HasForeignKey(x => x.ProductVariantId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(x => new { x.CartId, x.ProductVariantId })
                .IsUnique();
        }
    }
}
