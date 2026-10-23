import { Table, Tag, Button, Space, Popconfirm } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
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
      title: "Thuộc tính / Tùy chọn",
      key: "variantValues",
      render: (_, record) => {
        if (record.variantValues && record.variantValues.length > 0) {
          return (
            <div className="flex flex-wrap items-center gap-1.5">
              {record.variantValues.map((vv) => (
                <span
                  key={vv.optionValueId}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                >
                  {vv.colorHexCode && (
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-slate-300 inline-block shrink-0"
                      style={{ backgroundColor: vv.colorHexCode }}
                    />
                  )}
                  <span>
                    <strong className="text-slate-500 font-normal">{vv.optionName}:</strong> {vv.value}
                  </span>
                </span>
              ))}
            </div>
          );
        }

        if (record.colorName || record.storageCapacity) {
          return (
            <div className="flex flex-wrap items-center gap-1.5">
              {record.colorName && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                  {record.colorHexCode && (
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-slate-300 inline-block shrink-0"
                      style={{ backgroundColor: record.colorHexCode }}
                    />
                  )}
                  <span>{record.colorName}</span>
                </span>
              )}
              {record.storageCapacity && (
                <Tag color="purple" className="font-semibold text-xs rounded-md m-0">
                  {record.storageCapacity}
                </Tag>
              )}
            </div>
          );
        }

        return <span className="text-slate-400 text-xs">Mặc định</span>;
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
      width: 100,
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
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            title="Chỉnh sửa"
          />
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
              title="Xóa"
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
