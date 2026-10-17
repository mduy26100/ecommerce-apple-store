using Domain.Constants;
using Domain.Entities.Sales;
using Infrastructure.Identity.Models;

namespace Infrastructure.Persistence.Configurations.Sales
{
    internal class OrderConfiguration : IEntityTypeConfiguration<Order>
    {
        public void Configure(EntityTypeBuilder<Order> builder)
        {
            builder.ToTable("Orders", SchemaNames.Sales);

            builder.HasKey(x => x.Id);

            builder.Property(x => x.OrderNumber)
                .IsRequired()
                .HasMaxLength(40)
                .IsUnicode(false);

            builder.HasIndex(x => x.OrderNumber)
                .IsUnique();

            builder.Property(x => x.UserId)
                .IsRequired();

            builder.HasOne<ApplicationUser>()
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Property(x => x.Status)
                .IsRequired()
                .HasMaxLength(30)
                .IsUnicode(false);

            builder.Property(x => x.PaymentMethod)
                .IsRequired()
                .HasMaxLength(30)
                .IsUnicode(false);

            builder.Property(x => x.PaymentStatus)
                .IsRequired()
                .HasMaxLength(30)
                .IsUnicode(false);

            builder.Property(x => x.RecipientName)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(x => x.RecipientPhone)
                .IsRequired()
                .HasMaxLength(20)
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

            builder.Property(x => x.TotalAmount)
                .HasPrecision(18, 2)
                .IsRequired();

            builder.Property(x => x.PlacedAt)
                .IsRequired();

            builder.HasIndex(x => x.UserId);
        }
    }
}
