import React, { useState, useCallback, useEffect } from "react";
import { Modal, Slider, Spin, Button, message, type UploadFile } from "antd";
import Cropper, { type Area } from "react-easy-crop";
import { getCroppedImg } from "@shared/utils/imageCrop";
import {
  compressImageClient,
  getExtensionFromMimeType,
  type ImageCompressionOptions,
} from "@shared/utils";
import type { ImageCropperModalProps } from "./types";

export const ImageCropperModal: React.FC<ImageCropperModalProps> = React.memo(
  ({
    isOpen,
    imageSrc,
    onCancel,
    onCropComplete,
    aspect = 1,
    freeAspect = false,
    cropShape = "rect",
    title = "Cắt và chỉnh sửa ảnh",
    outputType = "image/webp",
    enableCompression = true,
    compressionOptions,
    maxSizeMB,
    maxWidthOrHeight,
    okText = "Xác nhận",
    cancelText = "Hủy",
    minZoom = 1,
    maxZoom = 3,
  }) => {
    const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState<number>(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const [cropWidth, setCropWidth] = useState<number>(360);
    const [cropHeight, setCropHeight] = useState<number>(270);
    const [aspectMode, setAspectMode] = useState<string>("free");

    useEffect(() => {
      if (isOpen) {
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
        setCropWidth(360);
        setCropHeight(270);
        setAspectMode(freeAspect ? "free" : "1:1");
      }
    }, [isOpen, imageSrc, freeAspect]);

    const handleCropChangeComplete = useCallback(
      (_croppedArea: Area, pixelCrop: Area) => {
        setCroppedAreaPixels(pixelCrop);
      },
      []
    );

    const handleApplyAspect = (mode: string) => {
      setAspectMode(mode);
      if (mode === "1:1") {
        setCropWidth(300);
        setCropHeight(300);
      } else if (mode === "4:3") {
        setCropWidth(400);
        setCropHeight(300);
      } else if (mode === "16:9") {
        setCropWidth(480);
        setCropHeight(270);
      } else if (mode === "3:4") {
        setCropWidth(270);
        setCropHeight(360);
      } else if (mode === "9:16") {
        setCropWidth(200);
        setCropHeight(355);
      }
    };

    const handleHandleMouseDown =
      (direction: string) => (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startY = e.clientY;
        const initialW = cropWidth;
        const initialH = cropHeight;

        const onMouseMove = (moveEvent: MouseEvent) => {
          const dx = moveEvent.clientX - startX;
          const dy = moveEvent.clientY - startY;

          setAspectMode("free");

          if (direction === "right") {
            setCropWidth(
              Math.min(560, Math.max(100, Math.round(initialW + dx * 2)))
            );
          } else if (direction === "left") {
            setCropWidth(
              Math.min(560, Math.max(100, Math.round(initialW - dx * 2)))
            );
          } else if (direction === "bottom") {
            setCropHeight(
              Math.min(360, Math.max(100, Math.round(initialH + dy * 2)))
            );
          } else if (direction === "top") {
            setCropHeight(
              Math.min(360, Math.max(100, Math.round(initialH - dy * 2)))
            );
          } else if (direction === "bottom-right") {
            setCropWidth(
              Math.min(560, Math.max(100, Math.round(initialW + dx * 2)))
            );
            setCropHeight(
              Math.min(360, Math.max(100, Math.round(initialH + dy * 2)))
            );
          } else if (direction === "bottom-left") {
            setCropWidth(
              Math.min(560, Math.max(100, Math.round(initialW - dx * 2)))
            );
            setCropHeight(
              Math.min(360, Math.max(100, Math.round(initialH + dy * 2)))
            );
          } else if (direction === "top-right") {
            setCropWidth(
              Math.min(560, Math.max(100, Math.round(initialW + dx * 2)))
            );
            setCropHeight(
              Math.min(360, Math.max(100, Math.round(initialH - dy * 2)))
            );
          } else if (direction === "top-left") {
            setCropWidth(
              Math.min(560, Math.max(100, Math.round(initialW - dx * 2)))
            );
            setCropHeight(
              Math.min(360, Math.max(100, Math.round(initialH - dy * 2)))
            );
          }
        };

        const onMouseUp = () => {
          window.removeEventListener("mousemove", onMouseMove);
          window.removeEventListener("mouseup", onMouseUp);
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
      };

    const handleConfirmCrop = async () => {
      if (!imageSrc) return;

      setIsProcessing(true);
      try {
        let pixelCrop = croppedAreaPixels;
        if (!pixelCrop || pixelCrop.width === 0 || pixelCrop.height === 0) {
          const img = new Image();
          await new Promise((resolve) => {
            img.onload = () => resolve(null);
            img.onerror = () => resolve(null);
            img.src = imageSrc;
            if (img.complete && img.naturalWidth > 0) {
              resolve(null);
            }
          });
          pixelCrop = {
            x: 0,
            y: 0,
            width: img.naturalWidth || 600,
            height: img.naturalHeight || 600,
          };
        }

        const croppedBlob = await getCroppedImg(
          imageSrc,
          pixelCrop,
          outputType
        );

        let finalFile: File;

        if (enableCompression) {
          const effectiveCompressionOptions: ImageCompressionOptions = {
            maxSizeMB: compressionOptions?.maxSizeMB ?? maxSizeMB ?? 0.3,
            maxWidthOrHeight:
              compressionOptions?.maxWidthOrHeight ?? maxWidthOrHeight ?? 1024,
            quality: compressionOptions?.quality ?? 0.85,
            fileType: compressionOptions?.fileType ?? outputType,
            useWebWorker: compressionOptions?.useWebWorker ?? true,
            preserveExif: compressionOptions?.preserveExif ?? true,
            ...compressionOptions,
            enabled: true,
          };

          finalFile = await compressImageClient(
            croppedBlob,
            effectiveCompressionOptions
          );
        } else {
          const ext = getExtensionFromMimeType(outputType);
          const rawFileName = `cropped-raw-${Date.now()}${ext}`;
          finalFile = new File([croppedBlob], rawFileName, {
            type: outputType,
          });
        }

        const previewUrl = URL.createObjectURL(finalFile);
        const fileObj: UploadFile = {
          uid: `cropped-${Date.now()}`,
          name: finalFile.name,
          status: "done",
          url: previewUrl,
          thumbUrl: previewUrl,
          originFileObj: finalFile as unknown as UploadFile["originFileObj"],
        };

        onCropComplete(fileObj);
      } catch (error) {
        console.error(error);
        message.error("Đã xảy ra lỗi trong quá trình cắt hoặc xử lý ảnh!");
      } finally {
        setIsProcessing(false);
      }
    };

    const finalAspect = freeAspect ? cropWidth / cropHeight : aspect;
    const currentCropSize = freeAspect
      ? { width: cropWidth, height: cropHeight }
      : undefined;

    return (
      <Modal
        title={title}
        open={isOpen}
        onCancel={onCancel}
        onOk={handleConfirmCrop}
        confirmLoading={isProcessing}
        width={680}
        okText={okText}
        cancelText={cancelText}
        centered
        maskClosable={false}
        zIndex={3000}
        styles={{
          mask: { zIndex: 3000 },
          wrapper: { zIndex: 3000 },
        }}
        okButtonProps={{
          className:
            "bg-blue-600 hover:!bg-blue-700 text-white border-none rounded-lg shadow-md font-semibold",
        }}
        cancelButtonProps={{ className: "rounded-lg" }}
      >
        <Spin spinning={isProcessing} tip="Đang xử lý ảnh...">
          {freeAspect && (
            <div className="mb-3 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-600 mr-1">
                Tỉ lệ cắt:
              </span>
              {[
                { label: "Tự do", value: "free" },
                { label: "1:1 (Vuông)", value: "1:1" },
                { label: "4:3 (Ngang)", value: "4:3" },
                { label: "16:9 (Ngang rộng)", value: "16:9" },
                { label: "3:4 (Dọc)", value: "3:4" },
                { label: "9:16 (Dọc đứng)", value: "9:16" },
              ].map((btn) => (
                <Button
                  key={btn.value}
                  size="small"
                  type={aspectMode === btn.value ? "primary" : "default"}
                  onClick={() => handleApplyAspect(btn.value)}
                  className={
                    aspectMode === btn.value
                      ? "bg-blue-600 font-semibold"
                      : "text-slate-600"
                  }
                >
                  {btn.label}
                </Button>
              ))}
            </div>
          )}

          <div
            style={{
              position: "relative",
              width: "100%",
              height: 400,
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={finalAspect}
                cropSize={currentCropSize}
                cropShape={cropShape}
                showGrid={true}
                onCropChange={setCrop}
                onCropComplete={handleCropChangeComplete}
                onZoomChange={setZoom}
                restrictPosition={true}
                minZoom={minZoom}
                maxZoom={maxZoom}
              />
            )}

            {freeAspect && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  zIndex: 25,
                }}
              >
                <div
                  onMouseDown={handleHandleMouseDown("left")}
                  style={{
                    position: "absolute",
                    left: `calc(50% - ${cropWidth / 2}px)`,
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 12,
                    height: 28,
                    backgroundColor: "#ffffff",
                    border: "2px solid #2563eb",
                    borderRadius: 4,
                    cursor: "ew-resize",
                    pointerEvents: "auto",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  }}
                  title="Kéo thay đổi chiều ngang trái"
                />

                <div
                  onMouseDown={handleHandleMouseDown("right")}
                  style={{
                    position: "absolute",
                    left: `calc(50% + ${cropWidth / 2}px)`,
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 12,
                    height: 28,
                    backgroundColor: "#ffffff",
                    border: "2px solid #2563eb",
                    borderRadius: 4,
                    cursor: "ew-resize",
                    pointerEvents: "auto",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  }}
                  title="Kéo thay đổi chiều ngang phải"
                />

                <div
                  onMouseDown={handleHandleMouseDown("top")}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: `calc(50% - ${cropHeight / 2}px)`,
                    transform: "translate(-50%, -50%)",
                    width: 28,
                    height: 12,
                    backgroundColor: "#ffffff",
                    border: "2px solid #2563eb",
                    borderRadius: 4,
                    cursor: "ns-resize",
                    pointerEvents: "auto",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  }}
                  title="Kéo thay đổi chiều dọc trên"
                />

                <div
                  onMouseDown={handleHandleMouseDown("bottom")}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: `calc(50% + ${cropHeight / 2}px)`,
                    transform: "translate(-50%, -50%)",
                    width: 28,
                    height: 12,
                    backgroundColor: "#ffffff",
                    border: "2px solid #2563eb",
                    borderRadius: 4,
                    cursor: "ns-resize",
                    pointerEvents: "auto",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  }}
                  title="Kéo thay đổi chiều dọc dưới"
                />

                <div
                  onMouseDown={handleHandleMouseDown("top-left")}
                  style={{
                    position: "absolute",
                    left: `calc(50% - ${cropWidth / 2}px)`,
                    top: `calc(50% - ${cropHeight / 2}px)`,
                    transform: "translate(-50%, -50%)",
                    width: 14,
                    height: 14,
                    backgroundColor: "#ffffff",
                    border: "2px solid #2563eb",
                    borderRadius: 3,
                    cursor: "nwse-resize",
                    pointerEvents: "auto",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  }}
                  title="Kéo góc trên-trái"
                />

                <div
                  onMouseDown={handleHandleMouseDown("top-right")}
                  style={{
                    position: "absolute",
                    left: `calc(50% + ${cropWidth / 2}px)`,
                    top: `calc(50% - ${cropHeight / 2}px)`,
                    transform: "translate(-50%, -50%)",
                    width: 14,
                    height: 14,
                    backgroundColor: "#ffffff",
                    border: "2px solid #2563eb",
                    borderRadius: 3,
                    cursor: "nesw-resize",
                    pointerEvents: "auto",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  }}
                  title="Kéo góc trên-phải"
                />

                <div
                  onMouseDown={handleHandleMouseDown("bottom-left")}
                  style={{
                    position: "absolute",
                    left: `calc(50% - ${cropWidth / 2}px)`,
                    top: `calc(50% + ${cropHeight / 2}px)`,
                    transform: "translate(-50%, -50%)",
                    width: 14,
                    height: 14,
                    backgroundColor: "#ffffff",
                    border: "2px solid #2563eb",
                    borderRadius: 3,
                    cursor: "nesw-resize",
                    pointerEvents: "auto",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  }}
                  title="Kéo góc dưới-trái"
                />

                <div
                  onMouseDown={handleHandleMouseDown("bottom-right")}
                  style={{
                    position: "absolute",
                    left: `calc(50% + ${cropWidth / 2}px)`,
                    top: `calc(50% + ${cropHeight / 2}px)`,
                    transform: "translate(-50%, -50%)",
                    width: 14,
                    height: 14,
                    backgroundColor: "#ffffff",
                    border: "2px solid #2563eb",
                    borderRadius: 3,
                    cursor: "nwse-resize",
                    pointerEvents: "auto",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  }}
                  title="Kéo góc dưới-phải"
                />
              </div>
            )}
          </div>

          <div className="mt-4 space-y-3">
            {freeAspect && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <div>
                  <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1">
                    <span>Chiều rộng khung cắt (Ngang)</span>
                    <span className="text-blue-600 font-semibold">
                      {cropWidth}px
                    </span>
                  </div>
                  <Slider
                    min={100}
                    max={560}
                    step={5}
                    value={cropWidth}
                    onChange={(w) => {
                      setCropWidth(w);
                      setAspectMode("free");
                    }}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1">
                    <span>Chiều cao khung cắt (Dọc)</span>
                    <span className="text-blue-600 font-semibold">
                      {cropHeight}px
                    </span>
                  </div>
                  <Slider
                    min={100}
                    max={360}
                    step={5}
                    value={cropHeight}
                    onChange={(h) => {
                      setCropHeight(h);
                      setAspectMode("free");
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1">
                <span>Thu phóng (Zoom)</span>
                <span className="text-blue-600 font-semibold">{zoom.toFixed(1)}x</span>
              </div>
              <Slider
                min={minZoom}
                max={maxZoom}
                step={0.1}
                value={zoom}
                onChange={setZoom}
                marks={{
                  [minZoom]: `${minZoom}x`,
                  [(minZoom + maxZoom) / 2]: `${((minZoom + maxZoom) / 2).toFixed(1)}x`,
                  [maxZoom]: `${maxZoom}x`,
                }}
              />
            </div>
          </div>
        </Spin>
      </Modal>
    );
  }
);

ImageCropperModal.displayName = "ImageCropperModal";

export default ImageCropperModal;
