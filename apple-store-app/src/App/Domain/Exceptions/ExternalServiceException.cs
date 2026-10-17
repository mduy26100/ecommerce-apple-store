namespace Domain.Exceptions
{
    public sealed class ExternalServiceException : ApplicationExceptionBase
    {
        public ExternalServiceException(string message) : base(message) { }

        public ExternalServiceException(string message, Exception innerException) : base(message, innerException) { }
    }
}
