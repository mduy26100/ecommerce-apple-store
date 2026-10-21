import type { ImageCompressionOptions } from "@shared/utils";
import type { UploadFile } from "antd";

export interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onCancel: () => void;
  onCropComplete: (fileObj: UploadFile) => void;
  aspect?: number;
  freeAspect?: boolean;
  cropShape?: "rect" | "round";
  outputType?: "image/webp" | "image/jpeg" | "image/png";
  enableCompression?: boolean;
  compressionOptions?: ImageCompressionOptions;
  title?: string;
  okText?: string;
  cancelText?: string;
  minZoom?: number;
  maxZoom?: number;
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
}
