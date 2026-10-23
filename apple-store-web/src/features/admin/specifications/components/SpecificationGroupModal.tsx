import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber } from "antd";
import type {
  ProductSpecificationGroupDto,
  CreateProductSpecificationGroupRequest,
  UpdateProductSpecificationGroupRequest,
} from "../types/specification.types";

interface SpecificationGroupModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (
    values: CreateProductSpecificationGroupRequest | UpdateProductSpecificationGroupRequest
  ) => void;
  initialValues?: ProductSpecificationGroupDto | null;
  loading?: boolean;
  productId: number;
}

export const SpecificationGroupModal: React.FC<SpecificationGroupModalProps> = ({
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
          name: initialValues.name,
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
          displayOrder: values.displayOrder ?? 1,
        });
      } else {
        onSubmit({
          productId,
          name: values.name,
          displayOrder: values.displayOrder ?? 1,
        });
      }
    } catch {
    }
  };

  return (
    <Modal
      title={isEditing ? "Chỉnh sửa nhóm thông số" : "Thêm nhóm thông số mới"}
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
          label="Tên nhóm thông số"
          rules={[
            { required: true, whitespace: true, message: "Vui lòng nhập tên nhóm thông số" },
          ]}
        >
          <Input placeholder="Ví dụ: Cấu hình, Màn hình, Hiệu năng, Pin & Sạc..." />
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
