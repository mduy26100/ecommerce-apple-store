import { Card, Table, Tag, Button, Space } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import PageHeader from "@shared/components/page-header/PageHeader";

export const TenantsPage = () => {
  const data = [
    { key: "1", name: "Urban Stitch Ba Đình (Hà Nội)", plan: "Chi nhánh chính", users: 45, status: "Hoạt động" },
    { key: "2", name: "Urban Stitch Quận 1 (TP.HCM)", plan: "Chi nhánh chính", users: 60, status: "Hoạt động" },
    { key: "3", name: "Urban Stitch Hải Châu (Đà Nẵng)", plan: "Chi nhánh liên kết", users: 20, status: "Tạm dừng" },
  ];

  const columns = [
    {
      title: "Tên chi nhánh / Đối tác",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <span className="font-semibold text-slate-700">{text}</span>,
    },
    {
      title: "Gói hoạt động",
      dataIndex: "plan",
      key: "plan",
      render: (plan: string) => (
        <Tag color={plan === "Chi nhánh chính" ? "purple" : "blue"}>{plan}</Tag>
      ),
    },
    { title: "Số nhân viên", dataIndex: "users", key: "users" },
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
        <PageHeader breadcrumbs={["HỆ THỐNG", "QUẢN LÝ ĐỐI TÁC", "CHI NHÁNH"]} title="Quản Lý Chi Nhánh &amp; Đối Tác" />
        <Button type="primary" icon={<PlusOutlined />} className="bg-blue-600 hover:bg-blue-700 self-start sm:self-auto shrink-0 font-semibold">
          Kích hoạt chi nhánh mới
        </Button>
      </div>

      <Card className="border-slate-100 shadow-xs rounded-2xl">
        <Table dataSource={data} columns={columns} pagination={false} scroll={{ x: "max-content" }} />
      </Card>
    </div>
  );
};

export default TenantsPage;
