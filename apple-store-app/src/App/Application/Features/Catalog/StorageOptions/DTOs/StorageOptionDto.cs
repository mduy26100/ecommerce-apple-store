namespace Application.Features.Catalog.StorageOptions.DTOs
{
    public class StorageOptionDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
        public long? CapacityValue { get; set; }
        public string? Unit { get; set; }
        public bool IsActive { get; set; }
        public DateTimeOffset CreatedOn { get; set; }
        public DateTimeOffset? LastModifiedOn { get; set; }
    }
}
