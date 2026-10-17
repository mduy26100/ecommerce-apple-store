using Domain.Constants;
using Infrastructure.Identity.Models;

namespace Infrastructure.Persistence.Configurations.Identity
{
    internal class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
    {
        public void Configure(EntityTypeBuilder<RefreshToken> builder)
        {
            builder.ToTable("RefreshTokens", SchemaNames.Identity);

            builder.HasKey(x => x.Id);

            builder.Ignore(x => x.IsActive);

            builder.Property(x => x.Token)
                .IsRequired()
                .HasMaxLength(256);

            builder.Property(x => x.CreatedByIp)
                .HasMaxLength(100);

            builder.Property(x => x.RevokedByIp)
                .HasMaxLength(100);

            builder.Property(x => x.ExpiresAt)
                .IsRequired();

            builder.Property(x => x.IsRevoked)
                .IsRequired();

            // Unique index for token lookups
            builder.HasIndex(x => x.Token)
                .IsUnique();

            // Index for user token queries
            builder.HasIndex(x => x.UserId);
        }
    }
}
