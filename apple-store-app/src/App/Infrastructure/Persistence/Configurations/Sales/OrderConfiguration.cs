using Domain.Constants;
using Domain.Entities.Sales;
using Infrastructure.Identity.Models;

namespace Infrastructure.Persistence.Configurations.Sales
{
    internal class OrderConfiguration : IEntityTypeConfiguration<Order>
    {
        public void Configure(EntityTypeBuilder<Order> builder)
        {
            builder.ToTable("Orders", SchemaNames.Sales, t =>
            {
                t.HasCheckConstraint("CK_Orders_TotalAmount", "[TotalAmount] >= 0");
                t.HasCheckConstraint("CK_Orders_Subtotal", "[Subtotal] >= 0");
                t.HasCheckConstraint("CK_Orders_ShippingFee", "[ShippingFee] >= 0");
                t.HasCheckConstraint("CK_Orders_DiscountAmount", "[DiscountAmount] >= 0");
            });

            builder.HasKey(x => x.Id);

            builder.Property(x => x.OrderNumber)
                .IsRequired()
                .HasMaxLength(40)
                .IsUnicode(false);

            builder.HasIndex(x => x.OrderNumber)
                .IsUnique();

            builder.Property(x => x.UserId)
                .IsRequired(false);

            builder.HasOne<ApplicationUser>()
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            builder.Property(x => x.GuestId)
                .HasMaxLength(100)
                .IsUnicode(false);

            builder.Property(x => x.Status)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(30)
                .IsUnicode(false);

            builder.Property(x => x.PaymentMethod)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(30)
                .IsUnicode(false);

            builder.Property(x => x.PaymentStatus)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(30)
                .IsUnicode(false);

            builder.Property(x => x.RecipientName)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(x => x.RecipientPhone)
                .IsRequired()
                .HasMaxLength(20)
                .IsUnicode(false);

            builder.Property(x => x.RecipientEmail)
                .HasMaxLength(150)
                .IsUnicode(false);

            builder.Property(x => x.ShippingAddressLine)
                .IsRequired()
                .HasMaxLength(250);

            builder.Property(x => x.ShippingWard)
                .HasMaxLength(100);

            builder.Property(x => x.ShippingDistrict)
                .HasMaxLength(100);

            builder.Property(x => x.ShippingProvince)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(x => x.CustomerNote)
                .HasMaxLength(500);

            builder.Property(x => x.Subtotal)
                .HasPrecision(18, 2)
                .IsRequired();

            builder.Property(x => x.ShippingFee)
                .HasPrecision(18, 2)
                .IsRequired()
                .HasDefaultValue(0);

            builder.Property(x => x.VoucherId)
                .IsRequired(false);

            builder.Property(x => x.VoucherCode)
                .HasMaxLength(50)
                .IsUnicode(false);

            builder.Property(x => x.DiscountAmount)
                .HasPrecision(18, 2)
                .IsRequired()
                .HasDefaultValue(0);

            builder.Property(x => x.TotalAmount)
                .HasPrecision(18, 2)
                .IsRequired();

            builder.Property(x => x.PlacedAt)
                .IsRequired();

            builder.Property(x => x.ShippingAddressUpdateCount)
                .IsRequired()
                .HasDefaultValue(0);

            builder.Property(x => x.StatusHistoryJson)
                .IsRequired(false);

            builder.Property(x => x.RowVersion)
                .IsRowVersion();

            builder.HasOne(x => x.Voucher)
                .WithMany(v => v.Orders)
                .HasForeignKey(x => x.VoucherId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasIndex(x => x.UserId);
            builder.HasIndex(x => x.GuestId);
            builder.HasIndex(x => x.VoucherId);
        }
    }
}
