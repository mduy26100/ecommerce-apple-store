using Domain.Common;

namespace Domain.Entities.Catalog
{
    public class ProductImage : BaseEntity<int>
    {
        public int ProductId { get; set; }
        public int? OptionValueId { get; set; }
        public string ImageUrl { get; set; } = default!;
        public string? AltText { get; set; }
        public int DisplayOrder { get; set; } = 0;
        public bool IsPrimary { get; set; } = false;

        public Product Product { get; set; } = default!;
        public ProductOptionValue? OptionValue { get; set; }
    }
}
