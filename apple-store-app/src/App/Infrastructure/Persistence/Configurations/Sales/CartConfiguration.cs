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
                .IsRequired();

            builder.Property(x => x.Status)
                .IsRequired()
                .HasMaxLength(20)
                .IsUnicode(false);

            builder.HasOne<ApplicationUser>()
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Exactly one Active cart per user
            builder.HasIndex(x => new { x.UserId, x.Status })
                .IsUnique()
                .HasFilter("[Status] = 'Active'");
        }
    }
}
