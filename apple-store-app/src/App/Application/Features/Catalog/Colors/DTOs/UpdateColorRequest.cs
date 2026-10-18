namespace Application.Features.Catalog.Colors.DTOs
{
    public class UpdateColorRequest
    {
        public string Name { get; set; } = default!;
        public string Code { get; set; } = default!;
        public string? HexCode { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
