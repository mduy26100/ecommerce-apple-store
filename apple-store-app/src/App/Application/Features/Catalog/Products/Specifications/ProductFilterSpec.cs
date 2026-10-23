using Application.Features.Catalog.Products.DTOs;
using Domain.Entities.Catalog;

namespace Application.Features.Catalog.Products.Specifications
{
    public sealed class ProductFilterSpec : Specification<Product>
    {
        public ProductFilterSpec(ProductPagedRequest request)
        {
            Query.AsNoTracking()
                 .Include(p => p.Category)
                 .Include(p => p.Images)
                 .Include(p => p.Variants)
                 .Include(p => p.SpecificationGroups)
                    .ThenInclude(g => g.Specifications);

            if (request.CategoryId.HasValue && request.CategoryId.Value > 0)
            {
                Query.Where(p => p.CategoryId == request.CategoryId.Value);
            }

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var search = request.Search.Trim().ToLower();
                Query.Where(p => p.Name.ToLower().Contains(search)
                    || p.Slug.ToLower().Contains(search)
                    || (p.ModelCode != null && p.ModelCode.ToLower().Contains(search)));
            }

            if (request.IsActive.HasValue)
            {
                Query.Where(p => p.IsActive == request.IsActive.Value);
            }

            Query.OrderBy(p => p.Name);
        }
    }
}
