using Application.Features.Catalog.Categories.Services;
using Application.Features.Catalog.Colors.Services;
using Application.Features.Catalog.Products.Services;
using Application.Features.Catalog.ProductSpecifications.Services;
using Application.Features.Catalog.ProductVariants.Services;
using Application.Features.Catalog.StorageOptions.Services;
using Application.Features.Catalog.VariantImages.Services;

namespace Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            services.AddScoped<ICategoryService, CategoryService>();
            services.AddScoped<IColorService, ColorService>();
            services.AddScoped<IStorageOptionService, StorageOptionService>();
            services.AddScoped<IProductService, ProductService>();
            services.AddScoped<IProductVariantService, ProductVariantService>();
            services.AddScoped<IVariantImageService, VariantImageService>();
            services.AddScoped<IProductSpecificationService, ProductSpecificationService>();

            return services;
        }
    }
}
