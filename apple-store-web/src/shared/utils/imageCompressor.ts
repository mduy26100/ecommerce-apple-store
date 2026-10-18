import imageCompression, {
  type Options as CompressionOptions,
} from "browser-image-compression";

/**
 * Image compression configuration options for client-side processing.
 */
export interface ImageCompressionOptions extends Partial<CompressionOptions> {
  /** Enable/disable compression. If false, original file is returned directly. Default: true */
  enabled?: boolean;
  /** Maximum output file size in MB. Default: 0.3 (~300KB) */
  maxSizeMB?: number;
  /** Maximum width or height of output image in pixels. Default: 1024 */
  maxWidthOrHeight?: number;
  /** Image quality factor from 0.0 to 1.0 (lossy). Default: 0.85 */
  quality?: number;
  /** Target MIME file type (e.g., 'image/webp', 'image/jpeg', 'image/png'). Default: 'image/webp' */
  fileType?: string;
  /** Use WebWorker for background processing to avoid freezing the UI. Default: true */
  useWebWorker?: boolean;
  /** Preserve EXIF orientation metadata. Default: true */
  preserveExif?: boolean;
}

/**
 * Default compression configuration settings.
 */
export const DEFAULT_COMPRESSION_OPTIONS: Required<
  Omit<ImageCompressionOptions, keyof CompressionOptions>
> & {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  quality: number;
  fileType: string;
  useWebWorker: boolean;
  preserveExif: boolean;
} = {
  enabled: true,
  maxSizeMB: 0.3,
  maxWidthOrHeight: 1024,
  quality: 0.85,
  fileType: "image/webp",
  useWebWorker: true,
  preserveExif: true,
};

/**
 * Helper to get proper file extension from MIME type.
 */
export const getExtensionFromMimeType = (mimeType?: string): string => {
  switch (mimeType?.toLowerCase()) {
    case "image/webp":
      return ".webp";
    case "image/jpeg":
    case "image/jpg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/avif":
      return ".avif";
    default:
      return ".webp";
  }
};

/**
 * Compresses an image file or blob on the client-side using browser-image-compression.
 * Features safe fallback: returns original file if compression fails or is disabled.
 *
 * @param imageInput File or Blob to compress
 * @param options Compression configuration options
 * @returns Promise resolving to the compressed (or original fallback) File object
 */
export const compressImageClient = async (
  imageInput: Blob | File,
  options?: ImageCompressionOptions,
): Promise<File> => {
  const mergedOptions: ImageCompressionOptions = {
    ...DEFAULT_COMPRESSION_OPTIONS,
    ...options,
  };

  const targetFileType = mergedOptions.fileType || "image/webp";
  const targetExt = getExtensionFromMimeType(targetFileType);

  // Generate a standardized output file name
  const originalFileName =
    imageInput instanceof File
      ? imageInput.name.replace(/\.[^/.]+$/, "")
      : `image-${Date.now()}`;
  const outputFileName = `${originalFileName}${targetExt}`;

  // Early return if compression is disabled
  if (mergedOptions.enabled === false) {
    if (imageInput instanceof File) {
      return imageInput;
    }
    return new File([imageInput], outputFileName, {
      type: imageInput.type || targetFileType,
    });
  }

  // Convert Blob to File if needed for browser-image-compression input
  const fileToCompress: File =
    imageInput instanceof File
      ? imageInput
      : new File([imageInput], outputFileName, {
          type: imageInput.type || "image/png",
        });

  try {
    const compressionConfig: CompressionOptions = {
      maxSizeMB:
        mergedOptions.maxSizeMB ?? DEFAULT_COMPRESSION_OPTIONS.maxSizeMB,
      maxWidthOrHeight:
        mergedOptions.maxWidthOrHeight ??
        DEFAULT_COMPRESSION_OPTIONS.maxWidthOrHeight,
      useWebWorker:
        mergedOptions.useWebWorker ?? DEFAULT_COMPRESSION_OPTIONS.useWebWorker,
      fileType: targetFileType,
      initialQuality:
        mergedOptions.quality ?? DEFAULT_COMPRESSION_OPTIONS.quality,
      preserveExif:
        mergedOptions.preserveExif ?? DEFAULT_COMPRESSION_OPTIONS.preserveExif,
    };

    const compressedBlob = await imageCompression(
      fileToCompress,
      compressionConfig,
    );

    return new File([compressedBlob], outputFileName, {
      type: targetFileType,
    });
  } catch (error) {
    console.warn(
      "[imageCompressor] Compression encountered an issue, falling back to original file:",
      error,
    );

    // Safe fallback to prevent breaking application upload flow
    if (imageInput instanceof File) {
      return imageInput;
    }
    return new File([imageInput], outputFileName, {
      type: imageInput.type || targetFileType,
    });
  }
};

/**
 * Backward-compatible alias for compressImageClient.
 */
export const compressImage = compressImageClient;

export default compressImageClient;
