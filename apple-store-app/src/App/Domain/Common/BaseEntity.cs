namespace Domain.Common
{
    public abstract class BaseEntity<TKey>
    {
        public virtual TKey Id { get; set; } = default!;

        // Status Field
        public bool IsActive { get; set; } = true;

        // Auditable Fields
        public DateTimeOffset CreatedOn { get; set; }
        public string? CreatedBy { get; set; }
        public DateTimeOffset? LastModifiedOn { get; set; }
        public string? LastModifiedBy { get; set; }

        // Soft Delete Fields
        public bool IsDeleted { get; set; } = false;
        public DateTimeOffset? DeletedOn { get; set; }
        public string? DeletedBy { get; set; }
    }
}
