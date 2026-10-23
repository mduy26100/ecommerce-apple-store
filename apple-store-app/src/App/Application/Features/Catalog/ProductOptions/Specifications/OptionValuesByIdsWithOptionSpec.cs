using Domain.Entities.Catalog;

namespace Application.Features.Catalog.ProductOptions.Specifications
{
    public sealed class OptionValuesByIdsWithOptionSpec : Specification<ProductOptionValue>
    {
        public OptionValuesByIdsWithOptionSpec(IEnumerable<int> ids)
        {
            Query.Where(ov => ids.Contains(ov.Id))
                 .Include(ov => ov.Option);
        }
    }
}
