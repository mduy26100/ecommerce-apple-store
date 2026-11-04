using Application.Wrappers;

namespace Application.Features.Identity.DTOs
{
    public class UserPagedRequest : PagedRequest
    {
        public string? Status { get; set; }
    }
}

