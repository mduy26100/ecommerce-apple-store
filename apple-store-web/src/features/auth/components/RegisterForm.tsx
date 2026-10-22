import { Form, Input, Button, Alert, Row, Col } from "antd";
import { MailOutlined, LockOutlined, UserOutlined, PhoneOutlined, IdcardOutlined } from "@ant-design/icons";
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
        title="Đăng Ký Tài Khoản Khách Hàng"
        subtitle="Tạo tài khoản để trải nghiệm dịch vụ và bảo hành chính hãng Apple"
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
        className="flex flex-col gap-3.5"
      >
        <Row gutter={12}>
          <Col xs={24} sm={14}>
            <Form.Item
              label={<span className="text-xs font-semibold text-slate-600">Họ và tên đệm</span>}
              name="lastName"
              rules={[
                { required: true, message: "Vui lòng nhập họ và tên đệm!" },
                { whitespace: true, message: "Không được chỉ nhập khoảng trắng!" },
              ]}
              className="mb-0"
            >
              <Input
                prefix={<UserOutlined className="text-slate-400 mr-1" />}
                placeholder="Nguyễn Văn"
                size="large"
                className="rounded-xl text-xs hover:border-slate-300 focus:border-blue-500 py-2.5"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={10}>
            <Form.Item
              label={<span className="text-xs font-semibold text-slate-600">Tên</span>}
              name="firstName"
              rules={[
                { required: true, message: "Vui lòng nhập tên!" },
                { whitespace: true, message: "Không được chỉ nhập khoảng trắng!" },
              ]}
              className="mb-0"
            >
              <Input
                placeholder="An"
                size="large"
                className="rounded-xl text-xs hover:border-slate-300 focus:border-blue-500 py-2.5"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label={<span className="text-xs font-semibold text-slate-600">Tên đăng nhập</span>}
          name="userName"
          rules={[
            { required: true, message: "Vui lòng nhập tên đăng nhập!" },
            { min: 3, message: "Tên đăng nhập tối thiểu 3 ký tự!" },
            { whitespace: true, message: "Không được chỉ nhập khoảng trắng!" },
          ]}
          className="mb-0"
        >
          <Input
            prefix={<IdcardOutlined className="text-slate-400 mr-1" />}
            placeholder="nguyenvanan"
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
            placeholder="an.nguyen@example.com"
            size="large"
            className="rounded-xl text-xs hover:border-slate-300 focus:border-blue-500 py-2.5"
          />
        </Form.Item>

        <Form.Item
          label={<span className="text-xs font-semibold text-slate-600">Số điện thoại</span>}
          name="phoneNumber"
          rules={[
            { required: true, message: "Vui lòng nhập số điện thoại!" },
            { whitespace: true, message: "Không được chỉ nhập khoảng trắng!" },
          ]}
          className="mb-0"
        >
          <Input
            prefix={<PhoneOutlined className="text-slate-400 mr-1" />}
            placeholder="0912 345 678"
            size="large"
            className="rounded-xl text-xs hover:border-slate-300 focus:border-blue-500 py-2.5"
          />
        </Form.Item>

        <Row gutter={12}>
          <Col xs={24} sm={12}>
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
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label={<span className="text-xs font-semibold text-slate-600">Nhập lại mật khẩu</span>}
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Vui lòng nhập lại mật khẩu!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Mật khẩu nhập lại không khớp!"));
                  },
                }),
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
          </Col>
        </Row>

        <Form.Item className="mb-0 mt-3">
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

      <div className="text-center text-xxs text-slate-400 font-medium select-none border-t border-slate-100 pt-4 mt-1">
        Đã có tài khoản?{" "}
        <Link to="/login" className="text-blue-600 hover:underline font-semibold">
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
