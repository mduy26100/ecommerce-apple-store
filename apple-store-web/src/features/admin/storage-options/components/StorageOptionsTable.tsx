import { Table, Tag, Button, Space, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined, DatabaseOutlined } from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { StorageOptionItem } from "../types/storage.types";

export interface StorageOptionsTableProps {
  data: StorageOptionItem[];
  loading?: boolean;
  pagination?: TablePaginationConfig;
  onEdit: (option: StorageOptionItem) => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

export const StorageOptionsTable = ({
  data,
  loading,
  pagination,
  onEdit,
  onDelete,
  isDeleting,
}: StorageOptionsTableProps) => {
  const columns: ColumnsType<StorageOptionItem> = [
    {
      title: "Tùy chọn dung lượng",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
            <DatabaseOutlined />
          </div>
          <span className="font-bold text-slate-800">{text}</span>
        </div>
      ),
    },
    {
      title: "Giá trị chuẩn hóa (GB)",
      dataIndex: "capacityValue",
      key: "capacityValue",
      render: (val: number | null) => (
        <span className="font-mono text-xs text-slate-700">
          {val !== null && val !== undefined ? `${val.toLocaleString("vi-VN")} GB` : "Chưa cấu hình"}
        </span>
      ),
    },
    {
      title: "Đơn vị tính",
      dataIndex: "unit",
      key: "unit",
      width: 120,
      render: (unit: string | null) => (
        <Tag color="geekblue" className="font-semibold text-xs px-2 py-0.5">
          {unit || "GB"}
        </Tag>
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
            description="Bạn có chắc chắn muốn xóa tùy chọn dung lượng này?"
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
    <Table<StorageOptionItem>
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

export default StorageOptionsTable;
