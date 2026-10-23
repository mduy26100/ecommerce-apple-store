using Domain.Entities.Catalog;

namespace Application.Features.Catalog.ProductOptions.Specifications
{
    public sealed class ProductOptionValueByNameSpec : Specification<ProductOptionValue>
    {
        public ProductOptionValueByNameSpec(int optionId, string value, int? excludeId = null)
        {
            Query.Where(v => v.OptionId == optionId && v.Value.ToLower() == value.ToLower());
            if (excludeId.HasValue && excludeId.Value > 0)
            {
                Query.Where(v => v.Id != excludeId.Value);
            }
        }
    }
}
