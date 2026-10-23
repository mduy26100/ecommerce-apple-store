using Domain.Common;

namespace Domain.Entities.Catalog
{
    public class Product : BaseEntity<int>
    {
        public int CategoryId { get; set; }
        public string Name { get; set; } = default!;
        public string Slug { get; set; } = default!;
        public string? ModelCode { get; set; }
        public string? ShortDescription { get; set; }
        public string? Description { get; set; }
        public short? WarrantyMonths { get; set; }

        public Category Category { get; set; } = default!;
        public ICollection<ProductOption> Options { get; set; } = new List<ProductOption>();
        public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
        public ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
        public ICollection<ProductSpecificationGroup> SpecificationGroups { get; set; } = new List<ProductSpecificationGroup>();
    }
}
