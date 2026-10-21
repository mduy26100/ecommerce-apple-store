namespace Application.Common.Interfaces.Storage
{
    public interface IUploadImageService
    {
        Task<string> UploadAndReplaceImageAsync(
            Stream imageStream,
            string fileName,
            string? contentType,
            string storageFolder,
            string? oldImageUrl,
            Func<string, Task> updateDatabaseCallback,
            CancellationToken cancellationToken = default);

        Task DeleteImageAsync(
            string? currentImageUrl,
            Func<Task> removeFromDatabaseCallback,
            CancellationToken cancellationToken = default);
    }
}
