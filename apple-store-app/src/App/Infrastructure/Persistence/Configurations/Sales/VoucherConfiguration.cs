using Domain.Constants;
using Domain.Entities.Sales;

namespace Infrastructure.Persistence.Configurations.Sales
{
    internal class VoucherConfiguration : IEntityTypeConfiguration<Voucher>
    {
        public void Configure(EntityTypeBuilder<Voucher> builder)
        {
            builder.ToTable("Vouchers", SchemaNames.Sales, t =>
            {
                t.HasCheckConstraint("CK_Vouchers_DiscountValue", "[DiscountValue] > 0");
                t.HasCheckConstraint("CK_Vouchers_UsageCount", "[UsageCount] >= 0");
                t.HasCheckConstraint("CK_Vouchers_PerUserLimit", "[PerUserLimit] > 0");
            });

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Code)
                .IsRequired()
                .HasMaxLength(50)
                .IsUnicode(false);

            builder.HasIndex(x => x.Code)
                .IsUnique();

            builder.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(x => x.Description)
                .HasMaxLength(500);

            builder.Property(x => x.TargetType)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(30)
                .IsUnicode(false);

            builder.Property(x => x.DiscountType)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(30)
                .IsUnicode(false);

            builder.Property(x => x.DiscountValue)
                .HasPrecision(18, 2)
                .IsRequired();

            builder.Property(x => x.MinOrderAmount)
                .HasPrecision(18, 2);

            builder.Property(x => x.MaxDiscountAmount)
                .HasPrecision(18, 2);

            builder.Property(x => x.StartDate)
                .IsRequired();

            builder.Property(x => x.EndDate)
                .IsRequired();

            builder.Property(x => x.UsageLimit);

            builder.Property(x => x.UsageCount)
                .IsRequired()
                .HasDefaultValue(0);

            builder.Property(x => x.PerUserLimit)
                .IsRequired()
                .HasDefaultValue(1);

            builder.Property(x => x.RowVersion)
                .IsRowVersion();

            builder.HasIndex(x => x.TargetType);
            builder.HasIndex(x => x.StartDate);
            builder.HasIndex(x => x.EndDate);
        }
    }
}
