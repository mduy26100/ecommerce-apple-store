using Domain.Entities.Catalog;

namespace Application.Features.Catalog.Colors.Specifications
{
    public sealed class ColorByCodeSpec : Specification<Color>
    {
        public ColorByCodeSpec(string code, int? excludeId = null)
        {
            var normalizedCode = code.Trim().ToUpperInvariant();
            Query.Where(c => c.Code.ToUpper() == normalizedCode);

            if (excludeId.HasValue)
            {
                Query.Where(c => c.Id != excludeId.Value);
            }
        }
    }
}
