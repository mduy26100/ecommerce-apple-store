using Application.Common.Interfaces.Storage;
using Application.Common.Services.Storage;
using Application.Features.Catalog.Categories.Services;
using Application.Features.Catalog.Colors.Services;
using Application.Features.Catalog.ProductImages.Services;
using Application.Features.Catalog.ProductOptions.Services;
using Application.Features.Catalog.Products.Services;
using Application.Features.Catalog.ProductSpecifications.Services;
using Application.Features.Catalog.ProductVariants.Services;
using Application.Features.Catalog.StorageOptions.Services;
using Application.Features.Sales.Carts.Services;
using Application.Features.Sales.Orders.Services;

namespace Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            services.AddScoped<IUploadImageService, UploadImageService>();
            services.AddScoped<ICategoryService, CategoryService>();
            services.AddScoped<IColorService, ColorService>();
            services.AddScoped<IStorageOptionService, StorageOptionService>();
            services.AddScoped<IProductService, ProductService>();
            services.AddScoped<IProductOptionService, ProductOptionService>();
            services.AddScoped<IProductVariantService, ProductVariantService>();
            services.AddScoped<IProductImageService, ProductImageService>();
            services.AddScoped<IProductSpecificationService, ProductSpecificationService>();
            services.AddScoped<ICartService, CartService>();
            services.AddScoped<IOrderService, OrderService>();

            return services;
        }
    }
}
