namespace Host.Settings
{
    public class CorsSettings
    {
        public const string SectionName = "CorsSettings";

        public string PolicyName { get; set; } = "DefaultCorsPolicy";
        public string[] AllowedOrigins { get; set; } = Array.Empty<string>();
        public bool AllowCredentials { get; set; } = true;
    }
}
