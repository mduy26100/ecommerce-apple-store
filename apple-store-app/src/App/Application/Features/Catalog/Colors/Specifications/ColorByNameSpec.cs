using Domain.Entities.Catalog;

namespace Application.Features.Catalog.Colors.Specifications
{
    public sealed class ColorByNameSpec : Specification<Color>
    {
        public ColorByNameSpec(string name, int? excludeId = null)
        {
            var normalizedName = name.Trim().ToLower();
            Query.Where(c => c.Name.ToLower() == normalizedName);

            if (excludeId.HasValue)
            {
                Query.Where(c => c.Id != excludeId.Value);
            }
        }
    }
}
