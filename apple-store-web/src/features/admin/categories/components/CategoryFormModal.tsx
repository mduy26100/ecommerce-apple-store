import { useEffect, useState, useRef } from "react";
import { Modal, Form, Input, InputNumber, Switch, Button, Tag, Image } from "antd";
import { UploadOutlined, DeleteOutlined, PictureOutlined, ScissorOutlined, EyeOutlined } from "@ant-design/icons";
import { ImageCropperModal } from "@shared/components/image-cropper";
import type { UploadFile } from "antd";
import type {
  CategoryItem,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "../types/category.types";

const toSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
};

export interface CategoryFormModalProps {
  open: boolean;
  initialData?: CategoryItem | null;
  confirmLoading?: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateCategoryPayload | UpdateCategoryPayload) => void;
}

export const CategoryFormModal = ({
  open,
  initialData,
  confirmLoading,
  onCancel,
  onSubmit,
}: CategoryFormModalProps) => {
  const [form] = Form.useForm();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!initialData;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.setFieldsValue({
          name: initialData.name,
          slug: initialData.slug,
          description: initialData.description || "",
          displayOrder: initialData.displayOrder,
          isActive: initialData.isActive,
        });
        setPreviewUrl(initialData.imageUrl || null);
      } else {
        form.resetFields();
        setPreviewUrl(null);
      }
      setCroppedFile(null);
      setCropImageSrc(null);
    }
  }, [open, initialData, form]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditing) {
      const generatedSlug = toSlug(e.target.value);
      form.setFieldValue("slug", generatedSlug);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result as string);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCropComplete = (fileObj: UploadFile) => {
    const file = fileObj.originFileObj as File;
    setCroppedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setCropperOpen(false);
  };

  const handleRemoveImage = () => {
    setCroppedFile(null);
    setPreviewUrl(null);
    setCropImageSrc(null);
  };

  const handleFinish = (values: any) => {
    onSubmit({
      name: values.name.trim(),
      slug: values.slug.trim().toLowerCase(),
      description: values.description ? values.description.trim() : undefined,
      displayOrder: values.displayOrder ?? 0,
      isActive: values.isActive ?? true,
      imageFile: croppedFile ?? undefined,
    });
  };

  return (
    <>
      <Modal
        open={open}
        title={isEditing ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={confirmLoading}
        onCancel={onCancel}
        onOk={() => form.submit()}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          className="mt-4"
          initialValues={{ displayOrder: 0, isActive: true }}
        >
          <Form.Item
            label="Tên danh mục"
            name="name"
            rules={[
              { required: true, whitespace: true, message: "Vui lòng nhập tên danh mục!" },
              { max: 100, message: "Tên danh mục tối đa 100 ký tự!" },
            ]}
          >
            <Input
              id="name"
              placeholder="Ví dụ: iPhone, Mac, iPad, Apple Watch..."
              onChange={handleNameChange}
            />
          </Form.Item>

          <Form.Item
            label="Đường dẫn (Slug)"
            name="slug"
            rules={[
              { required: true, whitespace: true, message: "Vui lòng nhập đường dẫn slug!" },
              { max: 120, message: "Đường dẫn tối đa 120 ký tự!" },
              {
                pattern: /^[a-z0-9-]+$/,
                message: "Đường dẫn chỉ chứa chữ thường, số và dấu gạch nối (-)",
              },
            ]}
          >
            <Input id="slug" placeholder="Ví dụ: iphone, mac, ipad..." />
          </Form.Item>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Hình ảnh danh mục (Tỉ lệ chuẩn 1:1)
            </label>
            <div className="flex items-start gap-4">
              <div
                className="w-24 h-24 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden relative group cursor-pointer"
                onClick={() => {
                  if (previewUrl) setPreviewOpen(true);
                }}
              >
                {previewUrl ? (
                  <>
                    <img
                      src={previewUrl}
                      alt="Xem trước danh mục"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <EyeOutlined className="text-xl" />
                    </div>
                  </>
                ) : (
                  <PictureOutlined className="text-2xl text-slate-300" />
                )}
              </div>

              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  id="categoryImageUploadInput"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex flex-wrap gap-2">
                  <Button
                    id="btnSelectCategoryImage"
                    icon={<UploadOutlined />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {previewUrl ? "Thay đổi ảnh" : "Tải ảnh từ máy"}
                  </Button>

                  {cropImageSrc && (
                    <Button
                      icon={<ScissorOutlined />}
                      onClick={() => setCropperOpen(true)}
                    >
                      Cắt lại
                    </Button>
                  )}

                  {previewUrl && (
                    <Button
                      danger
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={handleRemoveImage}
                    >
                      Xóa ảnh
                    </Button>
                  )}
                </div>

                {croppedFile ? (
                  <Tag color="green" className="m-0">
                    Đã cắt ảnh 1:1 sẵn sàng tải lên
                  </Tag>
                ) : (
                  <span className="text-xs text-slate-500 block">
                    Định dạng hỗ trợ: JPG, PNG, WebP (Tối đa 5MB)
                  </span>
                )}
              </div>
            </div>

            {previewUrl && (
              <Image
                styles={{ root: { display: "none" } }}
                preview={{
                  open: previewOpen,
                  onOpenChange: (open) => setPreviewOpen(open),
                  afterOpenChange: (open) => !open && setPreviewOpen(false),
                }}
                src={previewUrl}
              />
            )}
          </div>

          <Form.Item
            label="Thứ tự hiển thị"
            name="displayOrder"
            rules={[{ required: true, message: "Vui lòng nhập thứ tự hiển thị!" }]}
          >
            <InputNumber id="displayOrder" className="w-full" min={0} placeholder="0" />
          </Form.Item>

          <Form.Item label="Mô tả tóm tắt" name="description">
            <Input.TextArea
              id="description"
              rows={3}
              placeholder="Mô tả ngắn gọn về nhóm danh mục này..."
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item label="Trạng thái kích hoạt" name="isActive" valuePropName="checked">
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm khóa" />
          </Form.Item>
        </Form>
      </Modal>

      <ImageCropperModal
        isOpen={cropperOpen}
        imageSrc={cropImageSrc}
        aspect={1}
        title="Cắt ảnh danh mục (Tỉ lệ 1:1)"
        onCancel={() => setCropperOpen(false)}
        onCropComplete={handleCropComplete}
      />
    </>
  );
};

export default CategoryFormModal;
