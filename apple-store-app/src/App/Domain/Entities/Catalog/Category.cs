using Domain.Common;

namespace Domain.Entities.Catalog
{
    public class Category : BaseEntity<int>
    {
        public string Name { get; set; } = default!;
        public string Slug { get; set; } = default!;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public int DisplayOrder { get; set; } = 0;

        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
