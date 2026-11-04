import { Button, Tag, Popconfirm } from "antd";
import {
  DeleteOutlined,
  ShoppingOutlined,
  BarcodeOutlined,
  LinkOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import type { ProductDetailItem, ProductItem } from "../types/product.types";

export interface ProductDetailHeaderProps {
  product: ProductDetailItem | ProductItem;
  onBack?: () => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

export const ProductDetailHeader = ({
  product,
  onDelete,
  isDeleting = false,
}: ProductDetailHeaderProps) => {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <ShoppingOutlined className="text-base" />
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 m-0 break-words">
                {product.name}
              </h1>
              <Tag color="blue" className="rounded-md font-semibold text-xs py-0.5 m-0">
                {product.categoryName}
              </Tag>
              <Tag
                color={product.isActive ? "success" : "default"}
                className="rounded-md font-medium text-xs py-0.5 m-0"
              >
                {product.isActive ? "Đang kinh doanh" : "Tạm khóa"}
              </Tag>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-mono">
                <BarcodeOutlined className="text-slate-400" />
                Mã model: {product.modelCode || "Chưa có"}
              </span>
              <span className="flex items-center gap-1 font-mono">
                <LinkOutlined className="text-slate-400" />
                Slug: /{product.slug}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
          <Button
            icon={<ExportOutlined />}
            onClick={() => window.open(`/products/${product.slug}`, "_blank")}
            className="w-full sm:w-auto rounded-xl h-10 font-medium flex! items-center! justify-center!"
          >
            Xem trên cửa hàng
          </Button>

          <Popconfirm
            title="Xác nhận xóa sản phẩm"
            description="Bạn có chắc chắn muốn xóa sản phẩm này và toàn bộ dữ liệu liên quan?"
            okText="Xóa vĩnh viễn"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => onDelete(product.id)}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              loading={isDeleting}
              className="w-full sm:w-auto rounded-xl h-10 font-semibold flex! items-center! justify-center!"
            >
              Xóa sản phẩm
            </Button>
          </Popconfirm>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailHeader;
