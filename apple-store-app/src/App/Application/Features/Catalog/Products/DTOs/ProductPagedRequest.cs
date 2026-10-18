using Application.Wrappers;

namespace Application.Features.Catalog.Products.DTOs
{
    public class ProductPagedRequest : PagedRequest
    {
        public int? CategoryId { get; set; }
        public bool? IsActive { get; set; }
    }
}
