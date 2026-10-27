using Application.Common.Interfaces.Persistence;
using Application.Common.Services.Payments;
using Application.Features.Sales.Orders.Helpers;
using Application.Features.Sales.Orders.Specifications;
using Domain.Entities.Sales;
using Domain.Enums.Sales;

namespace Infrastructure.Payments
{
    public class VnPayService : IVnPayService
    {
        private readonly VnPaySettings _settings;
        private readonly IRepository<Order> _orderRepository;

        public VnPayService(
            IOptions<VnPaySettings> settings,
            IRepository<Order> orderRepository)
        {
            _settings = settings.Value;
            _orderRepository = orderRepository;
        }

        public string CreatePaymentUrl(VnPayCreatePaymentRequest request)
        {
            var vietnamNow = DateTime.UtcNow.AddHours(7);
            var vnp_Params = new SortedList<string, string>(new VnPayCompare())
            {
                { "vnp_Version", "2.1.0" },
                { "vnp_Command", "pay" },
                { "vnp_TmnCode", _settings.TmnCode },
                { "vnp_Amount", ((long)(request.Amount * 100)).ToString() },
                { "vnp_CreateDate", vietnamNow.ToString("yyyyMMddHHmmss") },
                { "vnp_CurrCode", "VND" },
                { "vnp_IpAddr", GetSafeIp(request.ClientIpAddress) },
                { "vnp_Locale", "vn" },
                { "vnp_OrderInfo", !string.IsNullOrWhiteSpace(request.OrderInfo) ? request.OrderInfo : $"Thanh toan don hang {request.OrderNumber}" },
                { "vnp_OrderType", "other" },
                { "vnp_ReturnUrl", _settings.ReturnUrl },
                { "vnp_TxnRef", request.OrderNumber },
                { "vnp_ExpireDate", vietnamNow.AddMinutes(15).ToString("yyyyMMddHHmmss") }
            };

            var dataToSign = new StringBuilder();
            var query = new StringBuilder();

            foreach (var kvp in vnp_Params)
            {
                if (!string.IsNullOrEmpty(kvp.Value))
                {
                    if (dataToSign.Length > 0)
                    {
                        dataToSign.Append('&');
                        query.Append('&');
                    }

                    dataToSign.Append(WebUtility.UrlEncode(kvp.Key));
                    dataToSign.Append('=');
                    dataToSign.Append(WebUtility.UrlEncode(kvp.Value));

                    query.Append(WebUtility.UrlEncode(kvp.Key));
                    query.Append('=');
                    query.Append(WebUtility.UrlEncode(kvp.Value));
                }
            }

            var secureHash = HmacSha512(_settings.HashSecret, dataToSign.ToString());
            query.Append("&vnp_SecureHash=");
            query.Append(secureHash);

            return $"{_settings.PaymentUrl}?{query}";
        }

        public VnPayCallbackResult ProcessReturn(IDictionary<string, string> queryParameters)
        {
            var isValidSignature = ValidateSignature(queryParameters, out var orderNumber, out var amount, out var responseCode, out var transactionNo, out var bankCode);
            var isSuccess = isValidSignature && responseCode == "00";

            return new VnPayCallbackResult
            {
                IsValidSignature = isValidSignature,
                IsSuccess = isSuccess,
                OrderNumber = orderNumber ?? string.Empty,
                TransactionNo = transactionNo,
                BankCode = bankCode,
                Amount = amount,
                ResponseCode = responseCode,
                Message = isSuccess ? "Giao dịch thanh toán thành công." : "Giao dịch thanh toán không thành công hoặc chữ ký không hợp lệ."
            };
        }

        public async Task<VnPayIpnResponse> ProcessIpnAsync(IDictionary<string, string> queryParameters, CancellationToken cancellationToken = default)
        {
            var isValidSignature = ValidateSignature(queryParameters, out var orderNumber, out var amount, out var responseCode, out var transactionNo, out var _);

            if (!isValidSignature)
            {
                return VnPayIpnResponse.InvalidSignature();
            }

            if (string.IsNullOrWhiteSpace(orderNumber))
            {
                return VnPayIpnResponse.OrderNotFound();
            }

            var order = await _orderRepository.FirstOrDefaultAsync(new OrderByOrderNumberSpec(orderNumber), cancellationToken);
            if (order == null)
            {
                return VnPayIpnResponse.OrderNotFound();
            }

            var expectedAmount = (long)(order.TotalAmount * 100);
            var actualAmount = (long)(amount * 100);
            if (expectedAmount != actualAmount)
            {
                return VnPayIpnResponse.InvalidAmount();
            }

            if (order.PaymentStatus == PaymentStatus.Paid)
            {
                return VnPayIpnResponse.OrderAlreadyConfirmed();
            }

            if (responseCode == "00")
            {
                order.PaymentStatus = PaymentStatus.Paid;
                order.StatusHistoryJson = OrderStatusHistoryHelper.AppendHistory(
                    order.StatusHistoryJson,
                    order.Status,
                    "VNPAY",
                    "Cổng VNPAY",
                    $"Thanh toán trực tuyến thành công qua VNPAY. Mã GD: {transactionNo}");

                await _orderRepository.UpdateAsync(order, cancellationToken);
                return VnPayIpnResponse.Success();
            }

            order.PaymentStatus = PaymentStatus.Failed;
            order.StatusHistoryJson = OrderStatusHistoryHelper.AppendHistory(
                order.StatusHistoryJson,
                order.Status,
                "VNPAY",
                "Cổng VNPAY",
                $"Thanh toán trực tuyến thất bại. Mã phản hồi: {responseCode}");

            await _orderRepository.UpdateAsync(order, cancellationToken);
            return VnPayIpnResponse.Success();
        }

        public string GetFrontendReturnUrl(IDictionary<string, string> queryParameters)
        {
            var baseUrl = !string.IsNullOrWhiteSpace(_settings.FrontendReturnUrl)
                ? _settings.FrontendReturnUrl
                : "http://localhost:3088/payment/vnpay-return";

            var queryString = new StringBuilder();
            foreach (var kvp in queryParameters)
            {
                if (queryString.Length > 0)
                {
                    queryString.Append('&');
                }
                queryString.Append(WebUtility.UrlEncode(kvp.Key));
                queryString.Append('=');
                queryString.Append(WebUtility.UrlEncode(kvp.Value));
            }

            var separator = baseUrl.Contains('?') ? "&" : "?";
            return $"{baseUrl}{separator}{queryString}";
        }

        private bool ValidateSignature(
            IDictionary<string, string> queryParameters,
            out string? orderNumber,
            out decimal amount,
            out string? responseCode,
            out string? transactionNo,
            out string? bankCode)
        {
            orderNumber = null;
            amount = 0;
            responseCode = null;
            transactionNo = null;
            bankCode = null;

            var receivedHash = string.Empty;
            var sortedParams = new SortedList<string, string>(new VnPayCompare());

            foreach (var kvp in queryParameters)
            {
                if (string.IsNullOrWhiteSpace(kvp.Key) || !kvp.Key.StartsWith("vnp_"))
                {
                    continue;
                }

                if (string.Equals(kvp.Key, "vnp_SecureHash", StringComparison.OrdinalIgnoreCase))
                {
                    receivedHash = kvp.Value;
                    continue;
                }

                if (string.Equals(kvp.Key, "vnp_SecureHashType", StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                if (!string.IsNullOrEmpty(kvp.Value))
                {
                    sortedParams.Add(kvp.Key, kvp.Value);
                }
            }

            if (sortedParams.TryGetValue("vnp_TxnRef", out var txnRefVal))
            {
                orderNumber = txnRefVal;
            }

            if (sortedParams.TryGetValue("vnp_Amount", out var amountVal) && long.TryParse(amountVal, out var rawAmount))
            {
                amount = (decimal)rawAmount / 100m;
            }

            if (sortedParams.TryGetValue("vnp_ResponseCode", out var codeVal))
            {
                responseCode = codeVal;
            }

            if (sortedParams.TryGetValue("vnp_TransactionNo", out var transNoVal))
            {
                transactionNo = transNoVal;
            }

            if (sortedParams.TryGetValue("vnp_BankCode", out var bankVal))
            {
                bankCode = bankVal;
            }

            if (string.IsNullOrEmpty(receivedHash))
            {
                return false;
            }

            var hashData = new StringBuilder();
            foreach (var kvp in sortedParams)
            {
                if (hashData.Length > 0)
                {
                    hashData.Append('&');
                }

                hashData.Append(WebUtility.UrlEncode(kvp.Key));
                hashData.Append('=');
                hashData.Append(WebUtility.UrlEncode(kvp.Value));
            }

            var calculatedHash = HmacSha512(_settings.HashSecret, hashData.ToString());
            return string.Equals(calculatedHash, receivedHash, StringComparison.OrdinalIgnoreCase);
        }

        private static string GetSafeIp(string? ip)
        {
            if (string.IsNullOrWhiteSpace(ip) || ip == "::1")
            {
                return "127.0.0.1";
            }
            return ip.Trim();
        }

        private static string HmacSha512(string key, string inputData)
        {
            var keyBytes = Encoding.UTF8.GetBytes(key);
            var inputBytes = Encoding.UTF8.GetBytes(inputData);

            using var hmac = new HMACSHA512(keyBytes);
            var hashValue = hmac.ComputeHash(inputBytes);

            return Convert.ToHexString(hashValue).ToLowerInvariant();
        }

        private sealed class VnPayCompare : IComparer<string>
        {
            public int Compare(string? x, string? y)
            {
                if (x == y) return 0;
                if (x == null) return -1;
                if (y == null) return 1;
                var Compare = CompareInfo.GetCompareInfo("en-US");
                return Compare.Compare(x, y, CompareOptions.Ordinal);
            }
        }
    }
}
