using Application.Wrappers;

namespace Application.Features.Catalog.Colors.DTOs
{
    public class ColorPagedRequest : PagedRequest
    {
        public bool? IsActive { get; set; }
    }
}
