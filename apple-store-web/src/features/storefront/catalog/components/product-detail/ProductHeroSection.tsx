import { useState, useRef, useEffect } from "react";
import { Image } from "antd";
import {
  LeftOutlined,
  RightOutlined,
  MinusOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  SyncOutlined,
  CarOutlined,
  PhoneOutlined,
  CheckCircleFilled,
  EyeOutlined,
} from "@ant-design/icons";
import { AppleLogo } from "@shared/components/icons";
import type {
  ProductVariantDetail,
  ProductOptionItem,
  GalleryImageItem,
} from "../../types/catalog.types";

export interface ProductHeroSectionProps {
  productName: string;
  categoryName?: string;
  modelCode?: string | null;
  warrantyMonths?: number;
  images: GalleryImageItem[];
  activeImageIndex: number;
  onSelectImage: (index: number) => void;
  options: ProductOptionItem[];
  selectedOptions: Record<number, number>;
  variants?: ProductVariantDetail[];
  selectedVariant?: ProductVariantDetail;
  availableStock: number;
  discountPercent?: number | null;
  quantity: number;
  onSelectOptionValue: (optionId: number, valueId: number, isColor?: boolean) => void;
  onQuantityChange: (qty: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

const formatVND = (price?: number): string => {
  if (price === undefined || price === null) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

export const ProductHeroSection = ({
  productName,
  categoryName,
  modelCode,
  warrantyMonths,
  images,
  activeImageIndex,
  onSelectImage,
  options,
  selectedOptions,
  variants,
  selectedVariant,
  availableStock,
  discountPercent,
  quantity,
  onSelectOptionValue,
  onQuantityChange,
  onAddToCart,
  onBuyNow,
}: ProductHeroSectionProps) => {
  const [mainImgError, setMainImgError] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const thumbStripRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    setMainImgError(false);
  }, [activeImageIndex]);

  const scrollThumbIntoView = (index: number) => {
    const thumbEl = thumbnailRefs.current[index];
    const stripEl = thumbStripRef.current;
    if (thumbEl && stripEl) {
      const stripRect = stripEl.getBoundingClientRect();
      const thumbRect = thumbEl.getBoundingClientRect();
      if (thumbRect.left < stripRect.left || thumbRect.right > stripRect.right) {
        thumbEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  };

  const handleSelectImageIndex = (index: number) => {
    if (index >= 0 && index < images.length) {
      onSelectImage(index);
      scrollThumbIntoView(index);
    }
  };

  const handlePrevImage = () => {
    if (images.length === 0) return;
    const nextIdx = (activeImageIndex - 1 + images.length) % images.length;
    handleSelectImageIndex(nextIdx);
  };

  const handleNextImage = () => {
    if (images.length === 0) return;
    const nextIdx = (activeImageIndex + 1) % images.length;
    handleSelectImageIndex(nextIdx);
  };

  const validPreviewUrls = (images || [])
    .map((img) => img.imageUrl)
    .filter((url): url is string => Boolean(url && typeof url === "string" && url.trim().length > 0));

  const currentImage =
    images && images.length > 0 && activeImageIndex >= 0 && activeImageIndex < images.length
      ? images[activeImageIndex]
      : images?.[0];

  const getOptionValueStatus = (optionId: number, valueId: number) => {
    const activeVariants = (variants || []).filter((v) => v.isActive !== false);

    const variantsWithValue = activeVariants.filter((v) =>
      (v.optionValueIds || []).includes(valueId)
    );

    if (variantsWithValue.length === 0) {
      return {
        disabled: true,
        reason: "Phiên bản này hiện không tồn tại",
        badge: "Không có",
      };
    }

    const hasAnyStock = variantsWithValue.some(
      (v) => (v.quantityInStock ?? v.stockQuantity ?? 0) > 0
    );

    if (!hasAnyStock) {
      return {
        disabled: true,
        reason: "Phiên bản này hiện đã tạm hết hàng",
        badge: "Hết hàng",
      };
    }

    const currentOpt = options.find((o) => o.id === optionId);
    const isColorOpt =
      currentOpt?.name.toLowerCase().includes("màu") ||
      currentOpt?.values.some((v) => Boolean(v.colorHexCode));

    if (isColorOpt) {
      return {
        disabled: false,
        reason: "",
        badge: "",
      };
    }

    const matchingCombo = variantsWithValue.find((v) => {
      const vValIds = v.optionValueIds || [];
      return Object.entries(selectedOptions).every(([otherOptIdStr, otherValId]) => {
        const otherOptId = Number(otherOptIdStr);
        if (otherOptId === optionId) return true;
        return vValIds.includes(otherValId);
      });
    });

    if (!matchingCombo) {
      return {
        disabled: true,
        reason: "Không có sẵn cho lựa chọn hiện tại",
        badge: "Không có",
      };
    }

    const comboStock = matchingCombo.quantityInStock ?? matchingCombo.stockQuantity ?? 0;
    if (comboStock <= 0) {
      return {
        disabled: true,
        reason: "Phiên bản này hiện đã tạm hết hàng",
        badge: "Hết hàng",
      };
    }

    return {
      disabled: false,
      reason: "",
      badge: "",
    };
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-7 flex flex-col gap-4 select-none">
          <div
            data-testid="main-image-viewport"
            className="relative w-full aspect-square max-h-140 bg-white rounded-xl border border-slate-200/80 flex items-center justify-center p-6 sm:p-10 overflow-hidden group/main-viewport"
          >
            {discountPercent && (
              <div className="absolute top-4 left-4 z-10 px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200 text-[11px] font-black tracking-wider uppercase">
                Tiết kiệm {discountPercent}%
              </div>
            )}

            {currentImage?.colorName && (
              <div className="absolute top-4 right-4 z-10 px-2.5 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide">
                {currentImage.colorName}
              </div>
            )}

            <div className="w-full h-full flex items-center justify-center">
              {!mainImgError && currentImage?.imageUrl ? (
                <>
                  <div
                    onClick={() => {
                      if (validPreviewUrls.length > 0) {
                        setPreviewVisible(true);
                      }
                    }}
                    className="relative w-full h-full flex items-center justify-center cursor-zoom-in group/zoom select-none"
                    title="Nhấn để xem ảnh phóng to"
                  >
                    <img
                      key={currentImage.imageUrl}
                      src={currentImage.imageUrl}
                      alt={currentImage.altText || productName}
                      data-testid="main-product-image"
                      onError={() => setMainImgError(true)}
                      className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover/zoom:scale-[1.02]"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover/zoom:opacity-100 transition-opacity rounded-xl pointer-events-none">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/70 backdrop-blur-md text-xs font-medium text-white shadow-md">
                        <EyeOutlined className="text-sm" />
                        <span>Xem ảnh lớn</span>
                      </div>
                    </div>
                  </div>

                  {validPreviewUrls.length > 0 && (
                    <div className="hidden">
                      <Image.PreviewGroup
                        preview={{
                          visible: previewVisible,
                          onVisibleChange: (vis) => setPreviewVisible(vis),
                          current: Math.max(0, validPreviewUrls.indexOf(currentImage.imageUrl)),
                          onChange: (current) => onSelectImage(current),
                        }}
                        items={validPreviewUrls}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 text-slate-300">
                  <AppleLogo size={80} />
                  <span className="text-xs font-semibold text-slate-400">
                    Chưa có ảnh cho phiên bản này
                  </span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  data-testid="gallery-prev-button"
                  aria-label="Xem ảnh trước"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-blue-600 shadow-sm hover:shadow border border-slate-200 flex items-center justify-center transition-all opacity-0 group-hover/main-viewport:opacity-100 hover:scale-105 cursor-pointer z-10"
                >
                  <LeftOutlined className="text-xs" />
                </button>

                <button
                  type="button"
                  onClick={handleNextImage}
                  data-testid="gallery-next-button"
                  aria-label="Xem ảnh tiếp theo"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-blue-600 shadow-sm hover:shadow border border-slate-200 flex items-center justify-center transition-all opacity-0 group-hover/main-viewport:opacity-100 hover:scale-105 cursor-pointer z-10"
                >
                  <RightOutlined className="text-xs" />
                </button>
              </>
            )}

            {images.length > 1 && (
              <div className="absolute bottom-3 right-4 px-2.5 py-0.5 rounded-md bg-slate-900/60 backdrop-blur-md text-white text-[11px] font-medium">
                {activeImageIndex + 1} / {images.length}
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="relative">
              <div
                ref={thumbStripRef}
                data-testid="thumbnail-strip"
                className="flex items-center gap-2.5 overflow-x-auto p-1 no-scrollbar scroll-smooth"
              >
                {images.map((img, idx) => {
                  if (!img.imageUrl) return null;
                  const isActive = idx === activeImageIndex;
                  return (
                    <button
                      key={`${img.id}-${idx}`}
                      ref={(el) => {
                        thumbnailRefs.current[idx] = el;
                      }}
                      type="button"
                      onClick={() => handleSelectImageIndex(idx)}
                      onMouseEnter={() => handleSelectImageIndex(idx)}
                      data-testid={`thumbnail-${idx}`}
                      data-active={isActive ? "true" : "false"}
                      className={`group relative shrink-0 w-18 h-18 sm:w-20 sm:h-20 rounded-lg bg-white p-1.5 flex items-center justify-center cursor-pointer transition-all duration-150 overflow-hidden ${
                        isActive
                          ? "border-2 border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/10 scale-102"
                          : "border border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                      }`}
                      title={img.altText || `Góc chụp ${idx + 1}`}
                    >
                      <img
                        src={img.imageUrl}
                        alt={img.altText || `Ảnh ${idx + 1}`}
                        className="max-h-full max-w-full object-contain"
                        loading="lazy"
                      />
                      {img.colorName && (
                        <span className="absolute bottom-1 right-1 text-[9px] px-1 py-0.2 bg-slate-900/70 text-white rounded font-medium truncate max-w-[85%]">
                          {img.colorName}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 w-full flex flex-col space-y-5 min-w-0">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {categoryName && (
                <span
                  data-testid="product-category-chip"
                  className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/80 text-[11px] font-bold uppercase tracking-wider"
                >
                  {categoryName}
                </span>
              )}

              {modelCode && (
                <span className="text-[11px] text-slate-400 font-mono">
                  Model: {modelCode}
                </span>
              )}

              {selectedVariant?.sku && (
                <span data-testid="selected-variant-sku" className="text-[11px] text-slate-400 font-mono">
                  SKU: {selectedVariant.sku}
                </span>
              )}

              {warrantyMonths && warrantyMonths > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                  <CheckCircleFilled className="text-emerald-500 text-xs" />
                  Bảo hành {warrantyMonths} tháng
                </span>
              )}
            </div>

            <h1
              data-testid="product-title"
              className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight"
            >
              {productName}
            </h1>
          </div>

          <div className="py-2 border-b border-slate-200/80 flex flex-wrap items-baseline justify-between gap-4">
            <div className="flex items-baseline gap-3">
              <span
                data-testid="product-price"
                className="text-3xl sm:text-4xl font-black text-blue-600 tracking-tight"
              >
                {selectedVariant
                  ? formatVND(selectedVariant.price)
                  : variants && variants.length > 0
                  ? formatVND(Math.min(...variants.map((v) => v.price)))
                  : "Liên hệ"}
              </span>

              {selectedVariant?.compareAtPrice &&
                selectedVariant.compareAtPrice > selectedVariant.price && (
                  <span
                    data-testid="product-compare-at-price"
                    className="text-base sm:text-lg text-slate-400 line-through font-medium"
                  >
                    {formatVND(selectedVariant.compareAtPrice)}
                  </span>
                )}
            </div>

            {discountPercent && (
              <span className="px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200 text-xs font-black">
                Giảm {discountPercent}%
              </span>
            )}
          </div>

          <div
            data-testid="variant-summary-bar"
            className="variant-summary-bar w-full px-3.5 py-2.5 rounded-xl bg-slate-50/90 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs"
          >
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-slate-700 min-w-0">
              {selectedVariant && selectedVariant.variantValues && selectedVariant.variantValues.length > 0 ? (
                selectedVariant.variantValues.map((vv, idx) => (
                  <span key={vv.optionValueId} className="inline-flex items-center gap-1.5 shrink-0">
                    {idx > 0 && <span className="text-slate-300 font-normal select-none">•</span>}
                    {vv.colorHexCode && (
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block shrink-0 shadow-2xs"
                        style={{ backgroundColor: vv.colorHexCode }}
                      />
                    )}
                    <span className="text-slate-500 font-medium">{vv.optionName}:</span>
                    <strong className="text-slate-900 font-semibold">{vv.value}</strong>
                  </span>
                ))
              ) : (
                <span className="text-slate-500 font-medium">Phiên bản chưa đồng bộ</span>
              )}
            </div>

            <div className="shrink-0">
              <span
                data-testid="selected-variant-stock-badge"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                  availableStock > 5
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : availableStock > 0
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    availableStock > 0 ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                  }`}
                />
                <span>
                  {availableStock > 0
                    ? `Còn ${availableStock} sản phẩm`
                    : selectedVariant
                    ? "Tạm thời hết hàng"
                    : "Phiên bản không khả dụng"}
                </span>
              </span>
            </div>
          </div>

          {options && options.length > 0 && (
            <div className="space-y-4 pt-1">
              {options.map((option) => {
                const isColor =
                  option.name.toLowerCase().includes("màu") ||
                  option.values.some((v) => Boolean(v.colorHexCode));
                const selectedValId = selectedOptions[option.id];
                const selectedValName =
                  option.values.find((v) => v.id === selectedValId)?.value || "Chưa chọn";

                const gridColsClass = isColor
                  ? "grid grid-cols-2 sm:grid-cols-3 gap-2.5"
                  : option.values.length === 2
                  ? "grid grid-cols-2 gap-2.5"
                  : option.values.length === 3
                  ? "grid grid-cols-3 gap-2.5"
                  : "grid grid-cols-2 sm:grid-cols-4 gap-2.5";

                return (
                  <div
                    key={option.id}
                    data-testid={`option-group-${option.id}`}
                    className="space-y-2.5 pt-3 border-t border-slate-100 first:border-t-0 first:pt-0"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                        {option.name}
                      </span>
                      <span className="text-slate-600 font-semibold text-xs tracking-tight">
                        {selectedValName}
                      </span>
                    </div>

                    <div
                      data-testid={isColor ? "color-options-group" : "storage-options-group"}
                      className={gridColsClass}
                    >
                      {option.values.map((val) => {
                        const isSelected = val.id === selectedValId;
                        const status = getOptionValueStatus(option.id, val.id);
                        const isDisabled = status.disabled;

                        if (isColor) {
                          return (
                            <button
                              key={val.id}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => {
                                if (!isDisabled) {
                                  onSelectOptionValue(option.id, val.id, true);
                                }
                              }}
                              data-testid={`color-option-${val.id}`}
                              data-selected={isSelected ? "true" : "false"}
                              title={status.reason || val.value}
                              className={`group relative h-10.5 px-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all select-none ${
                                isDisabled
                                  ? "opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200 border-dashed line-through"
                                  : isSelected
                                  ? "border-blue-600 bg-blue-50/50 text-blue-700 ring-2 ring-blue-500/20 cursor-pointer shadow-2xs"
                                  : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white cursor-pointer hover:bg-slate-50/80"
                              }`}
                            >
                              {val.colorHexCode && (
                                <span
                                  className={`w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 shadow-2xs transition-transform ${
                                    isDisabled ? "grayscale opacity-50" : "group-hover:scale-110"
                                  }`}
                                  style={{ backgroundColor: val.colorHexCode }}
                                />
                              )}
                              <span className="truncate text-xs font-semibold">{val.value}</span>
                              {status.badge && (
                                <span className="text-[10px] text-slate-400 font-normal shrink-0">
                                  ({status.badge})
                                </span>
                              )}
                            </button>
                          );
                        }

                        return (
                          <button
                            key={val.id}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => {
                              if (!isDisabled) {
                                onSelectOptionValue(option.id, val.id, false);
                              }
                            }}
                            data-testid={`storage-option-${val.id}`}
                            data-selected={isSelected ? "true" : "false"}
                            title={status.reason || val.value}
                            className={`h-10.5 px-3 rounded-xl border-2 flex items-center justify-center text-center transition-all select-none ${
                              isDisabled
                                ? "opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200 border-dashed line-through"
                                : isSelected
                                ? "border-blue-600 bg-blue-50/50 text-blue-700 ring-2 ring-blue-500/20 cursor-pointer shadow-2xs"
                                : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white cursor-pointer hover:bg-slate-50/80"
                            }`}
                          >
                            <span className="truncate text-xs font-bold">{val.value}</span>
                            {status.badge && (
                              <span className="text-[10px] text-slate-400 font-normal ml-1 shrink-0">
                                ({status.badge})
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="space-y-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Số lượng:
                </span>
                <div className="inline-flex items-center rounded-lg border border-slate-200 overflow-hidden bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || availableStock <= 0 || !selectedVariant}
                    data-testid="quantity-decrease"
                    aria-label="Giảm số lượng"
                    className="w-8.5 h-8.5 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white cursor-pointer transition-colors"
                  >
                    <MinusOutlined className="text-xs" />
                  </button>
                  <span
                    data-testid="quantity-value"
                    className="w-10 text-center text-xs font-bold text-slate-900"
                  >
                    {availableStock <= 0 || !selectedVariant ? 0 : quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onQuantityChange(Math.min(availableStock || 1, quantity + 1))}
                    disabled={availableStock <= 0 || !selectedVariant || quantity >= availableStock}
                    data-testid="quantity-increase"
                    aria-label="Tăng số lượng"
                    className="w-8.5 h-8.5 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white cursor-pointer transition-colors"
                  >
                    <PlusOutlined className="text-xs" />
                  </button>
                </div>
              </div>

              <div className="text-xs text-right shrink-0">
                {selectedVariant && availableStock > 0 ? (
                  <span
                    data-testid="detail-stock-indicator"
                    className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Kho còn: {availableStock} sản phẩm
                  </span>
                ) : (
                  <span
                    data-testid="detail-stock-indicator"
                    className="inline-flex items-center gap-1.5 text-rose-600 font-semibold"
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    {selectedVariant ? "Tạm hết hàng" : "Không có hàng"}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 w-full">
              <button
                type="button"
                onClick={onAddToCart}
                disabled={availableStock <= 0 || !selectedVariant}
                data-testid="add-to-cart-button"
                className="w-full h-12 px-5 rounded-xl bg-blue-50 hover:bg-blue-100/80 text-blue-700 font-bold text-sm border border-blue-200/80 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
              >
                <ShoppingCartOutlined className="text-base" />
                <span>Thêm vào giỏ</span>
              </button>

              <button
                type="button"
                onClick={onBuyNow}
                disabled={availableStock <= 0 || !selectedVariant}
                data-testid="buy-now-button"
                className="w-full h-12 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm border-none flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ThunderboltOutlined className="text-base text-amber-300" />
                <span>Mua ngay</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 px-1 border-y border-slate-200/80">
        <div className="flex items-center gap-2.5">
          <SafetyCertificateOutlined className="text-blue-600 text-lg shrink-0" />
          <div>
            <span className="text-xs font-bold text-slate-900 block">Chính Hãng 100%</span>
            <span className="text-[11px] text-slate-500">Nguyên seal VN/A</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <SyncOutlined className="text-blue-600 text-lg shrink-0" />
          <div>
            <span className="text-xs font-bold text-slate-900 block">Đổi Mới 30 Ngày</span>
            <span className="text-[11px] text-slate-500">Lỗi phần cứng Apple</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <CarOutlined className="text-blue-600 text-lg shrink-0" />
          <div>
            <span className="text-xs font-bold text-slate-900 block">Giao Hỏa Tốc</span>
            <span className="text-[11px] text-slate-500">Miễn phí toàn quốc</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <PhoneOutlined className="text-blue-600 text-lg shrink-0" />
          <div>
            <span className="text-xs font-bold text-slate-900 block">Hỗ Trợ 24/7</span>
            <span className="text-[11px] text-slate-500">Kỹ thuật viên Apple</span>
          </div>
        </div>
      </div>
    </div>
  );
};
