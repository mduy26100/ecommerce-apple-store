namespace Application.Common.Helpers
{
    public static class SequenceNormalizer
    {
        /// <summary>
        /// Chuẩn hoá thứ tự DisplayOrder cho danh sách đối tượng (int) chạy tuần tự từ startFrom (mặc định: 1, 2, 3...).
        /// </summary>
        public static void Normalize<T>(
            IEnumerable<T>? items,
            Func<T, int> getOrder,
            Action<T, int> setOrder,
            Func<T, object>? secondaryOrder = null,
            int startFrom = 1)
        {
            if (items == null) return;

            var list = items.ToList();
            if (list.Count == 0) return;

            IOrderedEnumerable<T> query = list.OrderBy(getOrder);

            if (secondaryOrder != null)
            {
                query = query.ThenBy(secondaryOrder);
            }

            int currentOrder = startFrom;
            foreach (var item in query)
            {
                setOrder(item, currentOrder++);
            }
        }

        /// <summary>
        /// Chuẩn hoá thứ tự DisplayOrder cho danh sách đối tượng (int?).
        /// Các phần tử có order null hoặc không xác định sẽ được đẩy về cuối danh sách.
        /// </summary>
        public static void Normalize<T>(
            IEnumerable<T>? items,
            Func<T, int?> getOrder,
            Action<T, int> setOrder,
            Func<T, object>? secondaryOrder = null,
            int startFrom = 1)
        {
            if (items == null) return;

            var list = items.ToList();
            if (list.Count == 0) return;

            IOrderedEnumerable<T> query = list
                .OrderBy(x => getOrder(x).HasValue ? 0 : 1)
                .ThenBy(x => getOrder(x) ?? int.MaxValue);

            if (secondaryOrder != null)
            {
                query = query.ThenBy(secondaryOrder);
            }

            int currentOrder = startFrom;
            foreach (var item in query)
            {
                setOrder(item, currentOrder++);
            }
        }

        /// <summary>
        /// Chuẩn hoá một mảng số nguyên bất kỳ thành một mảng số phẳng chạy tuần tự từ startFrom (mặc định: 1, 2, 3...).
        /// </summary>
        public static List<int> Normalize(IEnumerable<int>? numbers, int startFrom = 1)
        {
            if (numbers == null) return new List<int>();

            int count = numbers.Count();
            return Enumerable.Range(startFrom, count).ToList();
        }

        /// <summary>
        /// Thay đổi vị trí một phần tử đến thứ tự mới (newOrder) và tự động chuẩn hoá lại toàn bộ danh sách chạy liên tục từ startFrom.
        /// </summary>
        public static void Reorder<T>(
            IEnumerable<T>? items,
            T targetItem,
            int newOrder,
            Func<T, int> getOrder,
            Action<T, int> setOrder,
            int startFrom = 1)
        {
            if (items == null || targetItem == null) return;

            var list = items.ToList();
            if (!list.Contains(targetItem)) return;

            setOrder(targetItem, newOrder);

            var ordered = list
                .OrderBy(getOrder)
                .ThenBy(x => EqualityComparer<T>.Default.Equals(x, targetItem) ? 0 : 1);

            int currentOrder = startFrom;
            foreach (var item in ordered)
            {
                setOrder(item, currentOrder++);
            }
        }
    }
}