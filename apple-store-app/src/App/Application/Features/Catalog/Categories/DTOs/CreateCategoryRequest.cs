namespace Application.Features.Catalog.Categories.DTOs
{
    public class CreateCategoryRequest
    {
        public string Name { get; set; } = default!;
        public string Slug { get; set; } = default!;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public int DisplayOrder { get; set; } = 0;
        public bool IsActive { get; set; } = true;
        public Stream? ImageStream { get; set; }
        public string? ImageFileName { get; set; }
        public string? ImageContentType { get; set; }
    }
}
