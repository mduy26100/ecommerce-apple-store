import { Table, Tag, Button, Space, Popconfirm } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { ProductVariantItem } from "../types/variant.types";

export interface VariantsTableProps {
  data: ProductVariantItem[];
  loading?: boolean;
  onEdit: (variant: ProductVariantItem) => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

const formatCurrency = (val?: number | null) => {
  if (val == null) return "-";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(val);
};

export const VariantsTable = ({
  data,
  loading,
  onEdit,
  onDelete,
  isDeleting,
}: VariantsTableProps) => {
  const columns: ColumnsType<ProductVariantItem> = [
    {
      title: "Mã SKU",
      dataIndex: "sku",
      key: "sku",
      render: (sku: string) => (
        <code className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-mono text-xs font-bold">
          {sku}
        </code>
      ),
    },
    {
      title: "Tên phiên bản",
      dataIndex: "variantName",
      key: "variantName",
      render: (name: string | null) => (
        <span className="font-medium text-slate-700">
          {name || "Mặc định"}
        </span>
      ),
    },
    {
      title: "Màu sắc",
      key: "color",
      render: (_, record) => {
        if (!record.colorName) {
          return <span className="text-slate-400 text-xs">-</span>;
        }
        return (
          <div className="flex items-center gap-1.5">
            <span
              className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-xs inline-block"
              style={{ backgroundColor: record.colorHexCode || "#ccc" }}
            />
            <span className="text-xs text-slate-700">{record.colorName}</span>
          </div>
        );
      },
    },
    {
      title: "Dung lượng",
      dataIndex: "storageCapacity",
      key: "storageCapacity",
      align: "center",
      render: (cap: string | null) => {
        if (!cap) return <span className="text-slate-400 text-xs">-</span>;
        return (
          <Tag color="purple" className="font-semibold text-xs rounded-md">
            {cap}
          </Tag>
        );
      },
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      key: "price",
      align: "right",
      render: (price: number, record) => (
        <div>
          <span className="font-bold text-rose-600 text-sm">
            {formatCurrency(price)}
          </span>
          {record.compareAtPrice && record.compareAtPrice > price && (
            <div className="text-xs text-slate-400 line-through">
              {formatCurrency(record.compareAtPrice)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Tồn kho",
      dataIndex: "quantityInStock",
      key: "quantityInStock",
      width: 90,
      align: "center",
      render: (qty: number) => (
        <Tag color={qty > 0 ? "blue" : "error"}>
          {qty > 0 ? `${qty} cái` : "Hết hàng"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (active: boolean) => (
        <Tag color={active ? "success" : "default"}>
          {active ? "Hoạt động" : "Tạm khóa"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Space size="small" onClick={(e) => e.stopPropagation()}>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa phiên bản này?"
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
              title="Xóa phiên bản"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table<ProductVariantItem>
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={false}
      scroll={{ x: "max-content" }}
      className="custom-scrollbar"
      onRow={(record) => ({
        onClick: () => onEdit(record),
        className: "cursor-pointer hover:bg-blue-50/40 transition-colors",
      })}
    />
  );
};

export default VariantsTable;
