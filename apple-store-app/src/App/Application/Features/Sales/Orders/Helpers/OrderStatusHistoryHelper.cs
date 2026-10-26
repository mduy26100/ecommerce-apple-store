using Application.Features.Sales.Orders.DTOs;
using Domain.Enums.Sales;

namespace Application.Features.Sales.Orders.Helpers
{
    public static class OrderStatusHistoryHelper
    {
        public static string GetStatusDisplayName(OrderStatus status)
        {
            return status switch
            {
                OrderStatus.Pending => "Chờ xử lý",
                OrderStatus.Confirmed => "Đã xác nhận",
                OrderStatus.Processing => "Đang đóng gói",
                OrderStatus.Shipping => "Đang giao hàng",
                OrderStatus.Delivered => "Đã giao hàng",
                OrderStatus.Completed => "Đã nhận hàng",
                OrderStatus.Cancelled => "Đã hủy",
                OrderStatus.Returned => "Đã trả hàng",
                _ => status.ToString()
            };
        }

        public static List<OrderStatusHistoryItemDto> ParseHistory(string? json)
        {
            if (string.IsNullOrWhiteSpace(json))
            {
                return new List<OrderStatusHistoryItemDto>();
            }

            try
            {
                return JsonSerializer.Deserialize<List<OrderStatusHistoryItemDto>>(json, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }) ?? new List<OrderStatusHistoryItemDto>();
            }
            catch
            {
                return new List<OrderStatusHistoryItemDto>();
            }
        }

        public static string AppendHistory(string? existingJson, OrderStatus status, string actor, string? actorName = null, string? note = null)
        {
            var list = ParseHistory(existingJson);

            list.Add(new OrderStatusHistoryItemDto
            {
                Status = status.ToString(),
                StatusName = GetStatusDisplayName(status),
                ChangedAt = DateTimeOffset.UtcNow,
                Actor = actor,
                ActorName = actorName,
                Note = note
            });

            return JsonSerializer.Serialize(list);
        }
    }
}
