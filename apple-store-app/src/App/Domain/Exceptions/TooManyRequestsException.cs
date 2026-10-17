namespace Domain.Exceptions
{
    public sealed class TooManyRequestsException : ApplicationExceptionBase
    {
        public TooManyRequestsException(string message) : base(message) { }

        public TooManyRequestsException(string message, Exception innerException) : base(message, innerException) { }
    }
}
