using Domain.Constants;
using Domain.Entities.Sales;
using Infrastructure.Identity.Models;

namespace Infrastructure.Persistence.Configurations.Sales
{
    internal class UserVoucherConfiguration : IEntityTypeConfiguration<UserVoucher>
    {
        public void Configure(EntityTypeBuilder<UserVoucher> builder)
        {
            builder.ToTable("UserVouchers", SchemaNames.Sales, t =>
            {
                t.HasCheckConstraint("CK_UserVouchers_AssignedUsageLimit", "[AssignedUsageLimit] > 0");
                t.HasCheckConstraint("CK_UserVouchers_UsedCount", "[UsedCount] >= 0");
            });

            builder.HasKey(x => x.Id);

            builder.Property(x => x.AssignedUsageLimit)
                .IsRequired()
                .HasDefaultValue(1);

            builder.Property(x => x.UsedCount)
                .IsRequired()
                .HasDefaultValue(0);

            builder.Property(x => x.AssignedAt)
                .IsRequired();

            builder.Property(x => x.ExpiresAt);

            builder.Property(x => x.AssignedBy)
                .HasMaxLength(150);

            builder.Property(x => x.Note)
                .HasMaxLength(250);

            builder.HasOne<ApplicationUser>()
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Voucher)
                .WithMany(v => v.UserVouchers)
                .HasForeignKey(x => x.VoucherId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(x => new { x.UserId, x.VoucherId })
                .IsUnique()
                .HasFilter("[IsDeleted] = 0");

            builder.HasIndex(x => x.UserId);
            builder.HasIndex(x => x.VoucherId);
            builder.HasIndex(x => x.ExpiresAt);
        }
    }
}
