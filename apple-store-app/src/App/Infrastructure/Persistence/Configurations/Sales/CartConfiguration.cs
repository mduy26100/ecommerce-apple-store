using Domain.Constants;
using Domain.Entities.Sales;
using Infrastructure.Identity.Models;

namespace Infrastructure.Persistence.Configurations.Sales
{
    internal class CartConfiguration : IEntityTypeConfiguration<Cart>
    {
        public void Configure(EntityTypeBuilder<Cart> builder)
        {
            builder.ToTable("Carts", SchemaNames.Sales);

            builder.HasKey(x => x.Id);

            builder.Property(x => x.UserId)
                .IsRequired(false);

            builder.Property(x => x.GuestId)
                .HasMaxLength(100)
                .IsUnicode(false)
                .IsRequired(false);

            builder.Property(x => x.ExpiresOn)
                .IsRequired(false);

            builder.HasOne<ApplicationUser>()
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(false);

            // Exactly one Active cart per registered user
            builder.HasIndex(x => x.UserId)
                .IsUnique()
                .HasFilter("[UserId] IS NOT NULL AND [IsDeleted] = 0");

            // Exactly one Active cart per guest identifier
            builder.HasIndex(x => x.GuestId)
                .IsUnique()
                .HasFilter("[GuestId] IS NOT NULL AND [IsDeleted] = 0");
        }
    }
}
