import type { Area } from "react-easy-crop";

export interface CropPixelArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

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

  return new Promise((resolve, reject) => {
    let finished = false;

    const handleProcess = () => {
      if (finished) return;
      finished = true;

      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Canvas 2D context is not available"));
          return;
        }

        const width = Math.max(1, Math.round(pixelCrop.width));
        const height = Math.max(1, Math.round(pixelCrop.height));

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(
          image,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          width,
          height,
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
      } catch (err) {
        reject(err);
      }
    };

    image.onload = handleProcess;
    image.onerror = (error) => {
      if (finished) return;
      finished = true;
      reject(error);
    };

    image.src = imageSrc;

    if (image.complete && image.naturalWidth > 0) {
      handleProcess();
    }
  });
};

export * from "./imageCompressor";
