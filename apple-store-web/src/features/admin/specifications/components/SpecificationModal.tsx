import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber } from "antd";
import type {
  ProductSpecificationDto,
  CreateProductSpecificationRequest,
  UpdateProductSpecificationRequest,
} from "../types/specification.types";

interface SpecificationModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (
    values: CreateProductSpecificationRequest | UpdateProductSpecificationRequest
  ) => void;
  initialValues?: ProductSpecificationDto | null;
  loading?: boolean;
  groupId: number;
  groupName?: string;
}

export const SpecificationModal: React.FC<SpecificationModalProps> = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
  loading = false,
  groupId,
  groupName,
}) => {
  const [form] = Form.useForm();
  const isEditing = Boolean(initialValues);

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue({
          name: initialValues.name,
          value: initialValues.value,
          unit: initialValues.unit,
          displayOrder: initialValues.displayOrder,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          displayOrder: 1,
        });
      }
    }
  }, [open, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (isEditing) {
        onSubmit({
          name: values.name,
          value: values.value,
          unit: values.unit,
          displayOrder: values.displayOrder ?? 1,
        });
      } else {
        onSubmit({
          groupId,
          name: values.name,
          value: values.value,
          unit: values.unit,
          displayOrder: values.displayOrder ?? 1,
        });
      }
    } catch {
    }
  };

  return (
    <Modal
      title={
        <div>
          <span>{isEditing ? "Chỉnh sửa thông số kỹ thuật" : "Thêm thông số kỹ thuật mới"}</span>
          {groupName && (
            <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              Nhóm: {groupName}
            </span>
          )}
        </div>
      }
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
          name="name"
          label="Tên thông số"
          rules={[
            { required: true, whitespace: true, message: "Vui lòng nhập tên thông số" },
          ]}
        >
          <Input placeholder="Ví dụ: Chip xử lý, Kích thước màn hình, Dung lượng pin..." />
        </Form.Item>

        <Form.Item
          name="value"
          label="Giá trị thông số"
          rules={[
            { required: true, whitespace: true, message: "Vui lòng nhập giá trị thông số" },
          ]}
        >
          <Input.TextArea
            rows={3}
            placeholder="Ví dụ: Apple A18 Pro 6 lõi, 6.3 inch Super Retina XDR OLED..."
          />
        </Form.Item>

        <Form.Item name="unit" label="Đơn vị tính (nếu có)">
          <Input placeholder="Ví dụ: inch, GB, mAh, W, g..." />
        </Form.Item>

        <Form.Item
          name="displayOrder"
          label="Thứ tự hiển thị"
          rules={[{ required: true, message: "Vui lòng nhập thứ tự hiển thị" }]}
        >
          <InputNumber min={1} className="w-full" placeholder="1" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
