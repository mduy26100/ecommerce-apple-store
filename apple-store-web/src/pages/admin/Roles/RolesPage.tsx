import { Card, Table, Tag, Button, Space } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import PageHeader from "@shared/components/page-header/PageHeader";

export const RolesPage = () => {
  const data = [
    { key: "1", role: "Super Admin", permissions: ["Toàn quyền quản trị", "Quản lý đối tác", "Cấu hình hệ thống"], count: 2 },
    { key: "2", role: "Quản lý Bán hàng", permissions: ["Xem sản phẩm", "Tạo đơn hàng", "Cập nhật kho"], count: 8 },
    { key: "3", role: "Nhân viên Kỹ thuật", permissions: ["Xem đơn hàng", "Hỗ trợ khách hàng"], count: 12 },
  ];

  const columns = [
    {
      title: "Tên vai trò",
      dataIndex: "role",
      key: "role",
      render: (text: string) => <span className="font-semibold text-slate-700">{text}</span>,
    },
    {
      title: "Nhóm quyền được gán",
      dataIndex: "permissions",
      key: "permissions",
      render: (perms: string[]) => (
        <div className="flex flex-wrap gap-1">
          {perms.map((p) => (
            <Tag color="blue" key={p}>{p}</Tag>
          ))}
        </div>
      ),
    },
    { title: "Số người dùng", dataIndex: "count", key: "count" },
    {
      title: "Thao tác",
      key: "actions",
      render: () => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} className="text-blue-500 hover:bg-blue-50" />
          <Button type="text" icon={<DeleteOutlined />} className="text-red-500 hover:bg-red-50" />
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader breadcrumbs={["HỆ THỐNG", "PHÂN QUYỀN", "VAI TRÒ"]} title="Chính Sách &amp; Vai Trò Người Dùng" />
        <Button type="primary" icon={<PlusOutlined />} className="bg-blue-600 hover:bg-blue-700 self-start sm:self-auto shrink-0 font-semibold">
          Thêm vai trò mới
        </Button>
      </div>

      <Card className="border-slate-100 shadow-xs rounded-2xl">
        <Table dataSource={data} columns={columns} pagination={false} scroll={{ x: "max-content" }} />
      </Card>
    </div>
  );
};

export default RolesPage;
