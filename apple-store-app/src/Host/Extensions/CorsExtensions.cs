using Host.Settings;

namespace Host.Extensions
{
    public static class CorsExtensions
    {
        public static IServiceCollection AddCustomCors(this IServiceCollection services, IConfiguration configuration)
        {
            var corsSettings = configuration.GetSection(CorsSettings.SectionName).Get<CorsSettings>() ?? new CorsSettings();

            services.AddCors(options =>
            {
                options.AddPolicy(corsSettings.PolicyName, policy =>
                {
                    if (corsSettings.AllowedOrigins != null && corsSettings.AllowedOrigins.Length > 0)
                    {
                        policy.WithOrigins(corsSettings.AllowedOrigins)
                              .AllowAnyMethod()
                              .AllowAnyHeader();

                        if (corsSettings.AllowCredentials)
                        {
                            policy.AllowCredentials();
                        }
                    }
                    else
                    {
                        policy.AllowAnyOrigin()
                              .AllowAnyMethod()
                              .AllowAnyHeader();
                    }
                });
            });

            return services;
        }

        public static IApplicationBuilder UseCustomCors(this IApplicationBuilder app, IConfiguration configuration)
        {
            var corsSettings = configuration.GetSection(CorsSettings.SectionName).Get<CorsSettings>() ?? new CorsSettings();
            return app.UseCors(corsSettings.PolicyName);
        }
    }
}
