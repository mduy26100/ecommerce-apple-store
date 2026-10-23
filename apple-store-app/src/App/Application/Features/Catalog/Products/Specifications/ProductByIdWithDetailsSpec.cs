using Domain.Entities.Catalog;

namespace Application.Features.Catalog.Products.Specifications
{
    public sealed class ProductByIdWithDetailsSpec : Specification<Product>
    {
        public ProductByIdWithDetailsSpec(int id)
        {
            Query.Include(p => p.Category)
                 .Include(p => p.SpecificationGroups)
                    .ThenInclude(g => g.Specifications)
                 .Include(p => p.Options)
                    .ThenInclude(o => o.Values)
                 .Include(p => p.Images)
                    .ThenInclude(i => i.OptionValue)
                 .Include(p => p.Variants)
                    .ThenInclude(v => v.VariantValues)
                         .ThenInclude(vv => vv.OptionValue)
                             .ThenInclude(ov => ov.Option)
                 .Where(p => p.Id == id);
        }
    }
}
