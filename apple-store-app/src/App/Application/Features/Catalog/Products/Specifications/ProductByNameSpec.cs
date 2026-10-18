using Domain.Entities.Catalog;

namespace Application.Features.Catalog.Products.Specifications
{
    public sealed class ProductByNameSpec : Specification<Product>
    {
        public ProductByNameSpec(string name, int? excludeId = null)
        {
            var normalizedName = name.Trim().ToLower();
            Query.Where(p => p.Name.ToLower() == normalizedName);

            if (excludeId.HasValue)
            {
                Query.Where(p => p.Id != excludeId.Value);
            }
        }
    }
}
