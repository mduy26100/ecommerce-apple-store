using Application.Common.Interfaces.Persistence;
using Application.Common.Interfaces.Reports;
using Application.Features.Sales.Reports.DTOs;
using Application.Features.Sales.Reports.Specifications;
using Application.Wrappers;
using Domain.Entities.Catalog;
using Domain.Entities.Sales;
using Domain.Enums.Sales;
using Domain.Exceptions;

namespace Application.Features.Sales.Reports.Services
{
    public class OrderReportService : IOrderReportService
    {
        private readonly IRepository<Order> _orderRepository;
        private readonly IRepository<ProductVariant> _variantRepository;
        private readonly IRepository<Product> _productRepository;
        private readonly IRepository<Category> _categoryRepository;
        private readonly IExcelExportService _excelExportService;

        public OrderReportService(
            IRepository<Order> orderRepository,
            IRepository<ProductVariant> variantRepository,
            IRepository<Product> productRepository,
            IRepository<Category> categoryRepository,
            IExcelExportService excelExportService)
        {
            _orderRepository = orderRepository;
            _variantRepository = variantRepository;
            _productRepository = productRepository;
            _categoryRepository = categoryRepository;
            _excelExportService = excelExportService;
        }

        public async Task<OrderKpiSummaryDto> GetSummaryAsync(OrderReportFilterRequest request, CancellationToken cancellationToken = default)
        {
            ValidateDateRange(request);

            var toDate = request.ToDate ?? DateTimeOffset.UtcNow;
            var fromDate = request.FromDate ?? DateTimeOffset.UtcNow.AddDays(-30);
            var duration = toDate - fromDate;
            if (duration <= TimeSpan.Zero)
            {
                duration = TimeSpan.FromDays(1);
            }

            var currentRequest = CloneRequestWithDates(request, fromDate, toDate);
            currentRequest.Status = null;
            var prevRequest = CloneRequestWithDates(request, fromDate - duration, fromDate);
            prevRequest.Status = null;

            var currentOrders = await _orderRepository.ListAsync(new OrderReportFilterSpec(currentRequest), cancellationToken);
            var prevOrders = await _orderRepository.ListAsync(new OrderReportFilterSpec(prevRequest), cancellationToken);

            var successfulOrders = currentOrders.Where(IsOrderSuccessful).ToList();
            var cancelledOrders = currentOrders.Where(o => o.Status == OrderStatus.Cancelled || o.Status == OrderStatus.Returned).ToList();

            var totalRevenue = successfulOrders.Sum(o => o.TotalAmount);
            var totalGross = currentOrders.Sum(o => o.TotalAmount);
            var netGross = currentOrders
                .Where(o => o.Status != OrderStatus.Cancelled && o.Status != OrderStatus.Returned)
                .Sum(o => o.TotalAmount);
            var totalOrders = currentOrders.Count;
            var totalCustomers = GetDistinctCustomerCount(currentOrders);

            var prevSuccessfulOrders = prevOrders.Where(IsOrderSuccessful).ToList();
            var prevRevenue = prevSuccessfulOrders.Sum(o => o.TotalAmount);
            var prevOrdersCount = prevOrders.Count;
            var prevCustomers = GetDistinctCustomerCount(prevOrders);

            var successRate = totalOrders > 0
                ? Math.Round((decimal)successfulOrders.Count / totalOrders * 100m, 1)
                : 0m;

            var cancelledRate = totalOrders > 0
                ? Math.Round((decimal)cancelledOrders.Count / totalOrders * 100m, 1)
                : 0m;

            var aov = successfulOrders.Count > 0
                ? Math.Round(totalRevenue / successfulOrders.Count, 0)
                : 0m;

            var growthRevenue = prevRevenue > 0
                ? Math.Round((totalRevenue - prevRevenue) / prevRevenue * 100m, 1)
                : (totalRevenue == 0m ? 0m : (decimal?)null);

            var growthOrders = prevOrdersCount > 0
                ? Math.Round((decimal)(totalOrders - prevOrdersCount) / prevOrdersCount * 100m, 1)
                : (totalOrders == 0 ? 0m : (decimal?)null);

            var growthCustomers = prevCustomers > 0
                ? Math.Round((decimal)(totalCustomers - prevCustomers) / prevCustomers * 100m, 1)
                : (totalCustomers == 0 ? 0m : (decimal?)null);

            return new OrderKpiSummaryDto
            {
                TotalRevenue = totalRevenue,
                TotalGrossAmount = totalGross,
                NetGrossAmount = netGross,
                TotalOrders = totalOrders,
                TotalCustomers = totalCustomers,
                SuccessRate = successRate,
                CancelledRate = cancelledRate,
                AverageOrderValue = aov,
                TotalDiscount = currentOrders.Sum(o => o.DiscountAmount),
                TotalShippingFee = currentOrders.Sum(o => o.ShippingFee),
                GrowthRevenuePercentage = growthRevenue,
                GrowthOrdersPercentage = growthOrders,
                GrowthCustomersPercentage = growthCustomers,
                PreviousRevenue = prevRevenue,
                PreviousOrders = prevOrdersCount,
                PreviousCustomers = prevCustomers
            };
        }

        public async Task<List<OrderStatusBreakdownDto>> GetStatusBreakdownAsync(OrderReportFilterRequest request, CancellationToken cancellationToken = default)
        {
            ValidateDateRange(request);

            var normalizedRequest = CloneRequestWithDates(
                request,
                request.FromDate ?? DateTimeOffset.UtcNow.AddDays(-30),
                request.ToDate ?? DateTimeOffset.UtcNow
            );
            normalizedRequest.Status = null;

            var orders = await _orderRepository.ListAsync(new OrderReportFilterSpec(normalizedRequest), cancellationToken);
            var totalCount = orders.Count;

            var allStatuses = (OrderStatus[])Enum.GetValues(typeof(OrderStatus));
            var result = new List<OrderStatusBreakdownDto>();

            foreach (var status in allStatuses)
            {
                var matchingOrders = orders.Where(o => o.Status == status).ToList();
                var count = matchingOrders.Count;
                var amount = matchingOrders.Sum(o => o.TotalAmount);
                var percentage = totalCount > 0
                    ? Math.Round((decimal)count / totalCount * 100m, 1)
                    : 0m;

                result.Add(new OrderStatusBreakdownDto
                {
                    Status = status.ToString(),
                    StatusName = GetOrderStatusName(status),
                    Count = count,
                    TotalAmount = amount,
                    Percentage = percentage
                });
            }

            return result;
        }

        public async Task<PagedList<OrderReportDetailDto>> GetDetailsAsync(OrderReportFilterRequest request, CancellationToken cancellationToken = default)
        {
            ValidateDateRange(request);

            var spec = new OrderReportFilterSpec(request);

            return await _orderRepository.GetPagedAsync(
                spec,
                request.PageNumber,
                request.PageSize,
                MapToDetailDto,
                cancellationToken
            );
        }

        public async Task<List<OrderReportDetailDto>> GetExportOrdersAsync(OrderReportFilterRequest request, CancellationToken cancellationToken = default)
        {
            ValidateDateRange(request);

            var spec = new OrderReportFilterSpec(request);
            var orders = await _orderRepository.ListAsync(spec, cancellationToken);

            return orders.Select(MapToDetailDto).ToList();
        }

        public async Task<(byte[] FileBytes, string FileName, int TotalRows)> ExportOrdersExcelAsync(OrderReportFilterRequest request, CancellationToken cancellationToken = default)
        {
            ValidateDateRange(request);

            var spec = new OrderReportFilterSpec(request);
            var orders = await _orderRepository.ListAsync(spec, cancellationToken);
            var orderDtos = orders.Select(MapToDetailDto).ToList();

            var successfulOrders = orders.Where(IsOrderSuccessful).ToList();
            var totalNet = successfulOrders.Sum(o => o.TotalAmount);
            var totalGross = orders.Sum(o => o.TotalAmount);
            var netGross = orders
                .Where(o => o.Status != OrderStatus.Cancelled && o.Status != OrderStatus.Returned)
                .Sum(o => o.TotalAmount);
            var totalDiscount = orders.Sum(o => o.DiscountAmount);
            var totalShipping = orders.Sum(o => o.ShippingFee);

            var exportData = new OrderReportExportData
            {
                Orders = orderDtos,
                Filters = request,
                TotalNetRevenue = totalNet,
                TotalGrossRevenue = totalGross,
                NetGrossRevenue = netGross,
                TotalDiscount = totalDiscount,
                TotalShippingFee = totalShipping
            };

            var fileBytes = _excelExportService.ExportOrderReportToExcel(exportData);

            var fromDateFile = request.FromDate.HasValue ? request.FromDate.Value.ToString("dd-MM-yyyy") : "Toan_Bo";
            var toDateFile = request.ToDate.HasValue ? request.ToDate.Value.ToString("dd-MM-yyyy") : DateTime.UtcNow.ToString("dd-MM-yyyy");
            var fileName = $"Bao_Cao_Don_Hang_Urban_Stitch_Tu_{fromDateFile}_Den_{toDateFile}.xlsx";

            var totalRows = orderDtos.Sum(o => o.Items.Count > 0 ? o.Items.Count : 1);
            return (fileBytes, fileName, totalRows);
        }

        public async Task<OrderReportAnalyticsDto> GetAnalyticsAsync(OrderReportFilterRequest request, CancellationToken cancellationToken = default)
        {
            ValidateDateRange(request);

            var toDate = request.ToDate ?? DateTimeOffset.UtcNow;
            var fromDate = request.FromDate ?? DateTimeOffset.UtcNow.AddDays(-30);

            var normalizedRequest = CloneRequestWithDates(request, fromDate, toDate);
            var orders = await _orderRepository.ListAsync(new OrderReportFilterSpec(normalizedRequest), cancellationToken);

            var totalOrdersCount = orders.Count;
            var successfulOrders = orders.Where(IsOrderSuccessful).ToList();
            var totalRevenue = successfulOrders.Sum(o => o.TotalAmount);

            var dailyTrends = new List<DailyOrderTrendDto>();
            var ordersByDate = orders
                .GroupBy(o => o.PlacedAt.ToLocalTime().ToString("yyyy-MM-dd"))
                .ToDictionary(g => g.Key, g => g.ToList());

            for (var d = fromDate.Date; d <= toDate.Date; d = d.AddDays(1))
            {
                var dateKey = d.ToString("yyyy-MM-dd");
                ordersByDate.TryGetValue(dateKey, out var dayOrders);
                dayOrders ??= new List<Order>();

                var daySuccessful = dayOrders.Where(IsOrderSuccessful).ToList();
                var dayCancelled = dayOrders.Where(o => o.Status == OrderStatus.Cancelled || o.Status == OrderStatus.Returned).ToList();
                var dayNet = daySuccessful.Sum(o => o.TotalAmount);
                var dayGross = dayOrders.Sum(o => o.TotalAmount);
                var dayTotalOrders = dayOrders.Count;
                var dayAov = daySuccessful.Count > 0 ? Math.Round(dayNet / daySuccessful.Count, 0) : 0m;

                dailyTrends.Add(new DailyOrderTrendDto
                {
                    Date = dateKey,
                    FormattedDate = d.ToString("dd/MM"),
                    NetRevenue = dayNet,
                    GrossRevenue = dayGross,
                    TotalOrders = dayTotalOrders,
                    SuccessfulOrders = daySuccessful.Count,
                    CancelledOrders = dayCancelled.Count,
                    AverageOrderValue = dayAov
                });
            }

            var paymentMethods = new List<PaymentMethodAnalyticsDto>();
            var validMethods = new[] { PaymentMethod.VNPAY, PaymentMethod.COD };

            foreach (var method in validMethods)
            {
                var methodOrders = orders.Where(o => o.PaymentMethod == method).ToList();
                var methodSuccessful = methodOrders.Where(IsOrderSuccessful).ToList();
                var methodNet = methodSuccessful.Sum(o => o.TotalAmount);
                var methodCount = methodOrders.Count;
                var revPercent = totalRevenue > 0
                    ? Math.Round(methodNet / totalRevenue * 100m, 1)
                    : 0m;
                var successRate = methodCount > 0
                    ? Math.Round((decimal)methodSuccessful.Count / methodCount * 100m, 1)
                    : 0m;
                var aov = methodSuccessful.Count > 0
                    ? Math.Round(methodNet / methodSuccessful.Count, 0)
                    : 0m;

                paymentMethods.Add(new PaymentMethodAnalyticsDto
                {
                    Method = method.ToString(),
                    MethodName = GetPaymentMethodName(method),
                    TotalOrders = methodCount,
                    SuccessfulOrders = methodSuccessful.Count,
                    TotalRevenue = methodNet,
                    RevenuePercentage = revPercent,
                    SuccessRate = successRate,
                    AverageOrderValue = aov
                });
            }

            var memberOrders = orders.Where(o => o.UserId.HasValue).ToList();
            var memberSuccessful = memberOrders.Where(IsOrderSuccessful).ToList();
            var memberRevenue = memberSuccessful.Sum(o => o.TotalAmount);
            var memberAov = memberSuccessful.Count > 0 ? Math.Round(memberRevenue / memberSuccessful.Count, 0) : 0m;
            var memberPercent = totalRevenue > 0 ? Math.Round(memberRevenue / totalRevenue * 100m, 1) : 0m;

            var guestOrders = orders.Where(o => !o.UserId.HasValue).ToList();
            var guestSuccessful = guestOrders.Where(IsOrderSuccessful).ToList();
            var guestRevenue = guestSuccessful.Sum(o => o.TotalAmount);
            var guestAov = guestSuccessful.Count > 0 ? Math.Round(guestRevenue / guestSuccessful.Count, 0) : 0m;
            var guestPercent = totalRevenue > 0 ? Math.Round(guestRevenue / totalRevenue * 100m, 1) : 0m;

            var customerSegments = new CustomerSegmentAnalyticsDto
            {
                MemberOrders = memberOrders.Count,
                MemberRevenue = memberRevenue,
                MemberAov = memberAov,
                MemberPercentage = memberPercent,
                GuestOrders = guestOrders.Count,
                GuestRevenue = guestRevenue,
                GuestAov = guestAov,
                GuestPercentage = guestPercent
            };

            var allStatuses = (OrderStatus[])Enum.GetValues(typeof(OrderStatus));
            var statusDistribution = new List<OrderStatusAnalyticsDto>();

            foreach (var status in allStatuses)
            {
                var matchingOrders = orders.Where(o => o.Status == status).ToList();
                var count = matchingOrders.Count;
                var amount = matchingOrders.Sum(o => o.TotalAmount);
                var percentage = totalOrdersCount > 0
                    ? Math.Round((decimal)count / totalOrdersCount * 100m, 1)
                    : 0m;

                statusDistribution.Add(new OrderStatusAnalyticsDto
                {
                    Status = status.ToString(),
                    StatusName = GetOrderStatusName(status),
                    Count = count,
                    TotalAmount = amount,
                    Percentage = percentage
                });
            }

            var allProducts = await _productRepository.ListAsync(cancellationToken);
            var allVariants = await _variantRepository.ListAsync(cancellationToken);
            var allCategories = await _categoryRepository.ListAsync(cancellationToken);

            var categoryDict = allCategories.ToDictionary(c => c.Id, c => c.Name);
            var variantDict = allVariants.ToDictionary(v => v.Id, v => v);
            var variantsByProd = allVariants.GroupBy(v => v.ProductId).ToDictionary(g => g.Key, g => g.ToList());

            var validOrders = orders.Where(IsOrderSuccessful).ToList();
            var allOrderItems = validOrders.SelectMany(o => o.Items).ToList();

            var salesByProduct = new Dictionary<int, (int UnitsSold, decimal Revenue)>();
            foreach (var item in allOrderItems)
            {
                int? prodId = null;
                if (item.ProductVariantId.HasValue && variantDict.TryGetValue(item.ProductVariantId.Value, out var v))
                {
                    prodId = v.ProductId;
                }
                else
                {
                    var matched = allProducts.FirstOrDefault(p => p.Name.Equals(item.ProductName, StringComparison.OrdinalIgnoreCase) || item.ProductName.StartsWith(p.Name, StringComparison.OrdinalIgnoreCase));
                    if (matched != null)
                    {
                        prodId = matched.Id;
                    }
                }

                if (prodId.HasValue)
                {
                    if (!salesByProduct.ContainsKey(prodId.Value))
                    {
                        salesByProduct[prodId.Value] = (0, 0m);
                    }
                    var cur = salesByProduct[prodId.Value];
                    salesByProduct[prodId.Value] = (cur.UnitsSold + item.Quantity, cur.Revenue + item.LineTotal);
                }
            }

            var topSellingProducts = salesByProduct
                .OrderByDescending(x => x.Value.UnitsSold)
                .ThenByDescending(x => x.Value.Revenue)
                .Take(10)
                .Select(x =>
                {
                    var prod = allProducts.FirstOrDefault(p => p.Id == x.Key);
                    var prodName = prod?.Name ?? $"Sản phẩm #{x.Key}";
                    var catName = (prod != null && categoryDict.TryGetValue(prod.CategoryId, out var cn)) ? cn : "Apple";
                    variantsByProd.TryGetValue(x.Key, out var pVariants);
                    var stock = pVariants?.Sum(v => v.QuantityInStock) ?? 0;

                    return new TopSellingProductDto
                    {
                        ProductId = x.Key,
                        ProductName = prodName,
                        CategoryName = catName,
                        UnitsSold = x.Value.UnitsSold,
                        TotalRevenue = x.Value.Revenue,
                        CurrentStock = stock
                    };
                })
                .ToList();

            var slowMovingProducts = allProducts
                .Where(p => !p.IsDeleted)
                .Select(p =>
                {
                    salesByProduct.TryGetValue(p.Id, out var sales);
                    variantsByProd.TryGetValue(p.Id, out var pVariants);
                    var stock = pVariants?.Sum(v => v.QuantityInStock) ?? 0;
                    var minPrice = pVariants?.Where(v => v.Price > 0).Select(v => v.Price).DefaultIfEmpty(0m).Min() ?? 0m;
                    categoryDict.TryGetValue(p.CategoryId, out var catName);

                    return new SlowMovingProductDto
                    {
                        ProductId = p.Id,
                        ProductName = p.Name,
                        CategoryName = catName ?? "Apple",
                        UnitsSold = sales.UnitsSold,
                        CurrentStock = stock,
                        Price = minPrice
                    };
                })
                .OrderBy(p => p.UnitsSold)
                .ThenByDescending(p => p.CurrentStock)
                .Take(10)
                .ToList();

            var safeCashflow = orders
                .Where(o => (o.Status == OrderStatus.Completed || o.Status == OrderStatus.Delivered) && o.PaymentStatus != PaymentStatus.Refunded)
                .Sum(o => o.TotalAmount);

            var operatingCashflow = orders
                .Where(o => o.Status == OrderStatus.Pending || o.Status == OrderStatus.Confirmed || o.Status == OrderStatus.Processing || o.Status == OrderStatus.Shipping)
                .Sum(o => o.TotalAmount);

            var lostCashflow = orders
                .Where(o => o.Status == OrderStatus.Cancelled || o.Status == OrderStatus.Returned || o.PaymentStatus == PaymentStatus.Refunded)
                .Sum(o => o.TotalAmount);

            var netGrossRevenue = orders
                .Where(o => o.Status != OrderStatus.Cancelled && o.Status != OrderStatus.Returned)
                .Sum(o => o.TotalAmount);

            var totalDailyNet = dailyTrends.Sum(d => d.NetRevenue);
            var totalDailyGross = dailyTrends.Sum(d => d.GrossRevenue);
            var totalDailyOrders = dailyTrends.Sum(d => d.TotalOrders);
            var totalDailySuccessful = dailyTrends.Sum(d => d.SuccessfulOrders);
            var periodSuccessRate = totalDailyOrders > 0
                ? Math.Round((decimal)totalDailySuccessful / totalDailyOrders * 100m, 1)
                : 0m;

            var vnpayMethod = paymentMethods.FirstOrDefault(p => p.Method == PaymentMethod.VNPAY.ToString());
            var codMethod = paymentMethods.FirstOrDefault(p => p.Method == PaymentMethod.COD.ToString());
            var vnpayRev = vnpayMethod?.TotalRevenue ?? 0m;
            var codRev = codMethod?.TotalRevenue ?? 0m;
            var totalPaymentRev = vnpayRev + codRev;
            var vnpayPercent = totalPaymentRev > 0
                ? Math.Round(vnpayRev / totalPaymentRev * 100m, 1)
                : 0m;
            var codPercent = totalPaymentRev > 0
                ? 100m - vnpayPercent
                : 0m;

            var totalCustOrders = memberOrders.Count + guestOrders.Count;
            var totalCustRev = memberRevenue + guestRevenue;
            var memberRatio = totalCustOrders > 0
                ? Math.Round((decimal)memberOrders.Count / totalCustOrders * 100m, 1)
                : 0m;
            var guestRatio = totalCustOrders > 0
                ? 100m - memberRatio
                : 0m;

            return new OrderReportAnalyticsDto
            {
                DailyTrends = dailyTrends,
                PaymentMethods = paymentMethods,
                CustomerSegments = customerSegments,
                StatusDistribution = statusDistribution,
                TopSellingProducts = topSellingProducts,
                SlowMovingProducts = slowMovingProducts,
                CashflowSummary = new CashflowSummaryDto
                {
                    SafeCashflow = safeCashflow,
                    OperatingCashflow = operatingCashflow,
                    LostCashflow = lostCashflow
                },
                PeriodMetrics = new PeriodMetricsDto
                {
                    TotalNetRevenue = totalDailyNet,
                    TotalGrossRevenue = totalDailyGross,
                    NetGrossRevenue = netGrossRevenue,
                    TotalOrders = totalDailyOrders,
                    SuccessfulOrders = totalDailySuccessful,
                    SuccessRate = periodSuccessRate,
                    TotalPaymentRevenue = totalPaymentRev,
                    VnpayPercentage = vnpayPercent,
                    CodPercentage = codPercent,
                    TotalCustomerOrders = totalCustOrders,
                    TotalCustomerRevenue = totalCustRev,
                    MemberOrdersRatio = memberRatio,
                    GuestOrdersRatio = guestRatio
                }
            };
        }

        public async Task<OrderTrendsReportDto> GetTrendsAsync(OrderReportFilterRequest request, CancellationToken cancellationToken = default)
        {
            var analytics = await GetAnalyticsAsync(request, cancellationToken);
            return new OrderTrendsReportDto
            {
                DailyTrends = analytics.DailyTrends,
                PeriodMetrics = analytics.PeriodMetrics
            };
        }

        public async Task<PaymentMethodsReportDto> GetPaymentsAsync(OrderReportFilterRequest request, CancellationToken cancellationToken = default)
        {
            var analytics = await GetAnalyticsAsync(request, cancellationToken);
            return new PaymentMethodsReportDto
            {
                PaymentMethods = analytics.PaymentMethods,
                TotalPaymentRevenue = analytics.PeriodMetrics.TotalPaymentRevenue,
                VnpayPercentage = analytics.PeriodMetrics.VnpayPercentage,
                CodPercentage = analytics.PeriodMetrics.CodPercentage
            };
        }

        public async Task<CustomerSegmentsReportDto> GetCustomersAsync(OrderReportFilterRequest request, CancellationToken cancellationToken = default)
        {
            var analytics = await GetAnalyticsAsync(request, cancellationToken);
            return new CustomerSegmentsReportDto
            {
                CustomerSegments = analytics.CustomerSegments,
                TotalCustomerOrders = analytics.PeriodMetrics.TotalCustomerOrders,
                TotalCustomerRevenue = analytics.PeriodMetrics.TotalCustomerRevenue,
                MemberOrdersRatio = analytics.PeriodMetrics.MemberOrdersRatio,
                GuestOrdersRatio = analytics.PeriodMetrics.GuestOrdersRatio
            };
        }

        public async Task<CashflowReportDto> GetCashflowAsync(OrderReportFilterRequest request, CancellationToken cancellationToken = default)
        {
            var analytics = await GetAnalyticsAsync(request, cancellationToken);
            return new CashflowReportDto
            {
                CashflowSummary = analytics.CashflowSummary,
                StatusDistribution = analytics.StatusDistribution
            };
        }

        public async Task<ProductPerformanceReportDto> GetProductsAsync(OrderReportFilterRequest request, CancellationToken cancellationToken = default)
        {
            var analytics = await GetAnalyticsAsync(request, cancellationToken);
            return new ProductPerformanceReportDto
            {
                TopSellingProducts = analytics.TopSellingProducts,
                SlowMovingProducts = analytics.SlowMovingProducts
            };
        }

        private static void ValidateDateRange(OrderReportFilterRequest request)
        {
            if (request.FromDate.HasValue && request.ToDate.HasValue)
            {
                if (request.FromDate.Value > request.ToDate.Value)
                {
                    throw new BusinessRuleException("Thời gian bắt đầu không được lớn hơn thời gian kết thúc.");
                }

                if ((request.ToDate.Value - request.FromDate.Value).TotalDays > 365)
                {
                    throw new BusinessRuleException("Khoảng thời gian báo cáo không được vượt quá 365 ngày.");
                }
            }
        }

        private static OrderReportFilterRequest CloneRequestWithDates(OrderReportFilterRequest original, DateTimeOffset fromDate, DateTimeOffset toDate)
        {
            return new OrderReportFilterRequest
            {
                FromDate = fromDate,
                ToDate = toDate,
                DateCriteria = original.DateCriteria,
                Status = original.Status,
                PaymentStatus = original.PaymentStatus,
                PaymentMethod = original.PaymentMethod,
                Search = original.Search,
                PageNumber = 1,
                PageSize = 100000
            };
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

        private static int GetDistinctCustomerCount(IEnumerable<Order> orders)
        {
            var identifiers = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            foreach (var order in orders)
            {
                if (order.UserId.HasValue)
                {
                    identifiers.Add($"U_{order.UserId.Value}");
                }
                else if (!string.IsNullOrWhiteSpace(order.RecipientPhone))
                {
                    identifiers.Add($"P_{order.RecipientPhone.Trim()}");
                }
                else if (!string.IsNullOrWhiteSpace(order.GuestId))
                {
                    identifiers.Add($"G_{order.GuestId.Trim()}");
                }
                else
                {
                    identifiers.Add($"N_{order.RecipientName.Trim()}");
                }
            }
            return identifiers.Count;
        }

        private static OrderReportDetailDto MapToDetailDto(Order order)
        {
            return new OrderReportDetailDto
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber,
                UserId = order.UserId,
                GuestId = order.GuestId,
                RecipientName = order.RecipientName,
                RecipientPhone = order.RecipientPhone,
                RecipientEmail = order.RecipientEmail,
                CustomerType = order.UserId.HasValue ? "Thành viên" : "Khách vãng lai",
                ShippingProvince = order.ShippingProvince,
                ShippingAddressLine = order.ShippingAddressLine,
                Status = order.Status.ToString(),
                StatusName = GetOrderStatusName(order.Status),
                PaymentStatus = order.PaymentStatus.ToString(),
                PaymentStatusName = GetPaymentStatusName(order.PaymentStatus),
                PaymentMethod = order.PaymentMethod.ToString(),
                PaymentMethodName = GetPaymentMethodName(order.PaymentMethod),
                TotalItems = order.Items.Sum(i => i.Quantity),
                Subtotal = order.Subtotal,
                DiscountAmount = order.DiscountAmount,
                VoucherCode = order.VoucherCode,
                ShippingFee = order.ShippingFee,
                VatAmount = 0m,
                TotalAmount = order.TotalAmount,
                PlacedAt = order.PlacedAt,
                CompletedAt = order.LastModifiedOn,
                Items = order.Items.Select(i => new OrderReportItemDto
                {
                    Id = i.Id,
                    ProductName = i.ProductName,
                    Sku = i.SKU,
                    VariantName = i.VariantName,
                    ColorName = i.ColorName,
                    StorageName = i.StorageName,
                    UnitPrice = i.UnitPrice,
                    Quantity = i.Quantity,
                    LineTotal = i.LineTotal,
                    ThumbnailUrl = i.ThumbnailUrl
                }).ToList()
            };
        }

        private static string GetOrderStatusName(OrderStatus status)
        {
            return status switch
            {
                OrderStatus.Pending => "Chờ xử lý",
                OrderStatus.Confirmed => "Đã xác nhận",
                OrderStatus.Processing => "Đang xử lý",
                OrderStatus.Shipping => "Đang giao hàng",
                OrderStatus.Delivered => "Đã giao hàng",
                OrderStatus.Completed => "Hoàn tất",
                OrderStatus.Cancelled => "Đã hủy",
                OrderStatus.Returned => "Trả hàng / Hoàn tiền",
                _ => status.ToString()
            };
        }

        private static string GetPaymentStatusName(PaymentStatus status)
        {
            return status switch
            {
                PaymentStatus.Pending => "Chờ thanh toán",
                PaymentStatus.Paid => "Đã thanh toán",
                PaymentStatus.Failed => "Thất bại",
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

