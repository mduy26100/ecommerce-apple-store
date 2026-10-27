import { useState } from "react";
import { Link } from "react-router-dom";
import { Checkbox, Button, Popconfirm, Tag } from "antd";
import { DeleteOutlined, MinusOutlined, PlusOutlined, EditOutlined, DownOutlined } from "@ant-design/icons";
import { AppleLogo } from "@shared/components/icons";
import type { CartItem } from "../types/cart.types";

export interface CartItemRowProps {
  item: CartItem;
  onQuantityChange: (variantId: number, nextQty: number) => void;
  onSelectionChange: (variantId: number, nextSelected: boolean) => void;
  onRemove: (variantId: number) => void;
  onChangeVariant?: (item: CartItem) => void;
  isUpdating?: boolean;
}

const formatVND = (value: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

export const CartItemRow = ({
  item,
  onQuantityChange,
  onSelectionChange,
  onRemove,
  onChangeVariant,
  isUpdating = false,
}: CartItemRowProps) => {
  const [imgError, setImgError] = useState(false);
  const isOutOfStock = !item.isAvailable || item.quantityInStock <= 0;
  const currentQuantity = !isOutOfStock && item.quantity > item.quantityInStock ? 1 : item.quantity;
  const currentLineTotal = item.unitPrice * currentQuantity;

  return (
    <div
      data-testid={`cart-item-${item.productVariantId}`}
      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${isOutOfStock
          ? "bg-slate-50/70 border-slate-200 opacity-75"
          : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
        }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
          <Checkbox
            checked={item.isSelected && !isOutOfStock}
            disabled={isOutOfStock || isUpdating}
            onChange={(e) => onSelectionChange(item.productVariantId, e.target.checked)}
            className="mt-1 sm:mt-0 shrink-0"
            aria-label={`Chọn sản phẩm ${item.productName}`}
          />

          <Link
            to={`/products/${item.productSlug}`}
            className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl bg-slate-100 p-1.5 shrink-0 flex items-center justify-center overflow-hidden border border-slate-200/60 group"
          >
            {item.imageUrl && !imgError ? (
              <img
                src={item.imageUrl}
                alt={item.productName}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 group-hover:scale-105 transition-transform duration-300">
                <AppleLogo size={32} className="text-slate-400" />
              </div>
            )}
          </Link>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <Link
                to={`/products/${item.productSlug}`}
                className="text-sm sm:text-base font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
              >
                {item.productName}
              </Link>

              {isOutOfStock && (
                <Tag color="#dc2626" className="text-[10px] font-bold uppercase rounded-md border-none px-1.5 py-0">
                  {item.quantityInStock <= 0 ? "Hết hàng" : "Ngừng kinh doanh"}
                </Tag>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
              {item.sku && (
                <span className="font-mono text-[11px] text-slate-400">SKU: {item.sku}</span>
              )}

              {item.attributes && item.attributes.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {item.attributes.map((attr, idx) => (
                    <span key={`${attr.optionName}-${idx}`} className="inline-flex items-center gap-1">
                      {idx > 0 && <span className="text-slate-300">•</span>}
                      {attr.colorHexCode && (
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block shadow-2xs shrink-0"
                          style={{ backgroundColor: attr.colorHexCode }}
                        />
                      )}
                      <span className="text-slate-600 font-medium">
                        {attr.optionName}: <strong className="text-slate-900">{attr.value}</strong>
                      </span>
                    </span>
                  ))}
                </div>
              )}

              {onChangeVariant && (
                <button
                  type="button"
                  onClick={() => onChangeVariant(item)}
                  data-testid={`change-variant-btn-${item.productVariantId}`}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold text-blue-600 bg-blue-50/80 hover:bg-blue-100 hover:text-blue-700 border border-blue-200/60 transition-all cursor-pointer w-fit mt-0.5"
                >
                  <EditOutlined className="text-[10px]" />
                  <span>Đổi phân loại</span>
                  <DownOutlined className="text-[9px] text-blue-400" />
                </button>
              )}
            </div>

            <div className="flex items-baseline gap-2 pt-0.5">
              <span className="text-sm sm:text-base font-black text-blue-600">
                {formatVND(item.unitPrice)}
              </span>

              {item.compareAtPrice && item.compareAtPrice > item.unitPrice && (
                <span className="text-xs text-slate-400 line-through">
                  {formatVND(item.compareAtPrice)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 sm:gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <div className="flex flex-col items-start sm:items-end">
            <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden shadow-2xs">
              <button
                type="button"
                disabled={isOutOfStock || isUpdating || currentQuantity <= 1}
                onClick={() => onQuantityChange(item.productVariantId, currentQuantity - 1)}
                className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Giảm số lượng"
              >
                <MinusOutlined className="text-xs" />
              </button>

              <span className="w-10 text-center font-bold text-xs sm:text-sm text-slate-800 select-none">
                {currentQuantity}
              </span>

              <button
                type="button"
                disabled={isOutOfStock || isUpdating || currentQuantity >= item.quantityInStock}
                onClick={() => onQuantityChange(item.productVariantId, currentQuantity + 1)}
                className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Tăng số lượng"
              >
                <PlusOutlined className="text-xs" />
              </button>
            </div>

            {!isOutOfStock && item.quantityInStock > 0 && item.quantityInStock <= 5 && (
              <span className="text-[10px] text-amber-600 font-semibold mt-1">
                Chỉ còn {item.quantityInStock}
              </span>
            )}
          </div>

          <div className="text-right min-w-24">
            <div className="text-sm sm:text-base font-black text-slate-900">
              {formatVND(currentLineTotal)}
            </div>
          </div>

          <Popconfirm
            title="Xóa sản phẩm"
            description="Bạn có chắc chắn muốn bỏ sản phẩm này khỏi giỏ hàng?"
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => onRemove(item.productVariantId)}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              aria-label="Xóa sản phẩm"
            />
          </Popconfirm>
        </div>
      </div>
    </div>
  );
};
