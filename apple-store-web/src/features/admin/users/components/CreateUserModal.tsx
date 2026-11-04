import { useEffect } from "react";
import { Modal, Form, Input, Row, Col, message } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined } from "@ant-design/icons";
import { useCreateUser } from "../hooks/useUsers";
import type { CreateUserPayload } from "../types/user.types";

interface CreateUserModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export const CreateUserModal = ({ open, onCancel, onSuccess }: CreateUserModalProps) => {
  const [form] = Form.useForm();
  const { mutate: createUser, isPending } = useCreateUser();

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleSubmit = (values: any) => {
    const payload: CreateUserPayload = {
      fullName: values.fullName.trim(),
      email: values.email.trim().toLowerCase(),
      userName: values.userName ? values.userName.trim() : undefined,
      phoneNumber: values.phoneNumber ? values.phoneNumber.trim() : undefined,
      password: values.password,
      confirmPassword: values.confirmPassword,
    };

    createUser(payload, {
      onSuccess: () => {
        message.success("Thêm người dùng mới thành công!");
        form.resetFields();
        onSuccess();
      },
      onError: (error: any) => {
        const errorMsg =
          error?.response?.data?.error?.message ||
          error?.message ||
          "Thêm người dùng thất bại!";
        message.error(errorMsg);
      },
    });
  };

  return (
    <Modal
      open={open}
      title="Thêm Người Dùng Mới"
      okText="Tạo tài khoản"
      cancelText="Hủy"
      confirmLoading={isPending}
      onCancel={onCancel}
      onOk={() => form.submit()}
      destroyOnClose
      width={560}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="fullName"
              label="Họ và tên"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên người dùng!" }]}
            >
              <Input
                id="createFullName"
                prefix={<UserOutlined className="text-slate-400 mr-1" />}
                placeholder="Nguyễn Văn A"
                className="rounded-lg py-2"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="email"
              label="Địa chỉ Email"
              rules={[
                { required: true, message: "Vui lòng nhập địa chỉ email!" },
                { type: "email", message: "Địa chỉ email không đúng định dạng!" },
              ]}
            >
              <Input
                id="createEmail"
                prefix={<MailOutlined className="text-slate-400 mr-1" />}
                placeholder="example@apple-store.com"
                className="rounded-lg py-2"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="userName" label="Tên đăng nhập (Tùy chọn)">
              <Input
                id="createUserName"
                placeholder="Để trống sẽ dùng Email"
                className="rounded-lg py-2"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="phoneNumber" label="Số điện thoại (Tùy chọn)">
              <Input
                id="createPhoneNumber"
                prefix={<PhoneOutlined className="text-slate-400 mr-1" />}
                placeholder="0912 345 678"
                className="rounded-lg py-2"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="password"
              label="Mật khẩu khởi tạo"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu!" },
                { min: 6, message: "Mật khẩu tối thiểu 6 ký tự!" },
              ]}
            >
              <Input.Password
                id="createPassword"
                prefix={<LockOutlined className="text-slate-400 mr-1" />}
                placeholder="Tối thiểu 6 ký tự"
                className="rounded-lg py-2"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="confirmPassword"
              label="Xác nhận mật khẩu"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                  },
                }),
              ]}
            >
              <Input.Password
                id="createConfirmPassword"
                prefix={<LockOutlined className="text-slate-400 mr-1" />}
                placeholder="Nhập lại mật khẩu"
                className="rounded-lg py-2"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CreateUserModal;

