using Domain.Common;

namespace Domain.Entities.Catalog
{
    public class ProductSpecificationGroup : BaseEntity<int>
    {
        public int ProductId { get; set; }
        public string Name { get; set; } = default!;
        public int DisplayOrder { get; set; } = 0;

        public Product Product { get; set; } = default!;
        public ICollection<ProductSpecification> Specifications { get; set; } = new List<ProductSpecification>();
    }
}
