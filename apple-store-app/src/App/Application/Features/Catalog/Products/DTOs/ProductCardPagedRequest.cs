using Application.Wrappers;

namespace Application.Features.Catalog.Products.DTOs
{
    public class ProductCardPagedRequest : PagedRequest
    {
        public ProductCardPagedRequest()
        {
            PageSize = 20;
        }

        public int? CategoryId { get; set; }
        public string? CategorySlug { get; set; }
        public int? Limit { get; set; }
        public string? SortBy { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
    }
}
