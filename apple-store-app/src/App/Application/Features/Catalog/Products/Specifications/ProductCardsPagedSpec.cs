using Domain.Entities.Catalog;

namespace Application.Features.Catalog.Products.Specifications
{
    public sealed class ProductCardsPagedSpec : Specification<Product>
    {
        public ProductCardsPagedSpec(
            int? categoryId = null,
            string? categorySlug = null,
            string? search = null,
            string? sortBy = null,
            decimal? minPrice = null,
            decimal? maxPrice = null)
        {
            Query.AsNoTracking()
                 .Include(p => p.Category)
                 .Include(p => p.Variants)
                    .ThenInclude(v => v.Images)
                 .Include(p => p.Specifications)
                 .Where(p => p.IsActive && !p.IsDeleted);

            if (categoryId.HasValue && categoryId.Value > 0)
            {
                Query.Where(p => p.CategoryId == categoryId.Value);
            }
            else if (!string.IsNullOrWhiteSpace(categorySlug))
            {
                var slug = categorySlug.Trim().ToLower();
                Query.Where(p => p.Category.Slug == slug);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                Query.Where(p => p.Name.ToLower().Contains(term) ||
                                 (p.ShortDescription != null && p.ShortDescription.ToLower().Contains(term)));
            }

            if (minPrice.HasValue && minPrice.Value > 0)
            {
                Query.Where(p => p.Variants.Any(v => v.IsActive && !v.IsDeleted && v.Price >= minPrice.Value));
            }

            if (maxPrice.HasValue && maxPrice.Value > 0)
            {
                Query.Where(p => p.Variants.Any(v => v.IsActive && !v.IsDeleted && v.Price <= maxPrice.Value));
            }

            switch (sortBy?.ToLower())
            {
                case "price_asc":
                case "price-asc":
                case "price_low_high":
                    Query.OrderBy(p => p.Variants.Where(v => v.IsActive && !v.IsDeleted).Min(v => v.Price));
                    break;
                case "price_desc":
                case "price-desc":
                case "price_high_low":
                    Query.OrderByDescending(p => p.Variants.Where(v => v.IsActive && !v.IsDeleted).Min(v => v.Price));
                    break;
                case "name_asc":
                case "name-asc":
                    Query.OrderBy(p => p.Name);
                    break;
                case "newest":
                case "latest":
                    Query.OrderByDescending(p => p.Id);
                    break;
                default:
                    Query.OrderBy(p => p.CategoryId).ThenBy(p => p.Id);
                    break;
            }
        }
    }
}
