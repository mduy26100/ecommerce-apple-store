using Application.Features.Catalog.Categories.Services;
using Application.Features.Catalog.Colors.Services;

namespace Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            services.AddScoped<ICategoryService, CategoryService>();
            services.AddScoped<IColorService, ColorService>();

            return services;
        }
    }
}
