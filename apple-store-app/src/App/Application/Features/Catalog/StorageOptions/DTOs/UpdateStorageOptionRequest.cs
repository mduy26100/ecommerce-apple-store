namespace Application.Features.Catalog.StorageOptions.DTOs
{
    public class UpdateStorageOptionRequest
    {
        public string Name { get; set; } = default!;
        public long? CapacityValue { get; set; }
        public string? Unit { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
