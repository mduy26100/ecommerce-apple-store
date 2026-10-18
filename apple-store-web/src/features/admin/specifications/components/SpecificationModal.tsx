import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber, AutoComplete } from "antd";
import type {
  ProductSpecificationDto,
  CreateProductSpecificationRequest,
  UpdateProductSpecificationRequest,
} from "../types/specification.types";

interface SpecificationModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateProductSpecificationRequest | UpdateProductSpecificationRequest) => void;
  initialValues?: ProductSpecificationDto | null;
  loading?: boolean;
  productId: number;
}

const COMMON_GROUPS = [
  { value: "Màn hình" },
  { value: "Camera & Quay phim" },
  { value: "Vi xử lý & Đồ họa" },
  { value: "RAM & Bộ nhớ" },
  { value: "Pin & Sạc" },
  { value: "Kết nối" },
  { value: "Thiết kế & Trọng lượng" },
  { value: "Tiện ích & Hệ điều hành" },
];

export const SpecificationModal: React.FC<SpecificationModalProps> = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
  loading = false,
  productId,
}) => {
  const [form] = Form.useForm();
  const isEditing = Boolean(initialValues);

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue({
          groupName: initialValues.groupName,
          name: initialValues.name,
          value: initialValues.value,
          unit: initialValues.unit,
          displayOrder: initialValues.displayOrder,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          displayOrder: 0,
        });
      }
    }
  }, [open, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (isEditing) {
        onSubmit({
          groupName: values.groupName,
          name: values.name,
          value: values.value,
          unit: values.unit,
          displayOrder: values.displayOrder ?? 0,
        });
      } else {
        onSubmit({
          productId,
          groupName: values.groupName,
          name: values.name,
          value: values.value,
          unit: values.unit,
          displayOrder: values.displayOrder ?? 0,
        });
      }
    } catch {
    }
  };

  return (
    <Modal
      title={isEditing ? "Chỉnh sửa thông số kỹ thuật" : "Thêm thông số kỹ thuật mới"}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      okText={isEditing ? "Cập nhật" : "Thêm mới"}
      cancelText="Hủy"
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          name="groupName"
          label="Nhóm thông số"
          rules={[{ required: true, message: "Vui lòng nhập nhóm thông số" }]}
        >
          <AutoComplete
            options={COMMON_GROUPS}
            placeholder="Ví dụ: Màn hình, Vi xử lý, Pin & Sạc..."
            filterOption={(inputValue, option) =>
              (option?.value ?? "").toLowerCase().includes(inputValue.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item
          name="name"
          label="Tên thông số"
          rules={[{ required: true, message: "Vui lòng nhập tên thông số" }]}
        >
          <Input placeholder="Ví dụ: Kích thước màn hình, Chip xử lý..." />
        </Form.Item>

        <Form.Item
          name="value"
          label="Giá trị thông số"
          rules={[{ required: true, message: "Vui lòng nhập giá trị thông số" }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="Ví dụ: 6.3 inch Super Retina XDR OLED, 120Hz ProMotion..."
          />
        </Form.Item>

        <Form.Item name="unit" label="Đơn vị tính (nếu có)">
          <Input placeholder="Ví dụ: inch, GB, mAh, W..." />
        </Form.Item>

        <Form.Item
          name="displayOrder"
          label="Thứ tự hiển thị"
          rules={[{ required: true, message: "Vui lòng nhập thứ tự hiển thị" }]}
        >
          <InputNumber min={0} className="w-full" placeholder="0" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
