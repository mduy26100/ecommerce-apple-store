using Application.Wrappers;
using Domain.Exceptions;
using Host.Constants;
using Host.Extensions;

namespace Host.Middlewares
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;
        private readonly IWebHostEnvironment _env;
        private readonly JsonSerializerOptions _jsonSerializerOptions;

        public ExceptionHandlingMiddleware(
            RequestDelegate next,
            ILogger<ExceptionHandlingMiddleware> logger,
            IWebHostEnvironment env,
            IOptions<JsonOptions>? jsonOptions = null)
        {
            _next = next;
            _logger = logger;
            _env = env;
            _jsonSerializerOptions = jsonOptions?.Value?.JsonSerializerOptions
                ?? new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                var (statusCode, type, message, details) = MapException(ex);
                var logLevel = GetLogLevel(ex);

                if (logLevel == LogLevel.Warning)
                {
                    _logger.LogWarning("{Type}: {Message}", type, message);
                }
                else
                {
                    _logger.LogError(ex, "An unhandled exception occurred: {Message}", ex.Message);
                }

                // Populate HttpContext.Items so that Serilog/logging can retrieve error context
                context.Items[LoggingConstants.ErrorTypeKey] = type;
                context.Items[LoggingConstants.ErrorMessageKey] = message;
                context.Items[LoggingConstants.ErrorDetailsKey] = details;

                await HandleExceptionAsync(context, statusCode, type, message, details);
            }
        }

        private (int StatusCode, string Type, string Message, object? Details) MapException(Exception exception)
        {
            return exception switch
            {
                ModelValidationException valEx => (
                    StatusCodes.Status400BadRequest,
                    "ValidationError",
                    valEx.Message,
                    (object?)valEx.Errors
                ),
                BusinessRuleException ex => (StatusCodes.Status400BadRequest, ex.GetType().Name, ex.Message, null),
                NotFoundException ex => (StatusCodes.Status404NotFound, ex.GetType().Name, ex.Message, null),
                ForbiddenException ex => (StatusCodes.Status403Forbidden, ex.GetType().Name, ex.Message, null),
                UnauthorizedException ex => (StatusCodes.Status401Unauthorized, ex.GetType().Name, ex.Message, null),
                ConflictException ex => (StatusCodes.Status409Conflict, ex.GetType().Name, ex.Message, null),
                ConcurrencyException ex => (StatusCodes.Status409Conflict, ex.GetType().Name, ex.Message, null),
                PaymentRequiredException ex => (StatusCodes.Status402PaymentRequired, ex.GetType().Name, ex.Message, null),
                TooManyRequestsException ex => (StatusCodes.Status429TooManyRequests, ex.GetType().Name, ex.Message, null),
                ExternalServiceException ex => (StatusCodes.Status502BadGateway, ex.GetType().Name, ex.Message, null),

                // Fallback default for unhandled framework crashes
                _ => (
                    StatusCodes.Status500InternalServerError,
                    "InternalServerError",
                    "An unexpected error occurred. Please contact support.",
                    _env.IsDevelopment() ? exception.StackTrace : null
                )
            };
        }

        private LogLevel GetLogLevel(Exception exception)
        {
            return exception switch
            {
                ModelValidationException or
                BusinessRuleException or
                NotFoundException or
                ForbiddenException or
                UnauthorizedException or
                ConflictException or
                ConcurrencyException or
                PaymentRequiredException or
                TooManyRequestsException => LogLevel.Warning,

                _ => LogLevel.Error
            };
        }

        private async Task HandleExceptionAsync(HttpContext context, int statusCode, string type, string message, object? details)
        {
            var apiError = new ApiError
            {
                Type = type,
                Message = message,
                Details = details
            };

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = statusCode;

            var meta = context.BuildMeta(statusCode);
            var apiResponse = ApiResponse.Fail(apiError);
            apiResponse.Meta = meta;

            var json = JsonSerializer.Serialize(apiResponse, _jsonSerializerOptions);
            await context.Response.WriteAsync(json);
        }
    }
}
