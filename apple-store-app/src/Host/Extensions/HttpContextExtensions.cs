using System.Diagnostics;
using Application.Wrappers;

namespace Host.Extensions
{
    public static class HttpContextExtensions
    {
        public static Meta BuildMeta(this HttpContext context, int statusCode)
        {
            return new Meta
            {
                Timestamp = DateTime.UtcNow,
                Path = context.Request.Path.Value ?? string.Empty,
                Method = context.Request.Method,
                StatusCode = statusCode,
                TraceId = Activity.Current?.Id ?? context.TraceIdentifier,
                RequestId = context.TraceIdentifier,
                ClientIp = context.Connection.RemoteIpAddress?.ToString()
            };
        }
    }
}
