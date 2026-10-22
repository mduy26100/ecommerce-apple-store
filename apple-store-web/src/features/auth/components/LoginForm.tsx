import { Form, Input, Button, Checkbox, Alert } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import AuthHeader from "@layouts/AuthLayout/components/AuthHeader";
import type { LoginRequest } from "../types/auth.types";

export interface LoginFormProps {
  onSubmit: (values: LoginRequest) => void;
  isPending: boolean;
  error: { message?: string } | null;
  isAdmin?: boolean;
}

export const LoginForm = ({ onSubmit, isPending, error, isAdmin = false }: LoginFormProps) => {
  const [form] = Form.useForm();

  const handleLogin = (values: LoginRequest) => {
    onSubmit(values);
  };

  return (
    <div className="flex flex-col gap-6 w-full select-none">
      <AuthHeader
        title={isAdmin ? "Cổng Quản Trị Hệ Thống" : "Đăng Nhập Khách Hàng"}
        subtitle={
          isAdmin
            ? "Đăng nhập dành riêng cho Quản trị viên cấp cao (SuperAdmin)"
            : "Vui lòng đăng nhập thông tin tài khoản mua sắm của bạn"
        }
      />

      {error && (
        <Alert
          message={error.message || "Đã xảy ra lỗi xác thực. Vui lòng thử lại!"}
          type="error"
          showIcon
          className="rounded-xl text-xs"
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleLogin}
        requiredMark={false}
        className="flex flex-col gap-4"
      >
        <Form.Item
          label={<span className="text-xs font-semibold text-slate-600">Tên đăng nhập hoặc Email</span>}
          name="identifier"
          rules={[
            { required: true, message: "Vui lòng nhập tên đăng nhập hoặc email!" },
            { whitespace: true, message: "Không được chỉ nhập khoảng trắng!" },
          ]}
          className="mb-0"
        >
          <Input
            prefix={<MailOutlined className="text-slate-400 mr-1" />}
            placeholder={isAdmin ? "admin@urbanstitch.vn" : "username hoặc email..."}
            size="large"
            className="rounded-xl text-xs hover:border-slate-300 focus:border-blue-500 py-2.5"
          />
        </Form.Item>

        <Form.Item
          label={
            <div className="flex justify-between items-center w-full">
              <span className="text-xs font-semibold text-slate-600">Mật khẩu</span>
              <a href="#forgot" className="text-xxs text-blue-600 hover:underline">
                Quên mật khẩu?
              </a>
            </div>
          }
          name="password"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu!" },
            { min: 6, message: "Mật khẩu phải chứa ít nhất 6 ký tự!" },
          ]}
          className="mb-0"
        >
          <Input.Password
            prefix={<LockOutlined className="text-slate-400 mr-1" />}
            placeholder="••••••••"
            size="large"
            className="rounded-xl text-xs hover:border-slate-300 focus:border-blue-500 py-2.5"
          />
        </Form.Item>

        <div className="flex items-center justify-between text-xxs font-medium text-slate-500 mt-1 select-none">
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox className="text-xxs text-slate-500">Ghi nhớ đăng nhập trên thiết bị này</Checkbox>
          </Form.Item>
        </div>

        <Form.Item className="mb-0 mt-2">
          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-semibold rounded-xl text-xs shadow-md shadow-blue-500/10 border-none flex items-center justify-center transition-all duration-150"
          >
            {isPending ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </Form.Item>
      </Form>

      {!isAdmin && (
        <div className="text-center text-xxs text-slate-400 font-medium select-none border-t border-slate-100 pt-4 mt-2">
          Chưa có tài khoản khách hàng?{" "}
          <Link to="/register" className="text-blue-600 hover:underline font-semibold">
            Đăng ký ngay
          </Link>
        </div>
      )}

      <div className="text-center">
        <Link to="/" className="text-xxs text-slate-500 hover:text-blue-600 font-medium">
          &larr; Quay lại trang mua hàng Storefront
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;
