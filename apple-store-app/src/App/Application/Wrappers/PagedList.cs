namespace Application.Wrappers
{
    public class PageInfo
    {
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPages => PageSize > 0 ? (int)Math.Ceiling(TotalCount / (double)PageSize) : 0;
        public bool HasPreviousPage => PageNumber > 1;
        public bool HasNextPage => PageNumber < TotalPages;
    }

    public class PagedList<T> : IPagedList
    {
        public IReadOnlyList<T> Items { get; set; }
        public PageInfo PageInfo { get; set; }

        object? IPagedList.PageInfo => PageInfo;
        object? IPagedList.Items => Items;

        public PagedList(IReadOnlyList<T> items, int totalCount, int pageNumber, int pageSize)
        {
            Items = items ?? Array.Empty<T>();
            PageInfo = new PageInfo
            {
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }
    }
}
