import { useState } from "react";
import { Card, Form, Input, Button, Row, Col, Avatar, Tag, Divider, message } from "antd";
import { UserOutlined, MailOutlined, KeyOutlined, LockOutlined, PhoneOutlined } from "@ant-design/icons";
import PageHeader from "@shared/components/page-header/PageHeader";
import { useAuthStore } from "@features/auth";
import { api } from "@core/api/axios.config";

export const ProfilePage = () => {
  const { user, setAuth, accessToken } = useAuthStore();
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm] = Form.useForm();

  const handleUpdateProfile = async (values: { fullName?: string; phone?: string; title?: string }) => {
    try {
      setUpdating(true);
      await api.put("/api/v1/users/profile", {
        fullName: values.fullName,
        phoneNumber: values.phone,
      });

      if (accessToken && user) {
        setAuth(accessToken, {
          ...user,
          fullName: values.fullName,
          phoneNumber: values.phone,
        });
      }

      message.success("Cập nhật thông tin hồ sơ thành công!");
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error?.message || error?.message || "Cập nhật hồ sơ thất bại!";
      message.error(errorMsg);
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (values: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    try {
      setChangingPassword(true);
      await api.post("/api/v1/auth/change-password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });

      message.success("Đổi mật khẩu bảo mật thành công!");
      passwordForm.resetFields();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error?.message || error?.message || "Đổi mật khẩu thất bại!";
      message.error(errorMsg);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 select-none">
      <PageHeader breadcrumbs={["HỆ THỐNG", "TÀI KHOẢN"]} title="Hồ Sơ Quản Trị Viên" />

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card
            className="h-full border-slate-100 shadow-xs text-center rounded-2xl"
            styles={{ body: { height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "24px 16px" } }}
          >
            <div className="relative inline-block mb-4 mx-auto">
              <Avatar
                size={110}
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256"
                icon={<UserOutlined />}
                className="border-2 border-blue-500/20"
              />
              <span className="absolute bottom-1 right-1 w-4.5 h-4.5 bg-green-500 border-2 border-white rounded-full" />
            </div>

            <h3 className="text-lg font-bold text-slate-800 tracking-tight">
              {user?.fullName || "Quản trị viên Apple"}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {user?.role || "Quản trị viên cấp cao"}
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Tag color="blue">{user?.tenantId || "Chi nhánh chính"}</Tag>
              <Tag color="green">Đang hoạt động</Tag>
            </div>

            <Divider className="my-6 border-slate-100" />

            <div className="w-full text-left space-y-3.5 text-xs text-slate-600 px-2">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Email:</span>
                <span className="font-medium text-slate-700">{user?.email || "admin@apple-store.com"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Số điện thoại:</span>
                <span className="font-medium text-slate-700">{user?.phoneNumber || "Chưa cập nhật"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Cấp bậc:</span>
                <span className="font-medium text-slate-700">Tổng quản trị (SuperAdmin)</span>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <div className="flex flex-col gap-6">
            <Card className="border-slate-100 shadow-xs rounded-2xl" title={<span className="text-slate-800 font-bold text-sm">Thông Tin Cơ Bản</span>}>
              <Form
                layout="vertical"
                initialValues={{
                  fullName: user?.fullName || "Quản trị viên Apple",
                  email: user?.email || "admin@apple-store.com",
                  phone: user?.phoneNumber || "",
                  title: user?.role || "Quản trị viên cấp cao",
                }}
                onFinish={handleUpdateProfile}
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={<span className="text-xs font-semibold text-slate-600">Họ và tên</span>}
                      name="fullName"
                      rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
                    >
                      <Input prefix={<UserOutlined className="text-slate-400 mr-1" />} className="rounded-xl py-2 text-xs" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label={<span className="text-xs font-semibold text-slate-600">Địa chỉ Email</span>} name="email">
                      <Input prefix={<MailOutlined className="text-slate-400 mr-1" />} className="rounded-xl py-2 text-xs bg-slate-50 cursor-not-allowed" disabled />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item label={<span className="text-xs font-semibold text-slate-600">Số điện thoại</span>} name="phone">
                      <Input prefix={<PhoneOutlined className="text-slate-400 mr-1" />} className="rounded-xl py-2 text-xs" placeholder="0912 345 678 (Tùy chọn)" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label={<span className="text-xs font-semibold text-slate-600">Chức vụ</span>} name="title">
                      <Input className="rounded-xl py-2 text-xs bg-slate-50 cursor-not-allowed" disabled />
                    </Form.Item>
                  </Col>
                </Row>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={updating}
                  className="bg-blue-600 hover:bg-blue-700 mt-2 font-semibold text-xs rounded-xl h-10 px-5"
                >
                  Lưu thông tin cá nhân
                </Button>
              </Form>
            </Card>

            <Card className="border-slate-100 shadow-xs rounded-2xl" title={<span className="text-slate-800 font-bold text-sm">Bảo Mật &amp; Mật Khẩu</span>}>
              <Form
                form={passwordForm}
                layout="vertical"
                onFinish={handleChangePassword}
              >
                <Form.Item
                  label={<span className="text-xs font-semibold text-slate-600">Mật khẩu hiện tại</span>}
                  name="currentPassword"
                  rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại!" }]}
                >
                  <Input.Password prefix={<KeyOutlined className="text-slate-400 mr-1" />} className="rounded-xl py-2 text-xs" />
                </Form.Item>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={<span className="text-xs font-semibold text-slate-600">Mật khẩu mới</span>}
                      name="newPassword"
                      rules={[
                        { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                        { min: 6, message: "Mật khẩu tối thiểu 6 ký tự!" },
                      ]}
                    >
                      <Input.Password prefix={<LockOutlined className="text-slate-400 mr-1" />} className="rounded-xl py-2 text-xs" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
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
                            return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                          },
                        }),
                      ]}
                    >
                      <Input.Password prefix={<LockOutlined className="text-slate-400 mr-1" />} className="rounded-xl py-2 text-xs" />
                    </Form.Item>
                  </Col>
                </Row>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={changingPassword}
                  className="bg-blue-600 hover:bg-blue-700 mt-2 font-semibold text-xs rounded-xl h-10 px-5"
                >
                  Đổi mật khẩu
                </Button>
              </Form>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ProfilePage;
