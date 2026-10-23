using Ardalis.Specification;
using Domain.Entities.Catalog;

namespace Application.Features.Catalog.ProductImages.Specifications
{
    public sealed class ImagesByProductIdSpec : Specification<ProductImage>
    {
        public ImagesByProductIdSpec(int productId, int? optionValueId = null)
        {
            Query.Where(i => i.ProductId == productId);

            if (optionValueId.HasValue)
            {
                Query.Where(i => i.OptionValueId == optionValueId.Value);
            }

            Query.Include(i => i.OptionValue)
                .OrderBy(i => i.DisplayOrder)
                .ThenBy(i => i.Id);
        }
    }
}
