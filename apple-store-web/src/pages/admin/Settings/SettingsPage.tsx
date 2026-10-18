import { Card, Form, Input, Button, Switch, Select, message } from "antd";
import PageHeader from "@shared/components/page-header/PageHeader";

export const SettingsPage = () => {
  const handleSave = () => {
    message.success("Lưu cấu hình hệ thống thành công!");
  };

  return (
    <div className="space-y-6 select-none">
      <PageHeader breadcrumbs={["HỆ THỐNG", "CÀI ĐẶT", "CẤU HÌNH"]} title="Cấu Hình Hệ Thống" />

      <Card className="border-slate-100 shadow-xs rounded-2xl">
        <Form
          layout="vertical"
          initialValues={{
            systemName: "Hệ Thống Phân Phối Apple Store Việt Nam",
            defaultRole: "operator",
            acceptOrders: true,
          }}
          onFinish={handleSave}
        >
          <Form.Item label="Tên cổng quản trị" name="systemName">
            <Input className="rounded-xl py-2" />
          </Form.Item>

          <Form.Item label="Vai trò mặc định cho nhân viên mới" name="defaultRole">
            <Select className="h-10">
              <Select.Option value="viewer">Nhân viên thực tập (Chỉ xem)</Select.Option>
              <Select.Option value="operator">Nhân viên bán hàng (Tiêu chuẩn)</Select.Option>
              <Select.Option value="manager">Quản lý chi nhánh (Quản trị)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Cho phép tiếp nhận đơn hàng tự động" name="acceptOrders" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item className="pt-2">
            <Button type="primary" htmlType="submit" className="bg-blue-600 hover:bg-blue-700 font-semibold rounded-xl h-10 px-6">
              Lưu thay đổi
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SettingsPage;
