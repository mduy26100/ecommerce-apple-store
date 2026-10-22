import { useState } from "react";
import { Button } from "antd";
import { ShoppingCartOutlined, ThunderboltOutlined } from "@ant-design/icons";
import type { ProductCardItem } from "../types/catalog.types";
import { AppleLogo } from "@shared/components/icons";

export interface ProductCardProps {
  product: ProductCardItem;
  onAddToCart?: (product: ProductCardItem) => void;
  onBuyNow?: (product: ProductCardItem) => void;
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
}: ProductCardProps) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      data-testid={`product-card-${product.id}`}
      className="group/card relative h-full flex flex-col justify-between bg-white rounded-2xl border border-slate-200 hover:border-blue-500/80 p-5 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="flex flex-col flex-1">
        <div className="h-7 flex items-center justify-between gap-2 mb-3">
          <span
            data-testid={`chip-badge-${product.id}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 text-white text-[11px] font-semibold tracking-wide shadow-xs shrink-0 truncate max-w-[65%]"
          >
            <ThunderboltOutlined className="text-[10px] text-amber-400 shrink-0" />
            <span className="truncate">{product.chipName || "Apple Silicon"}</span>
          </span>

          <span
            data-testid={`status-badge-${product.id}`}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shrink-0 ${
              product.badgeText === "BÁN CHẠY"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}
          >
            {product.badgeText || "SẴN HÀNG"}
          </span>
        </div>

        <div
          data-testid="product-image-container"
          className="w-full h-48 sm:h-52 bg-white rounded-xl flex items-center justify-center p-3 overflow-hidden border border-slate-50"
        >
          {!imgError && product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              onError={() => setImgError(true)}
              className="max-h-full max-w-full object-contain group-hover/card:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-1.5 text-slate-300 group-hover/card:text-blue-500 transition-colors duration-300">
              <AppleLogo size={52} />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Urban Stitch</span>
            </div>
          )}
        </div>

        <h4 className="h-12 flex items-center font-bold text-slate-900 text-sm sm:text-base group-hover/card:text-blue-600 transition-colors line-clamp-2 mt-3 leading-snug">
          {product.name}
        </h4>

        <p className="h-9 text-xs text-slate-500 line-clamp-2 leading-relaxed mt-1">
          {product.shortDescription || "Sản phẩm chính hãng Apple, bảo hành 12 tháng chính sách 1 đổi 1 tiêu chuẩn Urban Stitch."}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Chỉ từ</span>
          <span
            data-testid={`product-price-${product.id}`}
            className="text-base sm:text-lg font-black text-slate-900"
          >
            {formatCurrency(product.price)}
          </span>
        </div>

        <Button
          type="primary"
          icon={<ShoppingCartOutlined />}
          onClick={() => onAddToCart?.(product)}
          className="bg-blue-600 hover:bg-blue-700 h-9 px-3.5 rounded-xl text-xs font-semibold border-none shadow-xs shadow-blue-500/20"
        >
          Thêm giỏ
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
