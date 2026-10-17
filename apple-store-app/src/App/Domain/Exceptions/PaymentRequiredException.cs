namespace Domain.Exceptions
{
    public sealed class PaymentRequiredException : ApplicationExceptionBase
    {
        public PaymentRequiredException(string message) : base(message) { }

        public PaymentRequiredException(string message, Exception innerException) : base(message, innerException) { }
    }
}
