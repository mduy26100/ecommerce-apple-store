namespace Infrastructure.Identity.Models
{
    public class ApplicationRole : IdentityRole<int>
    {
        public string? Description { get; set; }
    }
}
