using Domain.Common;

namespace Domain.Entities.Catalog
{
    public class VariantImage : BaseEntity<int>
    {
        public int ProductVariantId { get; set; }
        public string ImageUrl { get; set; } = default!;
        public string? AltText { get; set; }
        public int DisplayOrder { get; set; } = 0;
        public bool IsPrimary { get; set; } = false;

        public ProductVariant ProductVariant { get; set; } = default!;
    }
}
