using Domain.Entities.Catalog;

namespace Application.Features.Catalog.ProductOptions.Specifications
{
    public sealed class ProductOptionValuesByOptionIdSpec : Specification<ProductOptionValue>
    {
        public ProductOptionValuesByOptionIdSpec(int optionId)
        {
            Query.Where(v => v.OptionId == optionId)
                 .OrderBy(v => v.DisplayOrder);
        }
    }
}
