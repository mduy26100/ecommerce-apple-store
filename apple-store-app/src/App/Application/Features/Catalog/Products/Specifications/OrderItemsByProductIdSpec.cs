using Domain.Entities.Sales;

namespace Application.Features.Catalog.Products.Specifications
{
    public sealed class OrderItemsByProductIdSpec : Specification<OrderItem>
    {
        public OrderItemsByProductIdSpec(int productId)
        {
            Query.Where(oi => oi.ProductVariant != null && oi.ProductVariant.ProductId == productId);
        }
    }
}
