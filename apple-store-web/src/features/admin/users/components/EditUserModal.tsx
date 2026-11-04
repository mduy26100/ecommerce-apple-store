import { useEffect } from "react";
import { Modal, Form, Input, message } from "antd";
import { UserOutlined, PhoneOutlined } from "@ant-design/icons";
import { useUpdateUser } from "../hooks/useUsers";
import type { UserItem, UpdateUserPayload } from "../types/user.types";

interface EditUserModalProps {
  open: boolean;
  user: UserItem | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export const EditUserModal = ({ open, user, onCancel, onSuccess }: EditUserModalProps) => {
  const [form] = Form.useForm();
  const { mutate: updateUser, isPending } = useUpdateUser();

  useEffect(() => {
    if (open && user) {
      form.setFieldsValue({
        fullName: user.fullName,
        phoneNumber: user.phoneNumber || "",
      });
    }
  }, [open, user, form]);

  const handleSubmit = (values: any) => {
    if (!user) return;

    const payload: UpdateUserPayload = {
      fullName: values.fullName.trim(),
      phoneNumber: values.phoneNumber ? values.phoneNumber.trim() : undefined,
    };

    updateUser(
      { id: user.id, payload },
      {
        onSuccess: () => {
          message.success("Cập nhật thông tin người dùng thành công!");
          onSuccess();
        },
        onError: (error: any) => {
          const errorMsg =
            error?.response?.data?.error?.message ||
            error?.message ||
            "Cập nhật người dùng thất bại!";
          message.error(errorMsg);
        },
      }
    );
  };

  return (
    <Modal
      open={open}
      title="Chỉnh Sửa Thông Tin Người Dùng"
      okText="Lưu thay đổi"
      cancelText="Hủy"
      confirmLoading={isPending}
      onCancel={onCancel}
      onOk={() => form.submit()}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
        <Form.Item
          name="fullName"
          label="Họ và tên"
          rules={[{ required: true, message: "Vui lòng nhập họ và tên người dùng!" }]}
        >
          <Input
            id="editFullName"
            prefix={<UserOutlined className="text-slate-400 mr-1" />}
            placeholder="Họ và tên"
            className="rounded-lg py-2"
          />
        </Form.Item>

        <Form.Item name="phoneNumber" label="Số điện thoại">
          <Input
            id="editPhoneNumber"
            prefix={<PhoneOutlined className="text-slate-400 mr-1" />}
            placeholder="0912 345 678"
            className="rounded-lg py-2"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditUserModal;

