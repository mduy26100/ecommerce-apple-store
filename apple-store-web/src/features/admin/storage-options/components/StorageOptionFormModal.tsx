import { useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select, Switch } from "antd";
import type {
  StorageOptionItem,
  CreateStorageOptionPayload,
  UpdateStorageOptionPayload,
} from "../types/storage.types";

export interface StorageOptionFormModalProps {
  open: boolean;
  initialData?: StorageOptionItem | null;
  confirmLoading?: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateStorageOptionPayload | UpdateStorageOptionPayload) => void;
}

export const StorageOptionFormModal = ({
  open,
  initialData,
  confirmLoading,
  onCancel,
  onSubmit,
}: StorageOptionFormModalProps) => {
  const [form] = Form.useForm();
  const isEditing = !!initialData;

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.setFieldsValue({
          name: initialData.name,
          capacityValue: initialData.capacityValue,
          unit: initialData.unit || "GB",
          isActive: initialData.isActive,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          unit: "GB",
          isActive: true,
        });
      }
    }
  }, [open, initialData, form]);

  const handleFinish = (values: any) => {
    onSubmit({
      name: values.name.trim(),
      capacityValue: values.capacityValue ? Number(values.capacityValue) : undefined,
      unit: values.unit,
      isActive: values.isActive ?? true,
    });
  };

  return (
    <Modal
      open={open}
      title={isEditing ? "Chỉnh sửa tùy chọn dung lượng" : "Thêm tùy chọn dung lượng"}
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
        initialValues={{ unit: "GB", isActive: true }}
      >
        <Form.Item
          label="Tên hiển thị dung lượng"
          name="name"
          rules={[
            { required: true, whitespace: true, message: "Vui lòng nhập tên dung lượng!" },
            { max: 50, message: "Tên dung lượng tối đa 50 ký tự!" },
          ]}
        >
          <Input id="name" placeholder="Ví dụ: 128GB, 256GB, 512GB, 1TB, 2TB..." />
        </Form.Item>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Form.Item
            label="Giá trị dung lượng (số)"
            name="capacityValue"
            rules={[
              { required: true, message: "Vui lòng nhập giá trị dung lượng!" },
              { type: "number", min: 1, message: "Giá trị dung lượng phải lớn hơn 0!" },
            ]}
          >
            <InputNumber
              id="capacityValue"
              className="w-full"
              placeholder="Ví dụ: 256, 512, 1024"
              min={1}
            />
          </Form.Item>

          <Form.Item
            label="Đơn vị tính"
            name="unit"
            rules={[{ required: true, message: "Vui lòng chọn đơn vị tính!" }]}
          >
            <Select
              id="unit"
              options={[
                { value: "GB", label: "GB (Gigabyte)" },
                { value: "TB", label: "TB (Terabyte)" },
              ]}
            />
          </Form.Item>
        </div>

        <Form.Item label="Trạng thái kích hoạt" name="isActive" valuePropName="checked">
          <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm khóa" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StorageOptionFormModal;
