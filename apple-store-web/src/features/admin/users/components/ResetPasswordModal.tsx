import { useEffect } from "react";
import { Modal, Form, Input, message, Alert } from "antd";
import { KeyOutlined, LockOutlined } from "@ant-design/icons";
import { useResetPassword } from "../hooks/useUsers";
import type { UserItem, ResetPasswordPayload } from "../types/user.types";

interface ResetPasswordModalProps {
  open: boolean;
  user: UserItem | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export const ResetPasswordModal = ({ open, user, onCancel, onSuccess }: ResetPasswordModalProps) => {
  const [form] = Form.useForm();
  const { mutate: resetPassword, isPending } = useResetPassword();

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleSubmit = (values: any) => {
    if (!user) return;

    const payload: ResetPasswordPayload = {
      newPassword: values.newPassword,
      confirmPassword: values.confirmPassword,
    };

    resetPassword(
      { id: user.id, payload },
      {
        onSuccess: () => {
          message.success("Đặt lại mật khẩu cho người dùng thành công!");
          onSuccess();
        },
        onError: (error: any) => {
          const errorMsg =
            error?.response?.data?.error?.message ||
            error?.message ||
            "Đặt lại mật khẩu thất bại!";
          message.error(errorMsg);
        },
      }
    );
  };

  return (
    <Modal
      open={open}
      title={
        <div className="flex items-center gap-2 text-blue-600">
          <KeyOutlined />
          <span>Đặt Lại Mật Khẩu Người Dùng</span>
        </div>
      }
      okText="Xác nhận đổi"
      cancelText="Hủy"
      confirmLoading={isPending}
      onCancel={onCancel}
      onOk={() => form.submit()}
      destroyOnClose
    >
      <Alert
        message={`Tài khoản: ${user?.fullName || user?.email || ""}`}
        description="Mật khẩu mới sẽ có hiệu lực ngay lập tức và toàn bộ các phiên đăng nhập hiện tại của người dùng này sẽ bị thu hồi an toàn."
        type="info"
        showIcon
        className="my-3 text-xs"
      />

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="newPassword"
          label="Mật khẩu mới"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới!" },
            { min: 6, message: "Mật khẩu tối thiểu 6 ký tự!" },
          ]}
        >
          <Input.Password
            id="resetNewPassword"
            prefix={<LockOutlined className="text-slate-400 mr-1" />}
            placeholder="Tối thiểu 6 ký tự"
            className="rounded-lg py-2"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu mới"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu mới!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
              },
            }),
          ]}
        >
          <Input.Password
            id="resetConfirmPassword"
            prefix={<LockOutlined className="text-slate-400 mr-1" />}
            placeholder="Nhập lại mật khẩu mới"
            className="rounded-lg py-2"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ResetPasswordModal;

