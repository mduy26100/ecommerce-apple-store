namespace Application.Wrappers
{
    public interface IPagedList
    {
        object? PageInfo { get; }
        object? Items { get; }
    }
}
