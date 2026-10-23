using Domain.Entities.Catalog;

namespace Application.Features.Catalog.ProductSpecifications.Specifications
{
    public sealed class SpecGroupsByProductIdSpec : Specification<ProductSpecificationGroup>
    {
        public SpecGroupsByProductIdSpec(int productId)
        {
            Query.Where(g => g.ProductId == productId)
                 .Include(g => g.Specifications)
                 .OrderBy(g => g.DisplayOrder);
        }
    }
}
