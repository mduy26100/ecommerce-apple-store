using Application.Common.Interfaces.Persistence;
using Application.Common.Interfaces.Storage;
using Application.Common.Services.Payments;
using Application.Features.Identity.Services;
using Infrastructure.Identity.Models;
using Infrastructure.Identity.Services;
using Infrastructure.Payments;
using Infrastructure.Persistence;
using Infrastructure.Persistence.Seeders;
using Infrastructure.Settings;
using Infrastructure.Storage;

namespace Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddPersistence(configuration);
            services.AddIdentityServices();
            services.AddJwtAuthentication(configuration);
            services.AddStorageServices(configuration);
            services.AddPaymentServices(configuration);

            return services;
        }

        private static IServiceCollection AddPersistence(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? configuration.GetConnectionString("DbConnection")
                ?? throw new InvalidOperationException("Connection string 'DefaultConnection' or 'DbConnection' was not found in configuration.");

            services.AddDbContext<AppDbContext>(options =>
            {
                options.UseSqlServer(connectionString, sqlOptions =>
                {
                    sqlOptions.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName);
                });
            });

            services.AddScoped<IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());
            services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

            return services;
        }

        private static IServiceCollection AddIdentityServices(this IServiceCollection services)
        {
            services.AddIdentity<ApplicationUser, ApplicationRole>(options =>
            {
                options.Password.RequiredLength = 6;
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireUppercase = true;
                options.Password.RequireNonAlphanumeric = true;
                options.Password.RequiredUniqueChars = 1;

                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
                options.Lockout.MaxFailedAccessAttempts = 5;
                options.Lockout.AllowedForNewUsers = true;

                options.User.RequireUniqueEmail = true;
                options.SignIn.RequireConfirmedEmail = false;
            })
            .AddEntityFrameworkStores<AppDbContext>()
            .AddDefaultTokenProviders();

            return services;
        }

        private static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddHttpContextAccessor();

            services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));

            services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
            services.AddScoped<IAuthCookieService, AuthCookieService>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<ApplicationDbSeeder>();

            var jwtSettings = configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>() ?? new JwtSettings();

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.SaveToken = true;
                options.RequireHttpsMetadata = false;

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSettings.Issuer,
                    ValidAudience = jwtSettings.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
                    ClockSkew = TimeSpan.Zero,
                    RoleClaimType = "role",
                    NameClaimType = "sub"
                };
            });

            services.AddAuthorization();

            return services;
        }

        private static IServiceCollection AddStorageServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.Configure<CloudinarySettings>(configuration.GetSection(CloudinarySettings.SectionName));
            services.AddScoped<ICloudinaryService, CloudinaryStorageService>();

            return services;
        }

        private static IServiceCollection AddPaymentServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.Configure<VnPaySettings>(configuration.GetSection(VnPaySettings.SectionName));
            services.AddScoped<IVnPayService, VnPayService>();

            return services;
        }
    }
}
