import { Card } from "antd";
import {
  DollarOutlined,
  AppstoreOutlined,
  InboxOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import type { ProductDetailItem, ProductItem } from "../types/product.types";
import type { ProductVariantItem } from "../../variants/types/variant.types";

export interface ProductDetailMetricsProps {
  product: ProductDetailItem | ProductItem;
  variants: ProductVariantItem[];
}

const formatCurrency = (val?: number | null) => {
  if (val == null) return "Chưa có";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(val);
};

export const ProductDetailMetrics = ({
  product,
  variants,
}: ProductDetailMetricsProps) => {
  const totalStock = variants.reduce((sum, v) => sum + (v.quantityInStock || 0), 0);

  const getPriceRange = () => {
    if (variants.length === 0) {
      const prodItem = product as Partial<ProductItem>;
      if (prodItem.minPrice || prodItem.maxPrice) {
        return `${formatCurrency(prodItem.minPrice)} - ${formatCurrency(prodItem.maxPrice)}`;
      }
      return "Chưa thiết lập";
    }
    const prices = variants.map((v) => v.price).filter((p) => p > 0);
    if (prices.length === 0) return "Chưa có giá";
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? formatCurrency(min) : `${formatCurrency(min)} - ${formatCurrency(max)}`;
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <Card className="border-slate-100 shadow-xs rounded-2xl bg-white p-1 sm:p-2">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-50 text-rose-600 flex! items-center! justify-center! shrink-0">
            <DollarOutlined className="text-base sm:text-lg" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] sm:text-xs text-slate-400 font-medium truncate!">Khoảng giá bán</div>
            <div className="text-xs sm:text-base font-extrabold text-rose-600 truncate!">
              {getPriceRange()}
            </div>
          </div>
        </div>
      </Card>

      <Card className="border-slate-100 shadow-xs rounded-2xl bg-white p-1 sm:p-2">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-blue-600 flex! items-center! justify-center! shrink-0">
            <AppstoreOutlined className="text-base sm:text-lg" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] sm:text-xs text-slate-400 font-medium truncate!">Số phiên bản</div>
            <div className="text-xs sm:text-base font-extrabold text-slate-800 truncate!">
              {variants.length} phiên bản
            </div>
          </div>
        </div>
      </Card>

      <Card className="border-slate-100 shadow-xs rounded-2xl bg-white p-1 sm:p-2">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex! items-center! justify-center! shrink-0 ${
            totalStock > 0 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
          }`}>
            <InboxOutlined className="text-base sm:text-lg" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] sm:text-xs text-slate-400 font-medium truncate!">Tổng tồn kho</div>
            <div className={`text-xs sm:text-base font-extrabold truncate! ${totalStock > 0 ? "text-emerald-600" : "text-amber-600"}`}>
              {totalStock} sản phẩm
            </div>
          </div>
        </div>
      </Card>

      <Card className="border-slate-100 shadow-xs rounded-2xl bg-white p-1 sm:p-2">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-50 text-purple-600 flex! items-center! justify-center! shrink-0">
            <SafetyCertificateOutlined className="text-base sm:text-lg" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] sm:text-xs text-slate-400 font-medium truncate!">Thời hạn bảo hành</div>
            <div className="text-xs sm:text-base font-extrabold text-slate-800 truncate!">
              {product.warrantyMonths ? `${product.warrantyMonths} tháng` : "Không có"}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProductDetailMetrics;
