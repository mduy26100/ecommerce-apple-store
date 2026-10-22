import { useState } from "react";
import { Card, Form, Input, Button, Row, Col, Avatar, Tag, Divider, message } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  KeyOutlined,
  LockOutlined,
  ShoppingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore, useLogout, AUTH_STATUS } from "@features/auth";
import { api } from "@core/api/axios.config";

export const StorefrontProfilePage = () => {
  const { user, setAuth, accessToken, status } = useAuthStore();
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm] = Form.useForm();

  const handleUpdateProfile = async (values: { firstName?: string; lastName?: string; phoneNumber?: string }) => {
    try {
      setUpdatingProfile(true);
      await api.put("/api/auth/profile", {
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber,
        fullName: `${values.lastName || ""} ${values.firstName || ""}`.trim(),
      });

      if (accessToken && user) {
        setAuth(accessToken, {
          ...user,
          firstName: values.firstName,
          lastName: values.lastName,
          fullName: `${values.lastName || ""} ${values.firstName || ""}`.trim(),
          phoneNumber: values.phoneNumber,
        });
      }

      message.success("Cập nhật thông tin cá nhân thành công!");
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error?.message || error?.message || "Cập nhật thông tin thất bại!";
      message.error(errorMsg);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (values: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    try {
      setChangingPassword(true);
      await api.post("/api/auth/change-password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });

      message.success("Đổi mật khẩu thành công!");
      passwordForm.resetFields();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error?.message || error?.message || "Đổi mật khẩu thất bại. Vui lòng thử lại!";
      message.error(errorMsg);
    } finally {
      setChangingPassword(false);
    }
  };

  if (status === AUTH_STATUS.CHECKING_AUTH) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <span className="text-xs text-slate-500">Đang tải thông tin...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Vui lòng đăng nhập để xem thông tin tài khoản</h2>
        <Button type="primary" onClick={() => navigate("/login")} className="bg-blue-600 rounded-xl h-10 px-6 font-semibold">
          Đăng nhập ngay
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 select-none">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <span className="text-xxs font-bold text-blue-600 uppercase tracking-widest">TÀI KHOẢN CỦA TÔI</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Hồ Sơ Khách Hàng</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/" className="text-xs font-semibold text-slate-500 hover:text-blue-600">
            &larr; Tiếp tục mua sắm
          </Link>
        </div>
      </div>

      <Row gutter={[24, 24]} className="items-stretch">
        <Col xs={24} lg={8} className="flex flex-col">
          <Card
            className="border-slate-100 shadow-xs rounded-2xl text-center h-full flex flex-col"
            styles={{
              body: {
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "32px 24px",
              },
            }}
          >
            <div>
              <div className="relative inline-block mb-4 mx-auto">
                <Avatar
                  size={100}
                  icon={<UserOutlined />}
                  className="bg-blue-600 text-white font-bold text-3xl border-4 border-blue-50 shadow-sm"
                >
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : (user.userName ? user.userName.charAt(0).toUpperCase() : "U")}
                </Avatar>
              </div>

              <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                {user.fullName || user.userName || "Khách Hàng Apple"}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">{user.email}</p>

              <div className="mt-3 flex justify-center gap-1.5">
                <Tag color="cyan" className="rounded-full text-xxs px-3 py-0.5 font-medium border-none">
                  Thành viên
                </Tag>
                <Tag color="green" className="rounded-full text-xxs px-3 py-0.5 font-medium border-none">
                  Đã kích hoạt
                </Tag>
              </div>
            </div>

            <div className="my-auto py-6">
              <Divider className="my-4 border-slate-100" />
              <div className="space-y-4 text-xs text-left px-2">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                  <span className="text-slate-400 font-medium">Tên đăng nhập:</span>
                  <span className="font-semibold text-slate-700">@{user.userName || user.email?.split("@")[0]}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                  <span className="text-slate-400 font-medium">Số điện thoại:</span>
                  <span className="font-semibold text-slate-700">{user.phoneNumber || "Chưa cập nhật"}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                  <span className="text-slate-400 font-medium">Quyền hạn:</span>
                  <span className="font-semibold text-blue-600">Khách hàng</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-slate-400 font-medium">Trạng thái:</span>
                  <span className="font-semibold text-emerald-600">Đang hoạt động</span>
                </div>
              </div>
              <Divider className="my-4 border-slate-100" />
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Button
                icon={<ShoppingOutlined />}
                onClick={() => message.info("Tính năng xem lịch sử đơn hàng đang được cập nhật!")}
                className="w-full h-11 rounded-xl text-xs font-semibold border-slate-200 hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                Lịch sử mua hàng
              </Button>
              <Button
                danger
                icon={<LogoutOutlined />}
                onClick={() => logout()}
                className="w-full h-11 rounded-xl text-xs font-semibold border-rose-200 bg-rose-50/40 hover:bg-rose-50 text-rose-600 transition-colors"
              >
                Đăng xuất tài khoản
              </Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <div className="flex flex-col gap-6">
            <Card
              className="border-slate-100 shadow-xs rounded-2xl"
              title={<span className="text-sm font-bold text-slate-800">Thông Tin Cá Nhân &amp; Nhận Hàng</span>}
            >
              <Form
                layout="vertical"
                initialValues={{
                  lastName: user.lastName || "",
                  firstName: user.firstName || "",
                  email: user.email || "",
                  phoneNumber: user.phoneNumber || "",
                }}
                onFinish={handleUpdateProfile}
              >
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={<span className="text-xs font-semibold text-slate-600">Họ và tên đệm</span>}
                      name="lastName"
                      rules={[{ required: true, message: "Vui lòng nhập họ và tên đệm!" }]}
                    >
                      <Input className="rounded-xl py-2 text-xs" placeholder="Nguyễn Văn" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={<span className="text-xs font-semibold text-slate-600">Tên</span>}
                      name="firstName"
                      rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
                    >
                      <Input className="rounded-xl py-2 text-xs" placeholder="An" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item label={<span className="text-xs font-semibold text-slate-600">Địa chỉ Email</span>} name="email">
                      <Input prefix={<MailOutlined className="text-slate-400 mr-1" />} className="rounded-xl py-2 text-xs bg-slate-50 cursor-not-allowed" disabled />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={<span className="text-xs font-semibold text-slate-600">Số điện thoại liên hệ</span>}
                      name="phoneNumber"
                    >
                      <Input prefix={<PhoneOutlined className="text-slate-400 mr-1" />} className="rounded-xl py-2 text-xs" placeholder="0912 345 678" />
                    </Form.Item>
                  </Col>
                </Row>

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={updatingProfile}
                  className="bg-blue-600 hover:bg-blue-700 font-semibold text-xs rounded-xl h-10 px-6 mt-1 border-none shadow-xs"
                >
                  Lưu thay đổi thông tin
                </Button>
              </Form>
            </Card>

            <Card
              className="border-slate-100 shadow-xs rounded-2xl"
              title={<span className="text-sm font-bold text-slate-800">Đổi Mật Khẩu Bảo Mật</span>}
            >
              <Form form={passwordForm} layout="vertical" onFinish={handleChangePassword}>
                <Form.Item
                  label={<span className="text-xs font-semibold text-slate-600">Mật khẩu hiện tại</span>}
                  name="currentPassword"
                  rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại!" }]}
                >
                  <Input.Password prefix={<KeyOutlined className="text-slate-400 mr-1" />} className="rounded-xl py-2 text-xs" placeholder="••••••••" />
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={<span className="text-xs font-semibold text-slate-600">Mật khẩu mới</span>}
                      name="newPassword"
                      rules={[
                        { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                        { min: 6, message: "Mật khẩu tối thiểu 6 ký tự!" },
                      ]}
                    >
                      <Input.Password prefix={<LockOutlined className="text-slate-400 mr-1" />} className="rounded-xl py-2 text-xs" placeholder="••••••••" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={<span className="text-xs font-semibold text-slate-600">Xác nhận mật khẩu mới</span>}
                      name="confirmPassword"
                      dependencies={["newPassword"]}
                      rules={[
                        { required: true, message: "Vui lòng xác nhận lại mật khẩu!" },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue("newPassword") === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error("Mật khẩu nhập lại không khớp!"));
                          },
                        }),
                      ]}
                    >
                      <Input.Password prefix={<LockOutlined className="text-slate-400 mr-1" />} className="rounded-xl py-2 text-xs" placeholder="••••••••" />
                    </Form.Item>
                  </Col>
                </Row>

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={changingPassword}
                  className="bg-blue-600 hover:bg-blue-700 font-semibold text-xs rounded-xl h-10 px-6 mt-1 border-none shadow-xs"
                >
                  Xác nhận đổi mật khẩu
                </Button>
              </Form>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default StorefrontProfilePage;
