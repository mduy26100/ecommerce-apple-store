using Application.Common.Interfaces.Persistence;
using Application.Features.Sales.Dashboard.DTOs;
using Application.Features.Sales.Dashboard.Specifications;
using Domain.Entities.Catalog;
using Domain.Entities.Sales;
using Domain.Enums.Sales;

namespace Application.Features.Sales.Dashboard.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IRepository<Order> _orderRepository;
        private readonly IRepository<ProductVariant> _variantRepository;
        private readonly IRepository<Category> _categoryRepository;
        private readonly IRepository<Product> _productRepository;

        public DashboardService(
            IRepository<Order> orderRepository,
            IRepository<ProductVariant> variantRepository,
            IRepository<Category> categoryRepository,
            IRepository<Product> productRepository)
        {
            _orderRepository = orderRepository;
            _variantRepository = variantRepository;
            _categoryRepository = categoryRepository;
            _productRepository = productRepository;
        }

        public async Task<DashboardMetricsDto> GetMetricsAsync(DashboardFilterRequest request, CancellationToken cancellationToken = default)
        {
            var (fromDate, toDate, prevFromDate, prevToDate) = ResolveDateRange(request.TimeScope);

            var currentOrders = await _orderRepository.ListAsync(
                new DashboardOrderSpec(fromDate, toDate, request.ChannelScope),
                cancellationToken);

            var prevOrders = await _orderRepository.ListAsync(
                new DashboardOrderSpec(prevFromDate, prevToDate, request.ChannelScope),
                cancellationToken);

            var allHistoricalOrders = await _orderRepository.ListAsync(cancellationToken);

            var currentOrdersCount = currentOrders.Count;
            var prevOrdersCount = prevOrders.Count;

            var currentSuccessful = currentOrders.Where(IsOrderSuccessful).ToList();
            var prevSuccessful = prevOrders.Where(IsOrderSuccessful).ToList();

            var netRevenue = currentSuccessful.Sum(o => o.TotalAmount);
            var prevRevenue = prevSuccessful.Sum(o => o.TotalAmount);

            var estimatedRevenue = currentOrders
                .Where(o => o.Status != OrderStatus.Cancelled && o.Status != OrderStatus.Returned)
                .Sum(o => o.TotalAmount);

            var ordersGrowth = prevOrdersCount > 0
                ? Math.Round((decimal)(currentOrdersCount - prevOrdersCount) / prevOrdersCount * 100m, 1)
                : (currentOrdersCount == 0 ? 0m : (decimal?)null);

            var revenueGrowth = prevRevenue > 0
                ? Math.Round((netRevenue - prevRevenue) / prevRevenue * 100m, 1)
                : (netRevenue == 0m ? 0m : (decimal?)null);

            var aov = currentSuccessful.Count > 0
                ? Math.Round(netRevenue / currentSuccessful.Count, 0)
                : 0m;

            var currentCustomerKeys = currentOrders.Select(GetCustomerKey).Distinct().ToList();
            var activeUsersCount = currentCustomerKeys.Count;

            var priorHistoricalOrders = allHistoricalOrders.Where(o => o.PlacedAt < fromDate).ToList();
            var priorCustomerKeys = new HashSet<string>(priorHistoricalOrders.Select(GetCustomerKey));

            var newUsersCount = currentCustomerKeys.Count(k => !priorCustomerKeys.Contains(k));

            var customerOrderCounts = allHistoricalOrders
                .GroupBy(GetCustomerKey)
                .ToDictionary(g => g.Key, g => g.Count());

            var repeatCustomers = currentCustomerKeys.Count(k => customerOrderCounts.TryGetValue(k, out var c) && c >= 2);
            var retentionRate = activeUsersCount > 0
                ? Math.Round((decimal)repeatCustomers / activeUsersCount * 100m, 1)
                : 0m;

            var allVariants = await _variantRepository.ListAsync(cancellationToken);
            var activeSkusCount = allVariants.Count(v => v.IsActive && !v.IsDeleted && v.QuantityInStock > 0);
            var lowStockSkusCount = allVariants.Count(v => v.IsActive && !v.IsDeleted && v.QuantityInStock <= 5);
            var totalSkusCount = allVariants.Count(v => !v.IsDeleted);
            var totalStockQuantity = allVariants.Where(v => !v.IsDeleted).Sum(v => v.QuantityInStock);

            var allCategories = await _categoryRepository.ListAsync(cancellationToken);
            var totalCategoriesCount = allCategories.Count(c => !c.IsDeleted);
            var activeCategoriesCount = allCategories.Count(c => c.IsActive && !c.IsDeleted);

            var allProducts = await _productRepository.ListAsync(cancellationToken);
            var totalProductsCount = allProducts.Count(p => !p.IsDeleted);
            var activeProductsCount = allProducts.Count(p => p.IsActive && !p.IsDeleted);

            return new DashboardMetricsDto
            {
                OrdersCount = currentOrdersCount,
                OrdersGrowthPercentage = ordersGrowth,
                NetRevenue = netRevenue,
                RevenueGrowthPercentage = revenueGrowth,
                EstimatedRevenue = estimatedRevenue,
                AverageOrderValue = aov,
                NewUsersCount = newUsersCount,
                ActiveUsersCount = activeUsersCount,
                RetentionRate = retentionRate,
                ActiveSkusCount = activeSkusCount,
                LowStockSkusCount = lowStockSkusCount,
                TotalProductsCount = totalProductsCount,
                ActiveProductsCount = activeProductsCount,
                TotalCategoriesCount = totalCategoriesCount,
                ActiveCategoriesCount = activeCategoriesCount,
                TotalSkusCount = totalSkusCount,
                TotalStockQuantity = totalStockQuantity
            };
        }

        public async Task<DashboardActionCenterDto> GetActionCenterAsync(DashboardFilterRequest request, CancellationToken cancellationToken = default)
        {
            var now = DateTimeOffset.UtcNow;
            var recentThreshold = now.AddDays(-60);

            var orders = await _orderRepository.ListAsync(
                new DashboardOrderSpec(recentThreshold, now, request.ChannelScope),
                cancellationToken);

            var pendingConfirmation = orders.Count(o => o.Status == OrderStatus.Pending);

            var processingShipping = orders.Count(o =>
                o.Status == OrderStatus.Confirmed ||
                o.Status == OrderStatus.Processing ||
                o.Status == OrderStatus.Shipping);

            var complaintsReturns = orders.Count(o =>
                o.Status == OrderStatus.Returned ||
                o.Status == OrderStatus.Cancelled);

            var paymentAlerts = orders.Count(o =>
                o.PaymentStatus == PaymentStatus.Failed ||
                (o.PaymentStatus == PaymentStatus.Pending && o.PaymentMethod == PaymentMethod.VNPAY));

            var delayedSla = orders.Count(o =>
                (o.Status == OrderStatus.Pending || o.Status == OrderStatus.Processing) &&
                o.PlacedAt <= now.AddDays(-2));

            return new DashboardActionCenterDto
            {
                PendingConfirmationCount = pendingConfirmation,
                ProcessingShippingCount = processingShipping,
                ComplaintsReturnsCount = complaintsReturns,
                PaymentAlertsCount = paymentAlerts,
                DelayedSlaCount = delayedSla
            };
        }

        public async Task<DashboardTrendsDto> GetTrendsAsync(DashboardFilterRequest request, CancellationToken cancellationToken = default)
        {
            var (fromDate, toDate, _, _) = ResolveDateRange(request.TimeScope);

            var orders = await _orderRepository.ListAsync(
                new DashboardOrderSpec(fromDate, toDate, request.ChannelScope),
                cancellationToken);

            var dailyGroups = orders
                .GroupBy(o => o.PlacedAt.ToLocalTime().ToString("yyyy-MM-dd"))
                .OrderBy(g => g.Key)
                .ToList();

            var revenueTrends = new List<DailyRevenueTrendDto>();
            foreach (var group in dailyGroups)
            {
                var successfulOrders = group.Where(IsOrderSuccessful).ToList();
                var groupDate = DateTime.TryParse(group.Key, out var d) ? d : DateTime.UtcNow;

                revenueTrends.Add(new DailyRevenueTrendDto
                {
                    Date = group.Key,
                    DateLabel = groupDate.ToString("dd/MM"),
                    Revenue = successfulOrders.Sum(o => o.TotalAmount),
                    OrdersCount = group.Count()
                });
            }

            var totalOrdersCount = orders.Count;
            var statusDistribution = new List<StatusDistributionDto>
            {
                new StatusDistributionDto
                {
                    Status = "Completed",
                    StatusName = "Giao thành công / Hoàn tất",
                    Count = orders.Count(o => o.Status == OrderStatus.Completed || o.Status == OrderStatus.Delivered),
                    Percentage = totalOrdersCount > 0 ? Math.Round((decimal)orders.Count(o => o.Status == OrderStatus.Completed || o.Status == OrderStatus.Delivered) / totalOrdersCount * 100m, 1) : 0m
                },
                new StatusDistributionDto
                {
                    Status = "Shipping",
                    StatusName = "Đang vận chuyển",
                    Count = orders.Count(o => o.Status == OrderStatus.Shipping),
                    Percentage = totalOrdersCount > 0 ? Math.Round((decimal)orders.Count(o => o.Status == OrderStatus.Shipping) / totalOrdersCount * 100m, 1) : 0m
                },
                new StatusDistributionDto
                {
                    Status = "Processing",
                    StatusName = "Đang xử lý / Đóng gói",
                    Count = orders.Count(o => o.Status == OrderStatus.Pending || o.Status == OrderStatus.Confirmed || o.Status == OrderStatus.Processing),
                    Percentage = totalOrdersCount > 0 ? Math.Round((decimal)orders.Count(o => o.Status == OrderStatus.Pending || o.Status == OrderStatus.Confirmed || o.Status == OrderStatus.Processing) / totalOrdersCount * 100m, 1) : 0m
                },
                new StatusDistributionDto
                {
                    Status = "Cancelled",
                    StatusName = "Đã hủy / Hoàn trả",
                    Count = orders.Count(o => o.Status == OrderStatus.Cancelled || o.Status == OrderStatus.Returned),
                    Percentage = totalOrdersCount > 0 ? Math.Round((decimal)orders.Count(o => o.Status == OrderStatus.Cancelled || o.Status == OrderStatus.Returned) / totalOrdersCount * 100m, 1) : 0m
                }
            };

            var paymentDistribution = new List<PaymentMethodDistributionDto>();
            var supportedMethods = new[] { PaymentMethod.VNPAY, PaymentMethod.COD };
            foreach (var method in supportedMethods)
            {
                var matching = orders.Where(o => o.PaymentMethod == method).ToList();
                var count = matching.Count;
                var amount = matching.Sum(o => o.TotalAmount);
                var pct = totalOrdersCount > 0 ? Math.Round((decimal)count / totalOrdersCount * 100m, 1) : 0m;

                paymentDistribution.Add(new PaymentMethodDistributionDto
                {
                    Method = method.ToString(),
                    MethodName = GetPaymentMethodName(method),
                    Count = count,
                    TotalAmount = amount,
                    Percentage = pct
                });
            }

            var customerTrends = new List<CustomerGrowthTrendDto>();
            foreach (var group in dailyGroups)
            {
                var groupDate = DateTime.TryParse(group.Key, out var d) ? d : DateTime.UtcNow;
                var uniqueCustomers = group.Select(GetCustomerKey).Distinct().Count();

                customerTrends.Add(new CustomerGrowthTrendDto
                {
                    DateLabel = groupDate.ToString("dd/MM"),
                    NewCustomers = Math.Max(1, uniqueCustomers / 2),
                    ActiveCustomers = uniqueCustomers
                });
            }

            var allCategories = await _categoryRepository.ListAsync(cancellationToken);
            var allProducts = await _productRepository.ListAsync(cancellationToken);
            var allVariants = await _variantRepository.ListAsync(cancellationToken);

            var activeCategories = allCategories.Where(c => !c.IsDeleted).ToList();
            var productsByCat = allProducts.Where(p => !p.IsDeleted).GroupBy(p => p.CategoryId).ToDictionary(g => g.Key, g => g.ToList());
            var variantsByProd = allVariants.Where(v => !v.IsDeleted).GroupBy(v => v.ProductId).ToDictionary(g => g.Key, g => g.ToList());

            var totalStockAll = allVariants.Where(v => !v.IsDeleted).Sum(v => v.QuantityInStock);

            var categoryDistribution = new List<CategoryDistributionDto>();
            foreach (var cat in activeCategories)
            {
                productsByCat.TryGetValue(cat.Id, out var prods);
                prods ??= new List<Product>();

                var prodIds = new HashSet<int>(prods.Select(p => p.Id));
                var catVariants = allVariants.Where(v => !v.IsDeleted && prodIds.Contains(v.ProductId)).ToList();

                var stockOfCat = catVariants.Sum(v => v.QuantityInStock);
                var pct = totalStockAll > 0 ? Math.Round((decimal)stockOfCat / totalStockAll * 100m, 1) : 0m;

                categoryDistribution.Add(new CategoryDistributionDto
                {
                    CategoryId = cat.Id,
                    CategoryName = cat.Name,
                    ProductsCount = prods.Count,
                    VariantsCount = catVariants.Count,
                    TotalStock = stockOfCat,
                    Percentage = pct
                });
            }

            return new DashboardTrendsDto
            {
                RevenueTrends = revenueTrends,
                StatusDistribution = statusDistribution,
                PaymentDistribution = paymentDistribution,
                CustomerTrends = customerTrends,
                CategoryDistribution = categoryDistribution
            };
        }

        public async Task<DashboardRankingsDto> GetRankingsAsync(DashboardFilterRequest request, CancellationToken cancellationToken = default)
        {
            var (fromDate, toDate, _, _) = ResolveDateRange(request.TimeScope);

            var orders = await _orderRepository.ListAsync(
                new DashboardOrderSpec(fromDate, toDate, request.ChannelScope),
                cancellationToken);

            var successfulOrders = orders.Where(IsOrderSuccessful).ToList();

            var orderItems = successfulOrders
                .SelectMany(o => o.Items)
                .ToList();

            var topSellingProducts = orderItems
                .GroupBy(i => new { i.ProductName, i.SKU })
                .Select(g => new TopSellingProductDto
                {
                    ProductName = g.Key.ProductName,
                    Sku = g.Key.SKU,
                    ThumbnailUrl = g.FirstOrDefault()?.ThumbnailUrl,
                    QuantitySold = g.Sum(i => i.Quantity),
                    TotalRevenue = g.Sum(i => i.LineTotal)
                })
                .OrderByDescending(p => p.QuantitySold)
                .ThenByDescending(p => p.TotalRevenue)
                .Take(5)
                .ToList();

            var variants = await _variantRepository.ListAsync(cancellationToken);
            var lowStockProducts = variants
                .Where(v => v.IsActive && !v.IsDeleted && v.QuantityInStock <= 15)
                .OrderBy(v => v.QuantityInStock)
                .Take(5)
                .Select(v => new LowStockProductDto
                {
                    ProductName = v.VariantName ?? v.SKU,
                    Sku = v.SKU,
                    QuantityInStock = v.QuantityInStock,
                    Price = v.Price
                })
                .ToList();

            var topCustomers = successfulOrders
                .GroupBy(GetCustomerKey)
                .Select(g =>
                {
                    var first = g.First();
                    return new TopCustomerDto
                    {
                        CustomerName = first.RecipientName,
                        CustomerPhone = first.RecipientPhone,
                        CustomerEmail = first.RecipientEmail,
                        CustomerType = first.UserId.HasValue ? "Thành viên VIP" : "Khách mua nhiều",
                        OrdersCount = g.Count(),
                        TotalSpent = g.Sum(o => o.TotalAmount)
                    };
                })
                .OrderByDescending(c => c.TotalSpent)
                .Take(5)
                .ToList();

            var recentOrders = orders
                .OrderByDescending(o => o.PlacedAt)
                .Take(5)
                .Select(o => new RecentActivityOrderDto
                {
                    Id = o.Id,
                    OrderNumber = o.OrderNumber,
                    RecipientName = o.RecipientName,
                    RecipientPhone = o.RecipientPhone,
                    TotalAmount = o.TotalAmount,
                    Status = o.Status.ToString(),
                    StatusName = GetOrderStatusName(o.Status),
                    PaymentMethodName = GetPaymentMethodName(o.PaymentMethod),
                    PaymentStatusName = GetPaymentStatusName(o.PaymentStatus),
                    PlacedAt = o.PlacedAt
                })
                .ToList();

            return new DashboardRankingsDto
            {
                TopSellingProducts = topSellingProducts,
                LowStockProducts = lowStockProducts,
                TopCustomers = topCustomers,
                RecentOrders = recentOrders
            };
        }

        private static (DateTimeOffset fromDate, DateTimeOffset toDate, DateTimeOffset prevFromDate, DateTimeOffset prevToDate) ResolveDateRange(string? timeScope)
        {
            var now = DateTimeOffset.UtcNow;
            DateTimeOffset fromDate;
            DateTimeOffset toDate = now;

            switch (timeScope?.ToLowerInvariant())
            {
                case "today":
                    fromDate = new DateTimeOffset(now.Year, now.Month, now.Day, 0, 0, 0, TimeSpan.Zero);
                    break;
                case "yesterday":
                    var yest = now.AddDays(-1);
                    fromDate = new DateTimeOffset(yest.Year, yest.Month, yest.Day, 0, 0, 0, TimeSpan.Zero);
                    toDate = new DateTimeOffset(yest.Year, yest.Month, yest.Day, 23, 59, 59, TimeSpan.Zero);
                    break;
                case "7days":
                    fromDate = now.AddDays(-7);
                    break;
                case "thismonth":
                    fromDate = new DateTimeOffset(now.Year, now.Month, 1, 0, 0, 0, TimeSpan.Zero);
                    break;
                case "30days":
                default:
                    fromDate = now.AddDays(-30);
                    break;
            }

            var duration = toDate - fromDate;
            if (duration <= TimeSpan.Zero)
            {
                duration = TimeSpan.FromDays(1);
            }
            var prevToDate = fromDate;
            var prevFromDate = fromDate - duration;

            return (fromDate, toDate, prevFromDate, prevToDate);
        }

        private static bool IsOrderSuccessful(Order order)
        {
            if (order.Status == OrderStatus.Cancelled || order.Status == OrderStatus.Returned)
            {
                return false;
            }

            if (order.PaymentStatus == PaymentStatus.Refunded)
            {
                return false;
            }

            return order.Status == OrderStatus.Completed || order.Status == OrderStatus.Delivered;
        }

        private static string GetCustomerKey(Order order)
        {
            if (order.UserId.HasValue) return $"U_{order.UserId.Value}";
            if (!string.IsNullOrWhiteSpace(order.RecipientPhone)) return $"P_{order.RecipientPhone.Trim()}";
            if (!string.IsNullOrWhiteSpace(order.GuestId)) return $"G_{order.GuestId.Trim()}";
            return $"N_{order.RecipientName.Trim()}";
        }

        private static string GetOrderStatusName(OrderStatus status)
        {
            return status switch
            {
                OrderStatus.Pending => "Chờ xử lý",
                OrderStatus.Confirmed => "Đã xác nhận",
                OrderStatus.Processing => "Đang đóng gói",
                OrderStatus.Shipping => "Đang giao vận",
                OrderStatus.Delivered => "Giao thành công",
                OrderStatus.Completed => "Hoàn tất",
                OrderStatus.Cancelled => "Đã hủy",
                OrderStatus.Returned => "Khiếu nại / Trả hàng",
                _ => status.ToString()
            };
        }

        private static string GetPaymentStatusName(PaymentStatus status)
        {
            return status switch
            {
                PaymentStatus.Pending => "Chờ thanh toán",
                PaymentStatus.Paid => "Đã thanh toán",
                PaymentStatus.Failed => "Lỗi thanh toán",
                PaymentStatus.Refunded => "Đã hoàn tiền",
                _ => status.ToString()
            };
        }

        private static string GetPaymentMethodName(PaymentMethod method)
        {
            return method switch
            {
                PaymentMethod.VNPAY => "VNPAY",
                PaymentMethod.COD => "Thanh toán khi nhận (COD)",
                _ => method.ToString()
            };
        }
    }
}

