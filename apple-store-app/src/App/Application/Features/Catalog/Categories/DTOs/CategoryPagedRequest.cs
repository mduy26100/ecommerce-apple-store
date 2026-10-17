using Application.Wrappers;

namespace Application.Features.Catalog.Categories.DTOs
{
    public class CategoryPagedRequest : PagedRequest
    {
        public bool? IsActive { get; set; }
    }
}
