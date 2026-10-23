using Domain.Common;

namespace Domain.Entities.Catalog
{
    public class ProductOption : BaseEntity<int>
    {
        public int ProductId { get; set; }
        public string Name { get; set; } = default!;
        public int DisplayOrder { get; set; } = 0;

        public Product Product { get; set; } = default!;
        public ICollection<ProductOptionValue> Values { get; set; } = new List<ProductOptionValue>();
    }
}
