import React, { useState, useCallback, useEffect } from "react";
import { Modal, Slider, Spin, message, type UploadFile } from "antd";
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
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(
      null,
    );
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    // Reset crop state when modal opens or image source changes
    useEffect(() => {
      if (isOpen) {
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
      }
    }, [isOpen, imageSrc]);

    const handleCropComplete = useCallback(
      (_croppedArea: Area, pixelCrop: Area) => {
        setCroppedAreaPixels(pixelCrop);
      },
      [],
    );

    const handleConfirmCrop = async () => {
      if (!croppedAreaPixels || !imageSrc) return;

      setIsProcessing(true);
      try {
        // Step 1: Extract pixel area using HTML5 Canvas
        const croppedBlob = await getCroppedImg(
          imageSrc,
          croppedAreaPixels,
          outputType,
        );

        let finalFile: File;

        // Step 2: Conditional Compression
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
            effectiveCompressionOptions,
          );
        } else {
          // If compression is disabled, package raw cropped blob into a File
          const ext = getExtensionFromMimeType(outputType);
          const rawFileName = `cropped-raw-${Date.now()}${ext}`;
          finalFile = new File([croppedBlob], rawFileName, {
            type: outputType,
          });
        }

        // Step 3: Package into Ant Design standard UploadFile object
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
        setIsProcessing(false);
      } catch (error) {
        console.error(
          "[ImageCropperModal] Error during crop or compression:",
          error,
        );
        message.error("Đã xảy ra lỗi trong quá trình cắt hoặc xử lý ảnh!");
        setIsProcessing(false);
      }
    };

    return (
      <Modal
        title={title}
        open={isOpen}
        onCancel={onCancel}
        onOk={handleConfirmCrop}
        confirmLoading={isProcessing}
        width={600}
        okText={okText}
        cancelText={cancelText}
        centered
        maskClosable={false}
        zIndex={1001}
        okButtonProps={{
          className:
            "bg-heritage-green hover:!bg-heritage-green-dark border-none rounded-lg shadow-md font-semibold",
        }}
        cancelButtonProps={{ className: "rounded-lg" }}
      >
        <Spin spinning={isProcessing} tip="Đang xử lý ảnh...">
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
                aspect={aspect}
                cropShape={cropShape}
                showGrid={true}
                onCropChange={setCrop}
                onCropComplete={handleCropComplete}
                onZoomChange={setZoom}
                restrictPosition={true}
                minZoom={minZoom}
                maxZoom={maxZoom}
              />
            )}
          </div>

          <div style={{ marginTop: 24 }}>
            <label
              style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
            >
              Thu phóng (Zoom)
            </label>
            <Slider
              min={minZoom}
              max={maxZoom}
              step={0.1}
              value={zoom}
              onChange={setZoom}
              marks={{
                [minZoom]: `${minZoom}x`,
                [(minZoom + maxZoom) / 2]:
                  `${((minZoom + maxZoom) / 2).toFixed(1)}x`,
                [maxZoom]: `${maxZoom}x`,
              }}
            />
          </div>
        </Spin>
      </Modal>
    );
  },
);

ImageCropperModal.displayName = "ImageCropperModal";

export default ImageCropperModal;
