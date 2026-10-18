using Application.Wrappers;

namespace Application.Features.Catalog.StorageOptions.DTOs
{
    public class StorageOptionPagedRequest : PagedRequest
    {
        public bool? IsActive { get; set; }
    }
}
