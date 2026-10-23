import { useState, useRef, useMemo } from "react";
import {
  Button,
  Popconfirm,
  Tag,
  Empty,
  Spin,
  Image,
  Alert,
  Select,
  Tooltip,
  message,
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
  useProductImages,
  useCreateProductImage,
  useCreateBatchProductImages,
  useSetPrimaryProductImage,
  useDeleteProductImage,
  useSetDefaultProductColor,
} from "../hooks/useProductImages";
import { useProductOptions } from "@features/admin/variants/hooks/useVariants";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export interface ProductImagesByColorManagerProps {
  productId: number;
  initialOptionValueId?: number | null;
}

export const ProductImagesByColorManager = ({
  productId,
  initialOptionValueId,
}: ProductImagesByColorManagerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [activeCropUid, setActiveCropUid] = useState<string | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  const { data: options = [] } = useProductOptions(productId);
  const colorOption = useMemo(() => {
    return options.find(
      (opt) =>
        opt.name.toLowerCase().includes("màu") ||
        opt.values.some((v) => Boolean(v.colorHexCode))
    );
  }, [options]);

  const [selectedColorFilter, setSelectedColorFilter] = useState<number | "ALL">(
    initialOptionValueId !== undefined && initialOptionValueId !== null
      ? initialOptionValueId
      : "ALL"
  );

  const { data: allImages = [], isLoading } = useProductImages(productId);

  const displayImages = useMemo(() => {
    if (selectedColorFilter === "ALL") return allImages;
    return allImages.filter((img) => img.optionValueId === selectedColorFilter);
  }, [allImages, selectedColorFilter]);

  const currentDefaultColorId = useMemo(() => {
    const primaryImg = allImages.find((img) => img.isPrimary && img.optionValueId);
    if (primaryImg?.optionValueId) {
      return primaryImg.optionValueId;
    }
    return colorOption?.values?.[0]?.id;
  }, [allImages, colorOption]);

  const activeTargetColor = useMemo(() => {
    if (typeof selectedColorFilter === "number") {
      return colorOption?.values.find((v) => v.id === selectedColorFilter);
    }
    if (currentDefaultColorId) {
      const match = colorOption?.values.find((v) => v.id === currentDefaultColorId);
      if (match) return match;
    }
    return colorOption?.values[0];
  }, [selectedColorFilter, currentDefaultColorId, colorOption]);

  const createMutation = useCreateProductImage();
  const createBatchMutation = useCreateBatchProductImages();
  const setPrimaryMutation = useSetPrimaryProductImage();
  const deleteMutation = useDeleteProductImage();
  const setDefaultColorMutation = useSetDefaultProductColor();

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

  const handleOpenCrop = async (file: UploadFile) => {
    setActiveCropUid(file.uid);
    let src = file.url || file.thumbUrl;
    if (!src && file.originFileObj) {
      src = await getBase64(file.originFileObj as FileType);
    }
    setCropImageSrc(src || null);
    setCropModalOpen(true);
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
    setActiveCropUid(null);
    setCropImageSrc(null);
    setCropModalOpen(false);
  };

  const handleUploadAll = async () => {
    const validFiles = fileList
      .map((f) => f.originFileObj as File)
      .filter((f): f is File => Boolean(f));

    if (validFiles.length === 0) return;
    const targetColorId = activeTargetColor?.id;

    if (!targetColorId && colorOption && colorOption.values.length > 0) {
      message.warning("Vui lòng chọn màu sắc áp dụng cho bộ ảnh trước khi tải lên!");
      return;
    }

    if (validFiles.length === 1) {
      await createMutation.mutateAsync({
        productId,
        optionValueId: targetColorId,
        file: validFiles[0],
        isPrimary: allImages.length === 0,
      });
    } else {
      await createBatchMutation.mutateAsync({
        productId,
        optionValueId: targetColorId,
        files: validFiles,
      });
    }

    setFileList([]);
  };

  const handleSetPrimary = async (imgId: number) => {
    await setPrimaryMutation.mutateAsync(imgId);
  };

  const handleDelete = async (imgId: number) => {
    await deleteMutation.mutateAsync(imgId);
  };

  const isAllFilter = selectedColorFilter === "ALL";
  const hasColorOptions = Boolean(colorOption && colorOption.values.length > 0);
  const showPrimaryControls = !hasColorOptions || !isAllFilter;

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
        <div>
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Quản lý hình ảnh theo màu sắc
          </div>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            Mỗi màu sắc của sản phẩm sở hữu bộ ảnh riêng. Nhấn vào từng màu để xem và tải ảnh lên.
          </p>
        </div>

        {colorOption && colorOption.values.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60">
            <button
              type="button"
              onClick={() => setSelectedColorFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                selectedColorFilter === "ALL"
                  ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
              }`}
            >
              Tất cả ảnh ({allImages.length})
            </button>

            {colorOption.values.map((v) => {
              const isSelected = selectedColorFilter === v.id;
              const count = allImages.filter((img) => img.optionValueId === v.id).length;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setSelectedColorFilter(v.id);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-black/10 shrink-0 shadow-2xs"
                    style={{ backgroundColor: v.colorHexCode || "#94a3b8" }}
                  />
                  <span>{v.value}</span>
                  <span
                    className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <Alert
            message="Chưa có thuộc tính Màu sắc"
            description="Vui lòng vào tab 'Thuộc tính & Tùy chọn' để tạo nhóm Màu sắc trước khi tải ảnh sản phẩm."
            type="warning"
            showIcon
            className="rounded-lg text-xs"
          />
        )}
      </div>

      <div className="p-4 rounded-xl bg-white border border-dashed border-slate-300 space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          id="variantImageUploadInput"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleNativeInputChange}
        />
        <input
          ref={fileInputRef}
          type="file"
          id="productImageUploadInput"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleNativeInputChange}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              icon={<PlusOutlined />}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg font-medium"
            >
              Chọn ảnh từ máy
            </Button>

            {colorOption && colorOption.values.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">
                  Màu sắc mặc định khi hiển thị:
                </span>
                <Select
                  id="selectDefaultProductColor"
                  value={currentDefaultColorId}
                  onChange={(val) => {
                    setDefaultColorMutation.mutate({
                      productId,
                      optionValueId: val,
                    });
                  }}
                  loading={setDefaultColorMutation.isPending}
                  placeholder="Chọn màu mặc định"
                  size="small"
                  className="min-w-44"
                  options={colorOption.values.map((v) => ({
                    value: v.id,
                    label: (
                      <span className="flex items-center gap-2 text-xs font-medium">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block shrink-0 shadow-2xs"
                          style={{ backgroundColor: v.colorHexCode || "#94a3b8" }}
                        />
                        <span>{v.value}</span>
                        {v.id === currentDefaultColorId && (
                          <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
                            Mặc định
                          </span>
                        )}
                      </span>
                    ),
                  }))}
                />
              </div>
            )}
          </div>

          {fileList.length > 0 && (
            <Button
              type="primary"
              id="btnUploadVariantImages"
              loading={createMutation.isPending || createBatchMutation.isPending}
              onClick={handleUploadAll}
              className="bg-blue-600 hover:bg-blue-700 font-semibold rounded-lg shadow-xs"
            >
              {fileList.length === 1
                ? `Tải lên 1 ảnh cho màu ${activeTargetColor?.value || ""}`
                : `Tải lên ${fileList.length} ảnh cho màu ${activeTargetColor?.value || ""}`}
            </Button>
          )}
        </div>

        {activeTargetColor && (
          <p className="text-xs text-slate-500 m-0">
            Bộ ảnh tải lên sẽ gắn liền với màu <strong className="text-blue-600 font-semibold">{activeTargetColor.value}</strong>. Màu mặc định khi hiển thị sẽ được chọn tự động ở đầu trang chi tiết sản phẩm.
          </p>
        )}

        {fileList.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-3 border-t border-slate-100">
            {fileList.map((file) => (
              <div
                key={file.uid}
                className="relative group rounded-xl border border-slate-200 p-1.5 bg-slate-50 flex flex-col items-center"
              >
                <img
                  src={file.url || file.thumbUrl}
                  alt={file.name}
                  className="w-full aspect-square object-contain rounded-lg bg-white"
                />
                <span className="text-xxs text-slate-600 truncate max-w-full mt-1 px-1">
                  {file.name}
                </span>

                <div className="absolute inset-0 bg-slate-900/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                  <Button
                    type="text"
                    size="small"
                    id="btnCropVariantImage"
                    icon={<ScissorOutlined className="text-white" />}
                    onClick={() => handleOpenCrop(file)}
                    title="Cắt ảnh"
                  />
                  <Button
                    type="text"
                    size="small"
                    icon={<EyeOutlined className="text-white" />}
                    onClick={() => handlePreview(file)}
                    title="Xem trước"
                  />
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined className="text-rose-400" />}
                    onClick={() =>
                      setFileList((prev) => prev.filter((item) => item.uid !== file.uid))
                    }
                    title="Bỏ chọn"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {selectedColorFilter === "ALL"
              ? `Tất cả ảnh của sản phẩm (${displayImages.length} ảnh)`
              : `Bộ sưu tập màu ${activeTargetColor?.value || ""} (${displayImages.length} ảnh)`}
          </div>
          {selectedColorFilter === "ALL" && hasColorOptions && (
            <span className="text-xs text-slate-500 italic">
              Chọn từng màu ở trên để quản lý thứ tự và đặt ảnh đại diện cho màu đó.
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center">
            <Spin tip="Đang tải danh sách ảnh..." />
          </div>
        ) : displayImages.length === 0 ? (
          <div className="py-10 text-center rounded-xl border border-slate-200/80 bg-slate-50/50">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="text-xs text-slate-400">
                  Chưa có hình ảnh nào cho phân loại này. Vui lòng tải lên ảnh ở trên.
                </span>
              }
            />
          </div>
        ) : (
          <Image.PreviewGroup>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {displayImages.map((img) => (
                <div
                  key={img.id}
                  className="relative group rounded-xl border border-slate-200 bg-white p-2 flex flex-col justify-between hover:shadow-xs transition-shadow"
                >
                  <div className="relative aspect-square w-full rounded-xl bg-slate-50/60 overflow-hidden flex items-center justify-center p-2">
                    <Image
                      src={img.imageUrl}
                      alt={img.altText || `Ảnh sản phẩm #${img.displayOrder}`}
                      className="max-h-full max-w-full object-contain"
                    />

                    <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 z-10">
                      <Tag color="blue" className="rounded-md font-mono text-xs m-0">
                        #{img.displayOrder}
                      </Tag>
                      {showPrimaryControls && img.isPrimary && (
                        <Tag color="gold" className="rounded-md font-bold text-xs m-0">
                          Ảnh chính
                        </Tag>
                      )}
                    </div>

                    {img.optionValueName && (
                      <div className="absolute bottom-1.5 left-1.5 z-10">
                        <Tag color="cyan" className="rounded-md text-[11px] font-semibold m-0">
                          {img.optionValueName}
                        </Tag>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-1 border-t border-slate-100 mt-2">
                    {showPrimaryControls ? (
                      !img.isPrimary ? (
                        <Tooltip title="Đặt làm ảnh đại diện chính của màu này">
                          <Button
                            type="text"
                            size="small"
                            icon={<StarOutlined />}
                            loading={setPrimaryMutation.isPending}
                            onClick={() => handleSetPrimary(img.id)}
                            className="text-xs text-slate-600 hover:text-amber-500"
                          >
                            Đặt chính
                          </Button>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Ảnh này đang là ảnh chính của màu này">
                          <span className="text-xs text-amber-500 font-bold inline-flex items-center gap-1 pl-1 cursor-default">
                            <StarFilled /> Chính
                          </span>
                        </Tooltip>
                      )
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">
                        Chọn màu để đổi ảnh chính
                      </span>
                    )}

                    <Popconfirm
                      title="Xác nhận xóa ảnh"
                      description="Bạn có chắc chắn muốn xóa hình ảnh này khỏi sản phẩm?"
                      okText="Xóa"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true }}
                      onConfirm={() => handleDelete(img.id)}
                    >
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        loading={deleteMutation.isPending}
                        title="Xóa ảnh"
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

      <Image
        style={{ display: "none" }}
        preview={{
          visible: previewOpen,
          src: previewImage,
          onVisibleChange: (val) => setPreviewOpen(val),
        }}
      />
    </div>
  );
};

export default ProductImagesByColorManager;
