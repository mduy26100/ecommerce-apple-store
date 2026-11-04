import { Table, Tag, Button, Popconfirm } from "antd";
import { DeleteOutlined, ShoppingOutlined } from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { ProductItem } from "../types/product.types";

export interface ProductsTableProps {
  data: ProductItem[];
  loading?: boolean;
  pagination?: TablePaginationConfig;
  onDelete: (id: number) => void;
  onSelectProduct?: (product: ProductItem) => void;
  onManageVariants?: (product: ProductItem) => void;
  isDeleting?: boolean;
}

const formatCurrency = (val?: number | null) => {
  if (val == null) return null;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(val);
};

export const ProductsTable = ({
  data,
  loading,
  pagination,
  onDelete,
  onSelectProduct,
  onManageVariants,
  isDeleting,
}: ProductsTableProps) => {
  const columns: ColumnsType<ProductItem> = [
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (text: string, record) => (
        <div>
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <ShoppingOutlined className="text-slate-400" />
            <span>{text}</span>
          </div>
          {record.modelCode && (
            <span className="text-xs font-mono text-slate-400">
              Mã: {record.modelCode}
            </span>
          )}
        </div>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "categoryName",
      key: "categoryName",
      render: (cat: string) => (
        <Tag color="blue" className="rounded-md font-medium">
          {cat || "Không có"}
        </Tag>
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
      title: "Bảo hành",
      dataIndex: "warrantyMonths",
      key: "warrantyMonths",
      width: 100,
      align: "center",
      render: (months: number | null) => (
        <span className="text-slate-600 font-medium">
          {months ? `${months} tháng` : "Không"}
        </span>
      ),
    },
    {
      title: "Số phiên bản",
      dataIndex: "variantsCount",
      key: "variantsCount",
      width: 120,
      align: "center",
      render: (count: number, record) => (
        <Tag
          color={count > 0 ? "geekblue" : "default"}
          className="cursor-pointer hover:opacity-80 font-medium"
          onClick={(e) => {
            e.stopPropagation();
            if (onManageVariants) {
              onManageVariants(record);
            } else if (onSelectProduct) {
              onSelectProduct(record);
            }
          }}
        >
          {count} phiên bản
        </Tag>
      ),
    },
    {
      title: "Khoảng giá",
      key: "priceRange",
      render: (_, record) => {
        if (!record.minPrice && !record.maxPrice) {
          return <span className="text-xs text-slate-400">Chưa có giá</span>;
        }
        if (record.minPrice === record.maxPrice) {
          return (
            <span className="font-semibold text-rose-600 text-xs">
              {formatCurrency(record.minPrice)}
            </span>
          );
        }
        return (
          <span className="font-semibold text-rose-600 text-xs">
            {formatCurrency(record.minPrice)} - {formatCurrency(record.maxPrice)}
          </span>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 120,
      render: (active: boolean) => (
        <Tag color={active ? "success" : "default"}>
          {active ? "Hoạt động" : "Tạm khóa"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 90,
      align: "center",
      render: (_, record) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa sản phẩm này?"
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
              aria-label="Xóa sản phẩm"
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <Table<ProductItem>
      rowKey="id"
      columns={columns}
      dataSource={data || []}
      loading={loading}
      pagination={pagination}
      scroll={{ x: "max-content" }}
      className="custom-scrollbar"
      onRow={(record) => ({
        onClick: (e) => {
          const target = e.target as HTMLElement;
          if (
            target.closest("button") ||
            target.closest(".ant-popconfirm") ||
            target.closest(".ant-popover") ||
            target.closest(".ant-modal")
          ) {
            return;
          }
          if (onSelectProduct) {
            onSelectProduct(record);
          } else if (onManageVariants) {
            onManageVariants(record);
          }
        },
        className: "cursor-pointer hover:bg-blue-50/40 transition-colors",
      })}
    />
  );
};

export default ProductsTable;
