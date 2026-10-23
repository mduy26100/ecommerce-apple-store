using Domain.Entities.Catalog;

namespace Application.Features.Catalog.ProductSpecifications.Specifications
{
    public sealed class SpecGroupByIdWithSpecsSpec : Specification<ProductSpecificationGroup>
    {
        public SpecGroupByIdWithSpecsSpec(int id)
        {
            Query.Where(g => g.Id == id)
                 .Include(g => g.Specifications);
        }
    }
}
