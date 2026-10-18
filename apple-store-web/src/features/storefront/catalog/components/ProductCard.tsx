import { Tag, Button } from "antd";
import { ShoppingCartOutlined, ThunderboltOutlined } from "@ant-design/icons";
import type { Product } from "../types/catalog.types";

export interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const ProductCard = ({
  product,
  onAddToCart,
  onBuyNow,
}: ProductCardProps) => {
  return (
    <div className="group flex flex-col justify-between h-full bg-white rounded-2xl border border-slate-100 hover:border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden p-5">
      <div>
        <div className="relative w-full aspect-square rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden mb-4">
          <img
            src={product.thumbnail}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
            {product.isNew && (
              <Tag color="#2563eb" className="border-none font-semibold text-xxs px-2 py-0.5 rounded-full">
                MỚI
              </Tag>
            )}
            {product.isHot && (
              <Tag color="#dc2626" className="border-none font-semibold text-xxs px-2 py-0.5 rounded-full">
                BÁN CHẠY
              </Tag>
            )}
          </div>

          {product.tag && (
            <div className="absolute bottom-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
              {product.tag}
            </div>
          )}
        </div>

        <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider mb-1">
          {product.category}
        </div>

        <h3 className="font-bold text-slate-800 text-sm sm:text-base line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
          {product.name}
        </h3>

        <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
          {product.description}
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100/80">
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-base sm:text-lg font-black text-slate-900">
            {formatCurrency(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-slate-400 line-through">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            icon={<ShoppingCartOutlined />}
            onClick={() => onAddToCart?.(product)}
            className="w-full h-9 rounded-xl text-xs font-semibold border-slate-200 hover:border-blue-500 hover:text-blue-600"
          >
            Thêm giỏ
          </Button>
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            onClick={() => onBuyNow?.(product)}
            className="w-full h-9 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 border-none"
          >
            Mua ngay
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
