import { Form, Input, Button, Alert } from "antd";
import { MailOutlined, LockOutlined, UserOutlined, ShopOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import AuthHeader from "@layouts/AuthLayout/components/AuthHeader";
import type { RegisterRequest } from "../types/auth.types";

export interface RegisterFormProps {
  onSubmit: (values: RegisterRequest) => void;
  isPending: boolean;
  error: { message?: string } | null;
}

export const RegisterForm = ({ onSubmit, isPending, error }: RegisterFormProps) => {
  const [form] = Form.useForm();

  const handleRegister = (values: RegisterRequest) => {
    onSubmit(values);
  };

  return (
    <div className="flex flex-col gap-6 w-full select-none">
      <AuthHeader
        title="Tạo tài khoản quản trị"
        subtitle="Thiết lập tài khoản quản lý và chi nhánh của bạn"
      />

      {error && (
        <Alert
          message={error.message || "Đã xảy ra lỗi khi tạo tài khoản. Vui lòng thử lại!"}
          type="error"
          showIcon
          className="rounded-xl text-xs"
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleRegister}
        requiredMark={false}
        className="flex flex-col gap-4"
      >
        <Form.Item
          label={<span className="text-xs font-semibold text-slate-600">Họ và tên</span>}
          name="fullName"
          rules={[
            { required: true, message: "Vui lòng nhập họ và tên của bạn!" },
            { whitespace: true, message: "Không được chỉ nhập khoảng trắng!" },
          ]}
          className="mb-0"
        >
          <Input
            prefix={<UserOutlined className="text-slate-400 mr-1" />}
            placeholder="Nguyễn Văn A"
            size="large"
            className="rounded-xl text-xs hover:border-slate-300 focus:border-blue-500 py-2.5"
          />
        </Form.Item>

        <Form.Item
          label={<span className="text-xs font-semibold text-slate-600">Tên công ty hoặc Chi nhánh</span>}
          name="companyName"
          rules={[
            { required: true, message: "Vui lòng nhập tên công ty hoặc chi nhánh!" },
            { whitespace: true, message: "Không được chỉ nhập khoảng trắng!" },
          ]}
          className="mb-0"
        >
          <Input
            prefix={<ShopOutlined className="text-slate-400 mr-1" />}
            placeholder="Apple Store Hà Nội"
            size="large"
            className="rounded-xl text-xs hover:border-slate-300 focus:border-blue-500 py-2.5"
          />
        </Form.Item>

        <Form.Item
          label={<span className="text-xs font-semibold text-slate-600">Địa chỉ Email</span>}
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập địa chỉ email!" },
            { type: "email", message: "Email không đúng định dạng!" },
            { whitespace: true, message: "Không được chỉ nhập khoảng trắng!" },
          ]}
          className="mb-0"
        >
          <Input
            prefix={<MailOutlined className="text-slate-400 mr-1" />}
            placeholder="admin@apple-store.com"
            size="large"
            className="rounded-xl text-xs hover:border-slate-300 focus:border-blue-500 py-2.5"
          />
        </Form.Item>

        <Form.Item
          label={<span className="text-xs font-semibold text-slate-600">Mật khẩu</span>}
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

        <Form.Item className="mb-0 mt-2">
          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-semibold rounded-xl text-xs shadow-md shadow-blue-500/10 border-none flex items-center justify-center transition-all duration-150"
          >
            {isPending ? "Đang tạo tài khoản..." : "Đăng ký tài khoản"}
          </Button>
        </Form.Item>
      </Form>

      <div className="text-center text-xxs text-slate-400 font-medium select-none border-t border-slate-100 pt-4 mt-2">
        Đã có tài khoản quản trị?{" "}
        <Link to="/auth/login" className="text-blue-600 hover:underline font-semibold">
          Đăng nhập ngay
        </Link>
      </div>

      <div className="text-center">
        <Link to="/" className="text-xxs text-slate-500 hover:text-blue-600 font-medium">
          &larr; Quay lại trang mua hàng Storefront
        </Link>
      </div>
    </div>
  );
};

export default RegisterForm;
