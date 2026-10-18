using Domain.Entities.Catalog;

namespace Application.Features.Catalog.Colors.Specifications
{
    public sealed class ActiveColorsSpec : Specification<Color>
    {
        public ActiveColorsSpec()
        {
            Query.AsNoTracking()
                 .Where(c => c.IsActive)
                 .OrderBy(c => c.Name);
        }
    }
}
