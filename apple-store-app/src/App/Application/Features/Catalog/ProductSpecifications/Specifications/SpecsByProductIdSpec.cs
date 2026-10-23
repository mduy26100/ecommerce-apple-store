using Domain.Entities.Catalog;

namespace Application.Features.Catalog.ProductSpecifications.Specifications
{
    public sealed class SpecsByProductIdSpec : Specification<ProductSpecification>
    {
        public SpecsByProductIdSpec(int productId)
        {
            Query.Include(s => s.Group)
                 .Where(s => s.Group.ProductId == productId)
                 .OrderBy(s => s.Group.DisplayOrder)
                 .ThenBy(s => s.DisplayOrder)
                 .ThenBy(s => s.Name);
        }
    }
}
