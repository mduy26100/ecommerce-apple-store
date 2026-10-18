using Domain.Entities.Catalog;

namespace Application.Features.Catalog.ProductSpecifications.Specifications
{
    public sealed class SpecsByProductIdSpec : Specification<ProductSpecification>
    {
        public SpecsByProductIdSpec(int productId)
        {
            Query.Where(s => s.ProductId == productId)
                 .OrderBy(s => s.GroupName)
                 .ThenBy(s => s.DisplayOrder)
                 .ThenBy(s => s.Name);
        }
    }
}
