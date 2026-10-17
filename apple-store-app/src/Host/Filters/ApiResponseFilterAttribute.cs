using Application.Wrappers;
using Host.Constants;
using Host.Extensions;

namespace Host.Filters
{
    public class ApiResponseFilterAttribute : IAsyncResultFilter
    {
        public async Task OnResultExecutionAsync(ResultExecutingContext context, ResultExecutionDelegate next)
        {
            // 1. Bypass if Action or Controller has [DisableWrapper] attribute (e.g. file exports, metric scrapers)
            if (context.ActionDescriptor.EndpointMetadata.Any(em => em is DisableWrapperAttribute))
            {
                await next();
                return;
            }

            // 2. Only auto-wrap for ObjectResult (Ok, Created, BadRequest, Problem, etc.)
            // Bypass FileResult, EmptyResult, etc. to avoid breaking file downloads or empty responses
            if (context.Result is not ObjectResult objectResult)
            {
                await next();
                return;
            }

            var statusCode = objectResult.StatusCode ?? context.HttpContext.Response.StatusCode;
            var meta = context.HttpContext.BuildMeta(statusCode);

            if (statusCode >= 400)
            {
                var apiError = BuildApiError(statusCode, objectResult.Value);

                // Populate HttpContext.Items for Serilog/logging request enrichment
                context.HttpContext.Items[LoggingConstants.ErrorTypeKey] = apiError.Type;
                context.HttpContext.Items[LoggingConstants.ErrorMessageKey] = apiError.Message;
                context.HttpContext.Items[LoggingConstants.ErrorDetailsKey] = apiError.Details;

                var wrappedResponse = ApiResponse.Fail(apiError);
                wrappedResponse.Meta = meta;

                objectResult.Value = wrappedResponse;
                objectResult.DeclaredType = typeof(ApiResponse);
            }
            else
            {
                // If the developer already returned ApiResponse, just update Meta
                if (objectResult.Value is ApiResponse existingResponse)
                {
                    if (existingResponse.Data is IPagedList pagedList)
                    {
                        meta.CursorPagedResult = pagedList.PageInfo;
                        existingResponse.Data = pagedList.Items;
                    }
                    existingResponse.Meta = meta;
                }
                else
                {
                    if (objectResult.Value is IPagedList pagedList)
                    {
                        meta.CursorPagedResult = pagedList.PageInfo;
                        var wrappedResponse = ApiResponse.Success(pagedList.Items, meta);
                        objectResult.Value = wrappedResponse;
                        objectResult.DeclaredType = typeof(ApiResponse);
                    }
                    else
                    {
                        var wrappedResponse = ApiResponse.Success(objectResult.Value, meta);
                        objectResult.Value = wrappedResponse;
                        objectResult.DeclaredType = typeof(ApiResponse);
                    }
                }
            }

            await next();
        }

        // Resolves the internal API error response mapping using status codes and payload contents
        private ApiError BuildApiError(int statusCode, object? value)
        {
            var type = GetErrorType(statusCode);
            var message = GetDefaultMessage(statusCode);
            object? details = null;

            if (value is string str)
            {
                message = str;
            }
            else if (value is ValidationProblemDetails validationProblemDetails)
            {
                type = "ValidationError";
                message = validationProblemDetails.Title ?? "One or more validation failures have occurred.";
                details = validationProblemDetails.Errors;
            }
            else if (value is ProblemDetails problemDetails)
            {
                type = problemDetails.Type ?? type;
                message = problemDetails.Title ?? message;
                details = problemDetails.Detail;
            }
            else if (value != null)
            {
                var valType = value.GetType();
                var errorsProp = valType.GetProperty("Errors") ?? valType.GetProperty("errors");
                var messageProp = valType.GetProperty("Message") ?? valType.GetProperty("message");

                if (messageProp != null)
                {
                    message = messageProp.GetValue(value)?.ToString() ?? message;
                }

                if (errorsProp != null)
                {
                    details = errorsProp.GetValue(value);
                }
                else
                {
                    details = value;
                }
            }

            return new ApiError
            {
                Type = type,
                Message = message,
                Details = details
            };
        }

        private string GetErrorType(int statusCode)
        {
            return statusCode switch
            {
                400 => "BadRequest",
                401 => "Unauthorized",
                402 => "PaymentRequired",
                403 => "Forbidden",
                404 => "NotFound",
                409 => "Conflict",
                422 => "UnprocessableEntity",
                429 => "TooManyRequests",
                500 => "InternalServerError",
                502 => "BadGateway",
                _ => "Error"
            };
        }

        private string GetDefaultMessage(int statusCode)
        {
            return statusCode switch
            {
                400 => "Bad Request",
                401 => "Unauthorized",
                402 => "Payment Required",
                403 => "Forbidden",
                404 => "Not Found",
                409 => "Conflict",
                422 => "Unprocessable Entity",
                429 => "Too Many Requests",
                500 => "Internal Server Error",
                502 => "Bad Gateway",
                _ => "An error occurred"
            };
        }
    }
}
