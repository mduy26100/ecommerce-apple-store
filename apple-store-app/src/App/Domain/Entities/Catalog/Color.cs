using Domain.Common;

namespace Domain.Entities.Catalog
{
    public class Color : BaseEntity<int>
    {
        public string Name { get; set; } = default!;
        public string Code { get; set; } = default!;
        public string? HexCode { get; set; }

        public ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
    }
}
