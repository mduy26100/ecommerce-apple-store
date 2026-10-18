import { Table, Tag, Button, Space, Popconfirm, Avatar } from "antd";
import { EditOutlined, DeleteOutlined, FolderOutlined } from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { CategoryItem } from "../types/category.types";

export interface CategoriesTableProps {
  data: CategoryItem[];
  loading?: boolean;
  pagination?: TablePaginationConfig;
  onEdit: (category: CategoryItem) => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

export const CategoriesTable = ({
  data,
  loading,
  pagination,
  onEdit,
  onDelete,
  isDeleting,
}: CategoriesTableProps) => {
  const columns: ColumnsType<CategoryItem> = [
    {
      title: "Biểu trưng",
      dataIndex: "imageUrl",
      key: "imageUrl",
      width: 90,
      render: (url: string | null) => (
        <Avatar
          src={url}
          icon={!url && <FolderOutlined />}
          shape="square"
          size={40}
          className="rounded-xl border border-slate-200 bg-slate-50 text-slate-500"
        />
      ),
    },
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <span className="font-bold text-slate-800">{text}</span>
      ),
    },
    {
      title: "Đường dẫn (Slug)",
      dataIndex: "slug",
      key: "slug",
      render: (slug: string) => (
        <code className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-mono text-xs">
          /{slug}
        </code>
      ),
    },
    {
      title: "Thứ tự",
      dataIndex: "displayOrder",
      key: "displayOrder",
      width: 90,
      align: "center",
      render: (order: number) => (
        <span className="font-semibold text-slate-600">{order}</span>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (desc: string | null) => (
        <span className="text-xs text-slate-500">{desc || "Chưa có mô tả"}</span>
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
            description="Bạn có chắc chắn muốn xóa danh mục này?"
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
    <Table<CategoryItem>
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

export default CategoriesTable;
