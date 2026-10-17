namespace Application.Wrappers
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
    public class DisableWrapperAttribute : Attribute
    {
    }
}
