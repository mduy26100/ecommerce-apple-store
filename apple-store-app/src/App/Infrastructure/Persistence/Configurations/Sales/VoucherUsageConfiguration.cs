using Domain.Constants;
using Domain.Entities.Sales;
using Infrastructure.Identity.Models;

namespace Infrastructure.Persistence.Configurations.Sales
{
    internal class VoucherUsageConfiguration : IEntityTypeConfiguration<VoucherUsage>
    {
        public void Configure(EntityTypeBuilder<VoucherUsage> builder)
        {
            builder.ToTable("VoucherUsages", SchemaNames.Sales, t =>
            {
                t.HasCheckConstraint("CK_VoucherUsages_DiscountAmount", "[DiscountAmount] >= 0");
            });

            builder.HasKey(x => x.Id);

            builder.Property(x => x.GuestId)
                .HasMaxLength(100)
                .IsUnicode(false);

            builder.Property(x => x.CustomerPhone)
                .HasMaxLength(20)
                .IsUnicode(false);

            builder.Property(x => x.CustomerEmail)
                .HasMaxLength(150)
                .IsUnicode(false);

            builder.Property(x => x.DiscountAmount)
                .HasPrecision(18, 2)
                .IsRequired();

            builder.Property(x => x.UsedAt)
                .IsRequired();

            builder.HasOne(x => x.Voucher)
                .WithMany(v => v.Usages)
                .HasForeignKey(x => x.VoucherId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Order)
                .WithMany()
                .HasForeignKey(x => x.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne<ApplicationUser>()
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            builder.HasIndex(x => x.VoucherId);
            builder.HasIndex(x => x.OrderId);
            builder.HasIndex(x => x.UserId);
            builder.HasIndex(x => x.GuestId);
        }
    }
}
