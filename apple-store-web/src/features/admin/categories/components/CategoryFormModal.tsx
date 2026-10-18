import { useEffect } from "react";
import { Modal, Form, Input, InputNumber, Switch } from "antd";
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
  const isEditing = !!initialData;

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.setFieldsValue({
          name: initialData.name,
          slug: initialData.slug,
          description: initialData.description,
          imageUrl: initialData.imageUrl,
          displayOrder: initialData.displayOrder,
          isActive: initialData.isActive,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          displayOrder: 0,
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
      name: values.name.trim(),
      slug: values.slug.trim().toLowerCase(),
      description: values.description ? values.description.trim() : undefined,
      imageUrl: values.imageUrl ? values.imageUrl.trim() : undefined,
      displayOrder: values.displayOrder ?? 0,
      isActive: values.isActive ?? true,
    });
  };

  return (
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

        <Form.Item label="Đường dẫn ảnh biểu trưng" name="imageUrl">
          <Input id="imageUrl" placeholder="https://example.com/images/iphone.png" />
        </Form.Item>

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
  );
};

export default CategoryFormModal;
