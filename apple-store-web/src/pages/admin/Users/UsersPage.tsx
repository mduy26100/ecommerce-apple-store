import { Table, Tag, Button, Input, Space, Card } from "antd";
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import PageHeader from "@shared/components/page-header/PageHeader";

export const UsersPage = () => {
  const data = [
    { key: "1", name: "Quản trị viên Hệ thống", email: "admin@apple-store.com", role: "SuperAdmin", status: "Hoạt động" },
    { key: "2", name: "Nguyễn Văn Hùng", email: "hung.nv@apple-store.com", role: "Quản lý Bán hàng", status: "Hoạt động" },
    { key: "3", name: "Trần Thị Lan", email: "lan.tt@apple-store.com", role: "Hỗ trợ Kỹ thuật", status: "Tạm khóa" },
  ];

  const columns = [
    {
      title: "Họ và tên",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <span className="font-semibold text-slate-700">{text}</span>,
    },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Vai trò", dataIndex: "role", key: "role" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "Hoạt động" ? "green" : "red"}>{status}</Tag>
      ),
    },
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
        <PageHeader breadcrumbs={["HỆ THỐNG", "QUẢN TRỊ TÀI KHOẢN", "NGƯỜI DÙNG"]} title="Danh Sách Người Dùng" />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="bg-blue-600 hover:bg-blue-700 self-start sm:self-auto shrink-0 font-semibold"
        >
          Thêm người dùng mới
        </Button>
      </div>

      <Card className="border-slate-100 shadow-xs rounded-2xl">
        <div className="flex justify-between items-center mb-4">
          <Input
            prefix={<SearchOutlined className="text-slate-400 mr-1" />}
            placeholder="Tìm kiếm người dùng theo tên hoặc email..."
            className="max-w-md rounded-xl"
          />
        </div>
        <Table dataSource={data} columns={columns} pagination={{ pageSize: 5 }} scroll={{ x: "max-content" }} />
      </Card>
    </div>
  );
};

export default UsersPage;
