using Domain.Constants;
using Domain.Entities.Sales;

namespace Infrastructure.Persistence.Configurations.Sales
{
    internal class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
    {
        public void Configure(EntityTypeBuilder<OrderItem> builder)
        {
            builder.ToTable("OrderItems", SchemaNames.Sales, t =>
            {
                t.HasCheckConstraint("CK_OrderItems_Quantity", "[Quantity] > 0");
                t.HasCheckConstraint("CK_OrderItems_UnitPrice", "[UnitPrice] >= 0");
                t.HasCheckConstraint("CK_OrderItems_CostPrice", "[CostPrice] >= 0");
                t.HasCheckConstraint("CK_OrderItems_LineTotal", "[LineTotal] >= 0");
            });

            builder.HasKey(x => x.Id);

            builder.Property(x => x.ProductName)
                .IsRequired()
                .HasMaxLength(250);

            builder.Property(x => x.SKU)
                .IsRequired()
                .HasMaxLength(100)
                .IsUnicode(false);

            builder.Property(x => x.VariantName)
                .HasMaxLength(250);

            builder.Property(x => x.ThumbnailUrl)
                .HasMaxLength(500);

            builder.Property(x => x.SelectedAttributesJson)
                .HasMaxLength(1000);

            builder.Property(x => x.ColorName)
                .HasMaxLength(100);

            builder.Property(x => x.StorageName)
                .HasMaxLength(50);

            builder.Property(x => x.CostPrice)
                .HasPrecision(18, 2)
                .IsRequired()
                .HasDefaultValue(0);

            builder.Property(x => x.UnitPrice)
                .HasPrecision(18, 2)
                .IsRequired();

            builder.Property(x => x.Quantity)
                .IsRequired();

            builder.Property(x => x.LineTotal)
                .HasPrecision(18, 2)
                .IsRequired();

            builder.HasOne(x => x.Order)
                .WithMany(o => o.Items)
                .HasForeignKey(x => x.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.ProductVariant)
                .WithMany()
                .HasForeignKey(x => x.ProductVariantId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasIndex(x => x.OrderId);
            builder.HasIndex(x => x.ProductVariantId);
        }
    }
}
