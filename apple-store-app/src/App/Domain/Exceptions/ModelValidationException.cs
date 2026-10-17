namespace Domain.Exceptions
{
    public class ModelValidationException : ApplicationExceptionBase
    {
        public IDictionary<string, string[]> Errors { get; }

        public ModelValidationException() : base("One or more validation failures have occurred.")
        {
            Errors = new Dictionary<string, string[]>();
        }

        public ModelValidationException(IDictionary<string, string[]> errors) : this()
        {
            Errors = errors;
        }
    }
}
