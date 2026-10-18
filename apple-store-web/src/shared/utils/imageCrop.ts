import type { Area } from "react-easy-crop";

export interface CropPixelArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Cuts an image based on pixel crop coordinates using HTML5 Canvas.
 *
 * @param imageSrc Source URL or Data URL of the image
 * @param pixelCrop Pixel coordinates and dimensions for crop
 * @param mimeType Output image MIME type (default: "image/webp")
 * @param quality Output image quality from 0.0 to 1.0 (default: 0.95)
 * @returns Promise resolving to a Blob of the cropped area
 */
export const getCroppedImg = (
  imageSrc: string,
  pixelCrop: Area | CropPixelArea,
  mimeType: string = "image/webp",
  quality: number = 0.95,
): Promise<Blob> => {
  const image = new Image();
  if (!imageSrc.startsWith("data:")) {
    image.setAttribute("crossOrigin", "anonymous");
  }
  image.src = imageSrc;

  return new Promise((resolve, reject) => {
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Canvas 2D context is not available"));
        return;
      }

      canvas.width = Math.round(pixelCrop.width);
      canvas.height = Math.round(pixelCrop.height);

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        canvas.width,
        canvas.height,
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas export to blob failed"));
            return;
          }
          resolve(blob);
        },
        mimeType,
        quality,
      );
    };

    image.onerror = (error) => {
      reject(error);
    };
  });
};

// Re-export compression tools for convenience and backward compatibility
export * from "./imageCompressor";
