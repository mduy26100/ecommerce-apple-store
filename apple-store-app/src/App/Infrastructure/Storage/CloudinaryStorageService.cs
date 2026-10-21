using Application.Common.Interfaces.Storage;
using Infrastructure.Settings;

namespace Infrastructure.Storage
{
    public class CloudinaryStorageService : ICloudinaryService
    {
        private readonly Cloudinary _cloudinary;

        public CloudinaryStorageService(IOptions<CloudinarySettings> settings)
        {
            ArgumentNullException.ThrowIfNull(settings);

            var config = settings.Value;
            var account = new Account(config.CloudName, config.ApiKey, config.ApiSecret);
            _cloudinary = new Cloudinary(account)
            {
                Api = { Secure = true }
            };
        }

        public async Task<string> UploadFileAsync(
            string folder,
            string fileName,
            Stream fileStream,
            string contentType,
            CancellationToken cancellationToken = default)
        {
            ArgumentNullException.ThrowIfNull(fileStream);

            var publicId = $"{Path.GetFileNameWithoutExtension(fileName)}_{Guid.NewGuid():N}";
            HttpStatusCode statusCode;
            Error? error;
            string? fileUrlResult;

            if (contentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
            {
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(fileName, fileStream),
                    Folder = folder,
                    PublicId = publicId,
                    Overwrite = true,
                    Transformation = new Transformation()
                        .Width(1920)
                        .Crop("limit")
                        .Quality("auto:eco")
                        .FetchFormat("auto")
                };
                var result = await _cloudinary.UploadAsync(uploadParams, cancellationToken);
                statusCode = result.StatusCode;
                error = result.Error;
                fileUrlResult = result.SecureUrl?.AbsoluteUri ?? result.Url?.AbsoluteUri;
            }
            else
            {
                var rawUploadParams = new RawUploadParams
                {
                    File = new FileDescription(fileName, fileStream),
                    Folder = folder,
                    PublicId = $"{publicId}{Path.GetExtension(fileName)}",
                    Overwrite = true
                };
                var result = await _cloudinary.UploadAsync(rawUploadParams);
                statusCode = result.StatusCode;
                error = result.Error;
                fileUrlResult = result.SecureUrl?.AbsoluteUri ?? result.Url?.AbsoluteUri;
            }

            if (statusCode != HttpStatusCode.OK && error != null)
            {
                throw new InvalidOperationException($"Cloudinary upload failed: {error.Message}");
            }

            return fileUrlResult ?? string.Empty;
        }

        public async Task DeleteFileAsync(string fileUrl, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(fileUrl))
            {
                return;
            }

            var (publicId, resourceType) = ParseCloudinaryUrl(fileUrl);
            if (string.IsNullOrEmpty(publicId))
            {
                return;
            }

            var deletionParams = new DeletionParams(publicId)
            {
                ResourceType = resourceType
            };

            var destroyResult = await _cloudinary.DestroyAsync(deletionParams);
            if (destroyResult.StatusCode != HttpStatusCode.OK && destroyResult.Error != null)
            {
                throw new InvalidOperationException($"Cloudinary file deletion failed: {destroyResult.Error.Message}");
            }
        }

        public async Task<Stream> GetFileStreamAsync(string fileUrl, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(fileUrl))
            {
                throw new ArgumentException("File URL cannot be null or empty.", nameof(fileUrl));
            }

            using var httpClient = new HttpClient();
            var response = await httpClient.GetAsync(fileUrl, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
            response.EnsureSuccessStatusCode();

            var memoryStream = new MemoryStream();
            await response.Content.CopyToAsync(memoryStream, cancellationToken);
            memoryStream.Position = 0;
            return memoryStream;
        }

        private static (string PublicId, ResourceType ResourceType) ParseCloudinaryUrl(string fileUrl)
        {
            if (!Uri.TryCreate(fileUrl, UriKind.Absolute, out var uri))
            {
                return (fileUrl, ResourceType.Image);
            }

            var segments = uri.AbsolutePath.Split('/', StringSplitOptions.RemoveEmptyEntries);
            var uploadIndex = Array.IndexOf(segments, "upload");
            if (uploadIndex <= 0)
            {
                return (fileUrl, ResourceType.Image);
            }

            var resourceType = segments[uploadIndex - 1].Equals("raw", StringComparison.OrdinalIgnoreCase)
                ? ResourceType.Raw
                : ResourceType.Image;

            var remainingSegments = segments.Skip(uploadIndex + 1).ToList();

            while (remainingSegments.Count > 0 &&
                   (remainingSegments[0].StartsWith('v') && remainingSegments[0][1..].All(char.IsDigit) ||
                    remainingSegments[0].StartsWith("s--")))
            {
                remainingSegments.RemoveAt(0);
            }

            var path = string.Join("/", remainingSegments);

            if (resourceType == ResourceType.Raw)
            {
                return (path, resourceType);
            }

            var lastDotIndex = path.LastIndexOf('.');
            var publicId = lastDotIndex > 0 ? path[..lastDotIndex] : path;

            return (publicId, resourceType);
        }
    }
}
