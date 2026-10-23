using Ardalis.Specification;
using Domain.Entities.Catalog;

namespace Application.Features.Catalog.ProductImages.Specifications
{
    public sealed class ProductImageByIdSpec : Specification<ProductImage>
    {
        public ProductImageByIdSpec(int id)
        {
            Query.Where(i => i.Id == id)
                .Include(i => i.OptionValue);
        }
    }
}
