import { useState, useRef } from "react";
import {
  Button,
  Card,
  Popconfirm,
  Tag,
  Empty,
  Spin,
  Upload,
  Image,
  type GetProp,
  type UploadFile,
  type UploadProps,
} from "antd";
import {
  PlusOutlined,
  StarOutlined,
  StarFilled,
  DeleteOutlined,
  ScissorOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { ImageCropperModal } from "@shared/components/image-cropper";
import {
  useVariantImages,
  useCreateVariantImage,
  useCreateBatchVariantImages,
  useSetPrimaryVariantImage,
  useDeleteVariantImage,
} from "../hooks/useVariantImages";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export interface VariantImageGalleryProps {
  variantId: number;
  productId?: number;
}

export const VariantImageGallery = ({
  variantId,
  productId,
}: VariantImageGalleryProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [activeCropUid, setActiveCropUid] = useState<string | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  const { data: images = [], isLoading } = useVariantImages(variantId);
  const createMutation = useCreateVariantImage(variantId, productId);
  const createBatchMutation = useCreateBatchVariantImages(variantId, productId);
  const setPrimaryMutation = useSetPrimaryVariantImage(variantId, productId);
  const deleteMutation = useDeleteVariantImage(variantId, productId);

  const handleProcessFiles = async (files: File[]) => {
    if (files.length === 0) return;
    const newItems: UploadFile[] = await Promise.all(
      files.map(async (file, idx) => {
        const base64 = await getBase64(file as FileType);
        return {
          uid: `upload-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          status: "done",
          url: base64,
          thumbUrl: base64,
          originFileObj: file as any,
        };
      })
    );
    setFileList((prev) => [...prev, ...newItems]);
  };

  const handleNativeInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    await handleProcessFiles(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview && file.originFileObj) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }
    setPreviewImage(file.url || (file.preview as string) || "");
    setPreviewOpen(true);
  };

  const handleOpenCropForFile = async (uid: string) => {
    const target = fileList.find((f) => f.uid === uid);
    if (!target) return;
    let src = target.url || target.thumbUrl;
    if (!src && target.originFileObj) {
      src = await getBase64(target.originFileObj as FileType);
    }
    if (src) {
      setActiveCropUid(uid);
      setCropImageSrc(src);
      setCropModalOpen(true);
    }
  };

  const handleCropComplete = (croppedUploadFile: UploadFile) => {
    const newFile = croppedUploadFile.originFileObj as File;
    const newUrl = URL.createObjectURL(newFile);
    setFileList((prev) =>
      prev.map((item) =>
        item.uid === activeCropUid
          ? {
            ...item,
            url: newUrl,
            thumbUrl: newUrl,
            originFileObj: newFile as any,
            name: newFile.name,
          }
          : item
      )
    );
    setCropModalOpen(false);
    setActiveCropUid(null);
    setCropImageSrc(null);
  };

  const handleRemove = (file: UploadFile) => {
    setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
  };

  const handleUploadSelectedFiles = async () => {
    if (fileList.length === 0) return;

    if (fileList.length === 1) {
      const singleFile = fileList[0].originFileObj as File;
      await createMutation.mutateAsync({
        productVariantId: variantId,
        file: singleFile,
      });
    } else {
      const filesToUpload = fileList.map((f) => f.originFileObj as File);
      await createBatchMutation.mutateAsync({
        productVariantId: variantId,
        files: filesToUpload,
      });
    }

    setFileList([]);
    setActiveCropUid(null);
    setCropImageSrc(null);
  };

  const isUploading = createMutation.isPending || createBatchMutation.isPending;

  const uploadButton = (
    <button
      id="btnSelectVariantImages"
      type="button"
      onClick={() => fileInputRef.current?.click()}
      className="border-0 bg-transparent flex flex-col items-center justify-center w-full h-full cursor-pointer p-2"
    >
      <PlusOutlined className="text-xl text-slate-500" />
      <div className="mt-2 text-xs font-semibold text-slate-700">Tải ảnh lên</div>
    </button>
  );

  return (
    <div className="space-y-6">
      <Card
        size="small"
        title="Chọn ảnh biến thể (Xem trước từng ảnh & cắt ảnh tự do)"
        className="border-slate-200 bg-slate-50/50 rounded-xl"
      >
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            id="variantImageUploadInput"
            type="file"
            accept="image/*"
            multiple
            onChange={handleNativeInputChange}
            className="hidden"
          />

          <div>
            <Upload
              listType="picture-card"
              fileList={fileList}
              onPreview={handlePreview}
              onRemove={handleRemove}
              beforeUpload={(file) => {
                handleProcessFiles([file]);
                return false;
              }}
              multiple
            >
              {uploadButton}
            </Upload>

            {previewImage && (
              <Image
                styles={{ root: { display: "none" } }}
                preview={{
                  open: previewOpen,
                  onOpenChange: (open) => setPreviewOpen(open),
                  afterOpenChange: (open) => !open && setPreviewImage(""),
                }}
                src={previewImage}
              />
            )}
          </div>

          {fileList.length > 0 && (
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <span className="text-sm font-semibold text-slate-700">
                  Đã chuẩn bị <strong>{fileList.length}</strong> ảnh sẵn sàng:
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="small"
                    danger
                    type="text"
                    onClick={() => setFileList([])}
                  >
                    Hủy chọn tất cả
                  </Button>
                  <Button
                    id="btnUploadVariantImages"
                    type="primary"
                    loading={isUploading}
                    onClick={handleUploadSelectedFiles}
                    className="bg-blue-600 hover:bg-blue-700 font-semibold"
                  >
                    {fileList.length === 1
                      ? "Tải ảnh này lên"
                      : `Tải lên ${fileList.length} ảnh đã chọn`}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {fileList.map((item, index) => (
                  <div
                    key={item.uid}
                    className="flex items-center justify-between p-2 rounded-lg border border-slate-100 bg-slate-50/60"
                  >
                    <div
                      className="flex items-center gap-2 overflow-hidden cursor-pointer"
                      onClick={() => handlePreview(item)}
                    >
                      <img
                        src={item.url || item.thumbUrl}
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded-md border border-slate-200"
                      />
                      <span className="text-xs text-slate-700 truncate max-w-32.5 sm:max-w-45">
                        {item.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        id={index === 0 ? "btnCropVariantImage" : undefined}
                        size="small"
                        icon={<ScissorOutlined />}
                        onClick={() => handleOpenCropForFile(item.uid)}
                        title="Cắt ảnh tự do"
                      >
                        Cắt ảnh
                      </Button>
                      <Button
                        size="small"
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => handlePreview(item)}
                        title="Xem trước"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      <div>
        <div className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <span>Danh sách hình ảnh hiện tại</span>
          <Tag color="blue">{images.length} ảnh</Tag>
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center">
            <Spin />
          </div>
        ) : images.length === 0 ? (
          <Empty description="Biến thể này chưa có hình ảnh nào" className="my-8" />
        ) : (
          <Image.PreviewGroup>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img) => (
                <div
                  key={img.id}
                  className={`relative group rounded-xl border overflow-hidden bg-white shadow-xs transition-all ${img.isPrimary
                    ? "border-amber-400 ring-2 ring-amber-400/20"
                    : "border-slate-200 hover:border-slate-300"
                    }`}
                >
                  <div className="aspect-square bg-slate-50 flex items-center justify-center p-2 relative">
                    <Tag className="absolute top-2 left-2 z-10 m-0 text-xs font-semibold bg-slate-900/70 text-white border-none">
                      #{img.displayOrder}
                    </Tag>
                    <Image
                      src={img.imageUrl}
                      alt={img.altText || "Ảnh biến thể sản phẩm"}
                      className="max-h-full max-w-full object-contain"
                      rootClassName="w-full h-full flex items-center justify-center"
                    />
                  </div>

                  <div className="p-2.5 bg-white border-t border-slate-100 flex items-center justify-between gap-1">
                    {img.isPrimary ? (
                      <Tag color="gold" icon={<StarFilled />} className="mr-0 font-semibold">
                        Ảnh chính
                      </Tag>
                    ) : (
                      <Button
                        size="small"
                        type="text"
                        icon={<StarOutlined />}
                        onClick={() => setPrimaryMutation.mutate(img.id)}
                        loading={setPrimaryMutation.isPending}
                        className="text-slate-500 hover:text-amber-500 text-xs px-1"
                      >
                        Đặt chính
                      </Button>
                    )}

                    <Popconfirm
                      title="Xóa ảnh này?"
                      okText="Xóa"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true }}
                      onConfirm={() => deleteMutation.mutate(img.id)}
                    >
                      <Button
                        size="small"
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        loading={deleteMutation.isPending}
                        title="Xóa"
                      />
                    </Popconfirm>
                  </div>
                </div>
              ))}
            </div>
          </Image.PreviewGroup>
        )}
      </div>

      <ImageCropperModal
        isOpen={cropModalOpen}
        imageSrc={cropImageSrc}
        freeAspect={true}
        title="Cắt ảnh sản phẩm (Tự do ngang dọc)"
        onCancel={() => {
          setCropModalOpen(false);
          setActiveCropUid(null);
          setCropImageSrc(null);
        }}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
};

export default VariantImageGallery;
