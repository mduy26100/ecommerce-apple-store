namespace Application.Common.Interfaces.Storage
{
    public interface ICloudinaryService
    {
        Task<string> UploadFileAsync(
            string folder,
            string fileName,
            Stream fileStream,
            string contentType,
            CancellationToken cancellationToken = default);

        Task DeleteFileAsync(string fileUrl, CancellationToken cancellationToken = default);

        Task<Stream> GetFileStreamAsync(string fileUrl, CancellationToken cancellationToken = default);
    }
}
