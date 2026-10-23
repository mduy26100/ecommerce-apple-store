namespace Application.Features.Catalog.ProductSpecifications.DTOs
{
    public class ReorderGroupRequest
    {
        public List<int> OrderedGroupIds { get; set; } = new List<int>();
    }
}
