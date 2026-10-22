namespace Application.Features.Identity.DTOs
{
    public class AuthResponseDto
    {
        public string AccessToken { get; set; } = string.Empty;
        public int ExpiresInMinutes { get; set; }
        public UserDetailsDto User { get; set; } = default!;

        [JsonIgnore]
        public string RefreshToken { get; set; } = string.Empty;
    }
}
