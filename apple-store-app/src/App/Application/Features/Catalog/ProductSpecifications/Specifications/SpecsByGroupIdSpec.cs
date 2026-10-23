using Domain.Entities.Catalog;

namespace Application.Features.Catalog.ProductSpecifications.Specifications
{
    public sealed class SpecsByGroupIdSpec : Specification<ProductSpecification>
    {
        public SpecsByGroupIdSpec(int groupId)
        {
            Query.Where(s => s.GroupId == groupId)
                 .OrderBy(s => s.DisplayOrder);
        }
    }
}
