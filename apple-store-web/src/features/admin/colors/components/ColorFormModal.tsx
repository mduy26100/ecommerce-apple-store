import { useEffect } from "react";
import { Modal, Form, Input, Switch, ColorPicker } from "antd";
import type { ColorPickerProps } from "antd";
import type { ColorItem, CreateColorPayload, UpdateColorPayload } from "../types/colors.types";

export interface ColorFormModalProps {
  open: boolean;
  initialData?: ColorItem | null;
  confirmLoading?: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateColorPayload | UpdateColorPayload) => void;
}

export const ColorFormModal = ({
  open,
  initialData,
  confirmLoading,
  onCancel,
  onSubmit,
}: ColorFormModalProps) => {
  const [form] = Form.useForm();
  const isEditing = !!initialData;

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.setFieldsValue({
          name: initialData.name,
          code: initialData.code,
          hexCode: initialData.hexCode || "#000000",
          isActive: initialData.isActive,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          hexCode: "#000000",
          isActive: true,
        });
      }
    }
  }, [open, initialData, form]);

  const handleFinish = (values: any) => {
    onSubmit({
      name: values.name.trim(),
      code: values.code.trim().toUpperCase(),
      hexCode: values.hexCode ? values.hexCode.trim() : undefined,
      isActive: values.isActive ?? true,
    });
  };

  const handleColorChange: ColorPickerProps["onChange"] = (color) => {
    form.setFieldValue("hexCode", color.toHexString().toUpperCase());
  };

  return (
    <Modal
      open={open}
      title={isEditing ? "Chỉnh sửa màu sắc" : "Thêm màu sắc mới"}
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
        initialValues={{ isActive: true, hexCode: "#000000" }}
      >
        <Form.Item
          label="Tên màu sắc"
          name="name"
          rules={[
            { required: true, whitespace: true, message: "Vui lòng nhập tên màu sắc!" },
            { max: 100, message: "Tên màu sắc tối đa 100 ký tự!" },
          ]}
        >
          <Input id="name" placeholder="Ví dụ: Titan Sa Mạc, Xanh Titan, Đen bóng..." />
        </Form.Item>

        <Form.Item
          label="Mã nội bộ (Code)"
          name="code"
          rules={[
            { required: true, whitespace: true, message: "Vui lòng nhập mã nội bộ!" },
            { max: 50, message: "Mã nội bộ tối đa 50 ký tự!" },
          ]}
        >
          <Input id="code" placeholder="Ví dụ: TITAN_DESERT, SPACE_BLACK..." />
        </Form.Item>

        <Form.Item label="Mã màu Hex" required>
          <div className="flex items-center gap-3">
            <Form.Item
              name="hexCode"
              noStyle
              rules={[
                {
                  pattern: /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
                  message: "Mã màu Hex không hợp lệ (Ví dụ: #C4A482)!",
                },
              ]}
            >
              <Input id="hexCode" placeholder="#C4A482" className="font-mono" />
            </Form.Item>
            <ColorPicker
              value={form.getFieldValue("hexCode") || "#000000"}
              onChange={handleColorChange}
              showText
            />
          </div>
        </Form.Item>

        <Form.Item label="Trạng thái kích hoạt" name="isActive" valuePropName="checked">
          <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm khóa" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ColorFormModal;
