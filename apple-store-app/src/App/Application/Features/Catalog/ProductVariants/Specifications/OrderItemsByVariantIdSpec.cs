using Domain.Entities.Sales;

namespace Application.Features.Catalog.ProductVariants.Specifications
{
    public sealed class OrderItemsByVariantIdSpec : Specification<OrderItem>
    {
        public OrderItemsByVariantIdSpec(int variantId)
        {
            Query.Where(oi => oi.ProductVariantId == variantId);
        }
    }
}
