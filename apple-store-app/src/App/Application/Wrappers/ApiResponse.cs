namespace Application.Wrappers
{
    public class ApiResponse
    {
        public object? Data { get; set; }
        public Meta? Meta { get; set; } = new Meta();
        public ApiError? Error { get; set; }

        public static ApiResponse Success(object? data, Meta? meta = null)
            => new ApiResponse
            {
                Data = data,
                Meta = meta ?? new Meta(),
                Error = null
            };

        public static ApiResponse Fail(ApiError error)
            => new ApiResponse
            {
                Data = null,
                Meta = new Meta(),
                Error = error,
            };
    }

    public class ApiError
    {
        public string? Type { get; set; }
        public string? Message { get; set; }
        public object? Details { get; set; }
    }

    public class Meta
    {
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string Path { get; set; } = default!;
        public string Method { get; set; } = default!;
        public int StatusCode { get; set; }
        public string TraceId { get; set; } = default!;
        public string? RequestId { get; set; }
        public string? ClientIp { get; set; }
        public object? CursorPagedResult { get; set; }
    }
}
