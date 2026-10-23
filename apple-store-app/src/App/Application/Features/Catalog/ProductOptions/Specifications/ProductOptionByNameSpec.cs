using Domain.Entities.Catalog;

namespace Application.Features.Catalog.ProductOptions.Specifications
{
    public sealed class ProductOptionByNameSpec : Specification<ProductOption>
    {
        public ProductOptionByNameSpec(int productId, string name, int? excludeId = null)
        {
            Query.Where(o => o.ProductId == productId && o.Name.ToLower() == name.ToLower());
            if (excludeId.HasValue && excludeId.Value > 0)
            {
                Query.Where(o => o.Id != excludeId.Value);
            }
        }
    }
}
