using Domain.Common;

namespace Infrastructure.Identity.Models
{
    public class RefreshToken : BaseEntity<int>
    {
        public int UserId { get; set; }

        public string Token { get; set; } = default!;
        public DateTime ExpiresAt { get; set; }
        public bool IsRevoked { get; set; } = false;

        [NotMapped]
        public new bool IsActive => !IsRevoked && ExpiresAt > DateTime.UtcNow;

        public string? CreatedByIp { get; set; }
        public string? RevokedByIp { get; set; }
        public DateTime? RevokedAt { get; set; }
    }
}
