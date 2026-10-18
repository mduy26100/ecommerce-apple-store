import { useEffect } from "react";
import { Modal, Form, Input, InputNumber, Switch, Select } from "antd";
import { useCategoriesAll } from "@features/admin/categories";
import type {
  ProductItem,
  CreateProductPayload,
  UpdateProductPayload,
} from "../types/product.types";

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

export interface ProductFormModalProps {
  open: boolean;
  initialData?: ProductItem | null;
  confirmLoading?: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateProductPayload | UpdateProductPayload) => void;
}

export const ProductFormModal = ({
  open,
  initialData,
  confirmLoading,
  onCancel,
  onSubmit,
}: ProductFormModalProps) => {
  const [form] = Form.useForm();
  const isEditing = !!initialData;
  const { data: categories = [], isLoading: isLoadingCategories } = useCategoriesAll();

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.setFieldsValue({
          categoryId: initialData.categoryId,
          name: initialData.name,
          slug: initialData.slug,
          modelCode: initialData.modelCode,
          shortDescription: initialData.shortDescription,
          warrantyMonths: initialData.warrantyMonths ?? 12,
          isActive: initialData.isActive,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          warrantyMonths: 12,
          isActive: true,
        });
      }
    }
  }, [open, initialData, form]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditing) {
      const generatedSlug = toSlug(e.target.value);
      form.setFieldValue("slug", generatedSlug);
    }
  };

  const handleFinish = (values: any) => {
    onSubmit({
      categoryId: values.categoryId,
      name: values.name.trim(),
      slug: values.slug.trim().toLowerCase(),
      modelCode: values.modelCode ? values.modelCode.trim() : undefined,
      shortDescription: values.shortDescription ? values.shortDescription.trim() : undefined,
      description: values.description ? values.description.trim() : undefined,
      warrantyMonths: values.warrantyMonths,
      isActive: values.isActive ?? true,
    });
  };

  return (
    <Modal
      open={open}
      title={isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
      okText="Lưu"
      cancelText="Hủy"
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      onOk={() => form.submit()}
      destroyOnHidden
      width={640}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="mt-4"
        initialValues={{ warrantyMonths: 12, isActive: true }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <Form.Item
            label="Danh mục"
            name="categoryId"
            rules={[{ required: true, message: "Vui lòng chọn danh mục sản phẩm!" }]}
          >
            <Select
              id="categoryId"
              placeholder="Chọn danh mục"
              loading={isLoadingCategories}
              options={categories.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Mã model thiết bị"
            name="modelCode"
            rules={[{ max: 50, message: "Mã model tối đa 50 ký tự!" }]}
          >
            <Input id="modelCode" placeholder="Ví dụ: A3106, MYD82VN/A..." />
          </Form.Item>
        </div>

        <Form.Item
          label="Tên sản phẩm"
          name="name"
          rules={[
            { required: true, whitespace: true, message: "Vui lòng nhập tên sản phẩm!" },
            { max: 200, message: "Tên sản phẩm tối đa 200 ký tự!" },
          ]}
        >
          <Input
            id="name"
            placeholder="Ví dụ: iPhone 16 Pro Max, MacBook Pro 14 M3..."
            onChange={handleNameChange}
          />
        </Form.Item>

        <Form.Item
          label="Đường dẫn (Slug)"
          name="slug"
          rules={[
            { required: true, whitespace: true, message: "Vui lòng nhập slug sản phẩm!" },
            { max: 250, message: "Đường dẫn tối đa 250 ký tự!" },
            {
              pattern: /^[a-z0-9-]+$/,
              message: "Đường dẫn chỉ chứa chữ thường, số và dấu gạch nối (-)",
            },
          ]}
        >
          <Input id="slug" placeholder="Ví dụ: iphone-16-pro-max..." />
        </Form.Item>

        <Form.Item
          label="Thời gian bảo hành (tháng)"
          name="warrantyMonths"
          rules={[{ required: true, message: "Vui lòng nhập thời hạn bảo hành!" }]}
        >
          <InputNumber id="warrantyMonths" className="w-full" min={0} max={60} placeholder="12" />
        </Form.Item>

        <Form.Item label="Mô tả tóm tắt" name="shortDescription">
          <Input.TextArea
            id="shortDescription"
            rows={2}
            placeholder="Mô tả điểm nhấn chính của sản phẩm..."
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item label="Mô tả chi tiết" name="description">
          <Input.TextArea
            id="description"
            rows={4}
            placeholder="Mô tả kỹ hơn về tính năng, cấu hình..."
          />
        </Form.Item>

        <Form.Item label="Trạng thái kích hoạt" name="isActive" valuePropName="checked">
          <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm khóa" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProductFormModal;
