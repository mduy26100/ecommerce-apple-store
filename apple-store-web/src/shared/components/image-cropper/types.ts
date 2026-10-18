import type { ImageCompressionOptions } from "@shared/utils";
import type { UploadFile } from "antd";

export interface ImageCropperModalProps {
  /** Controlling visibility of the modal */
  isOpen: boolean;
  /** Image source string (URL or Data URL) */
  imageSrc: string | null;
  /** Callback triggered when Modal is closed/cancelled */
  onCancel: () => void;
  /** Callback triggered when crop (and optional compression) succeeds. Returns an Antd UploadFile object. */
  onCropComplete: (fileObj: UploadFile) => void;
  /** Crop aspect ratio (width / height). Default: 1 (1:1 ratio) */
  aspect?: number;
  /** Crop boundary shape ('rect' | 'round'). Default: 'rect' */
  cropShape?: "rect" | "round";
  /** Target output MIME type for crop canvas export. Default: "image/webp" */
  outputType?: "image/webp" | "image/jpeg" | "image/png";

  /** Enable/disable compression after crop. Default: true */
  enableCompression?: boolean;
  /** Detailed compression options overriding defaults (maxSizeMB, maxWidthOrHeight, quality, useWebWorker...) */
  compressionOptions?: ImageCompressionOptions;

  /** Modal Title. Default: "Cắt và chỉnh sửa ảnh" */
  title?: string;
  /** Custom OK Button text. Default: "Xác nhận" */
  okText?: string;
  /** Custom Cancel Button text. Default: "Hủy" */
  cancelText?: string;
  /** Minimum zoom factor. Default: 1 */
  minZoom?: number;
  /** Maximum zoom factor. Default: 3 */
  maxZoom?: number;

  /** Deprecated: use compressionOptions.maxSizeMB instead */
  maxSizeMB?: number;
  /** Deprecated: use compressionOptions.maxWidthOrHeight instead */
  maxWidthOrHeight?: number;
}
