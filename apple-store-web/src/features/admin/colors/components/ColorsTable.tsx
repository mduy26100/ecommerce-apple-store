import { Table, Tag, Button, Space, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { ColorItem } from "../types/colors.types";

export interface ColorsTableProps {
  data: ColorItem[];
  loading?: boolean;
  pagination?: TablePaginationConfig;
  onEdit: (color: ColorItem) => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

export const ColorsTable = ({
  data,
  loading,
  pagination,
  onEdit,
  onDelete,
  isDeleting,
}: ColorsTableProps) => {
  const columns: ColumnsType<ColorItem> = [
    {
      title: "Xem trước",
      dataIndex: "hexCode",
      key: "preview",
      width: 100,
      render: (hex: string | null) => (
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full border border-slate-200 shadow-xs"
            style={{ backgroundColor: hex || "#FFFFFF" }}
          />
        </div>
      ),
    },
    {
      title: "Tên màu sắc",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <span className="font-semibold text-slate-800">{text}</span>
      ),
    },
    {
      title: "Mã nội bộ (Code)",
      dataIndex: "code",
      key: "code",
      render: (text: string) => (
        <code className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-mono text-xs">
          {text}
        </code>
      ),
    },
    {
      title: "Mã màu Hex",
      dataIndex: "hexCode",
      key: "hexCode",
      render: (hex: string | null) => (
        <span className="font-mono text-xs text-slate-600">
          {hex || "Chưa thiết lập"}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 130,
      render: (active: boolean) => (
        <Tag color={active ? "success" : "default"}>
          {active ? "Hoạt động" : "Tạm khóa"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            className="text-blue-600 hover:bg-blue-50"
            title="Chỉnh sửa"
          />
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa màu sắc này?"
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => onDelete(record.id)}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              loading={isDeleting}
              title="Xóa"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table<ColorItem>
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={pagination}
      scroll={{ x: "max-content" }}
      className="custom-scrollbar"
    />
  );
};

export default ColorsTable;
