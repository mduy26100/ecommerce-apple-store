using Application.Common.Interfaces.Storage;

namespace Application.Common.Services.Storage
{
    public class UploadImageService : IUploadImageService
    {
        private readonly ICloudinaryService _cloudinaryService;

        public UploadImageService(ICloudinaryService cloudinaryService)
        {
            _cloudinaryService = cloudinaryService;
        }

        public async Task<string> UploadAndReplaceImageAsync(
            Stream imageStream,
            string fileName,
            string? contentType,
            string storageFolder,
            string? oldImageUrl,
            Func<string, Task> updateDatabaseCallback,
            CancellationToken cancellationToken = default)
        {
            string uploadedImageUrl;
            using (var stream = imageStream)
            {
                uploadedImageUrl = await _cloudinaryService.UploadFileAsync(
                    storageFolder,
                    fileName,
                    stream,
                    contentType ?? "application/octet-stream",
                    cancellationToken);
            }

            try
            {
                await updateDatabaseCallback(uploadedImageUrl);

                if (!string.IsNullOrWhiteSpace(oldImageUrl))
                {
                    try
                    {
                        await _cloudinaryService.DeleteFileAsync(oldImageUrl, cancellationToken);
                    }
                    catch
                    {
                    }
                }

                return uploadedImageUrl;
            }
            catch
            {
                if (!string.IsNullOrWhiteSpace(uploadedImageUrl))
                {
                    try
                    {
                        await _cloudinaryService.DeleteFileAsync(uploadedImageUrl, cancellationToken);
                    }
                    catch
                    {
                    }
                }

                throw;
            }
        }

        public async Task DeleteImageAsync(
            string? currentImageUrl,
            Func<Task> removeFromDatabaseCallback,
            CancellationToken cancellationToken = default)
        {
            await removeFromDatabaseCallback();

            if (!string.IsNullOrWhiteSpace(currentImageUrl))
            {
                try
                {
                    await _cloudinaryService.DeleteFileAsync(currentImageUrl, cancellationToken);
                }
                catch
                {
                }
            }
        }
    }
}
