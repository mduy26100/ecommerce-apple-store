namespace Application.Features.Catalog.ProductSpecifications.DTOs
{
    public class ReorderSpecRequest
    {
        public List<int> OrderedSpecIds { get; set; } = new List<int>();
    }
}
