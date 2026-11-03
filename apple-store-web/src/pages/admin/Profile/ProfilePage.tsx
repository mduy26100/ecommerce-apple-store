import { useState, useEffect, useRef } from "react";
import { Card, Form, Input, Button, Row, Col, Avatar, Tag, Divider, message } from "antd";
import type { UploadFile } from "antd";
import {
  UserOutlined,
  MailOutlined,
  KeyOutlined,
  LockOutlined,
  PhoneOutlined,
  CameraOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import PageHeader from "@shared/components/page-header/PageHeader";
import { ImageCropperModal } from "@shared/components/image-cropper";
import { useAuthStore } from "@features/auth";
import { api } from "@core/api/axios.config";

export const ProfilePage = () => {
  const { user, setAuth, accessToken } = useAuthStore();
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    const fetchLatestProfile = async () => {
      try {
        const profile = await api.get<any>("/api/auth/me");
        if (profile && accessToken && user) {
          setAuth(accessToken, {
            ...user,
            fullName: profile.fullName || user.fullName,
            phoneNumber: profile.phoneNumber || user.phoneNumber,
            avatarUrl: profile.avatarUrl || user.avatarUrl,
            email: profile.email || user.email,
          });
        }
      } catch {
      }
    };

    fetchLatestProfile();
  }, []);

  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phoneNumber || "",
        title: user.role || "Quản trị viên cấp cao",
      });
    }
  }, [user, profileForm]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result as string);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCropComplete = async (fileObj: UploadFile) => {
    const file = fileObj.originFileObj as File;
    setCropperOpen(false);
    setCropImageSrc(null);

    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post<{ avatarUrl: string }>("/api/auth/avatar", formData);

      if (accessToken && user) {
        setAuth(accessToken, {
          ...user,
          avatarUrl: response.avatarUrl,
        });
      }

      message.success("Cập nhật ảnh đại diện thành công!");
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error?.message || error?.message || "Cập nhật ảnh đại diện thất bại!";
      message.error(errorMsg);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async (values: { fullName?: string; phone?: string; title?: string }) => {
    try {
      setUpdating(true);
      await api.put("/api/auth/profile", {
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
      await api.post("/api/auth/change-password", {
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
            <div className="relative inline-block mb-3 mx-auto group">
              <Avatar
                size={110}
                src={user?.avatarUrl || undefined}
                icon={<UserOutlined className="text-4xl text-slate-400" />}
                className="border-2 border-blue-500/20 bg-slate-100 flex items-center justify-center overflow-hidden shadow-sm"
              />
              <span className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full z-10 shadow-xs pointer-events-none" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 rounded-full bg-black/45 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                title="Thay đổi ảnh đại diện"
              >
                <CameraOutlined className="text-2xl mb-1" />
                <span className="text-xxs font-medium">Đổi ảnh</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="mb-4">
              <Button
                type="dashed"
                size="small"
                icon={<UploadOutlined />}
                onClick={() => fileInputRef.current?.click()}
                loading={uploadingAvatar}
                className="text-xs rounded-lg border-slate-300 hover:border-blue-500 hover:text-blue-600"
              >
                Thay đổi ảnh đại diện
              </Button>
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
                form={profileForm}
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

            <Card className="border-slate-100 shadow-xs rounded-2xl" title={<span className="text-slate-800 font-bold text-sm">Bảo Mật & Mật Khẩu</span>}>
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

      <ImageCropperModal
        isOpen={cropperOpen}
        imageSrc={cropImageSrc}
        aspect={1}
        cropShape="round"
        title="Cắt ảnh đại diện (Tỉ lệ 1:1)"
        onCancel={() => {
          setCropperOpen(false);
          setCropImageSrc(null);
        }}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
};

export default ProfilePage;
