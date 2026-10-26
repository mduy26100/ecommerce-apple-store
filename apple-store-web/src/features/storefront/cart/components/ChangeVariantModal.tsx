import { useState, useMemo, useEffect } from "react";
import { Modal, Button, Spin, Tag } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { useProductOptions, useChangeItemVariant } from "../hooks/useCart";
import type { CartItem, ProductVariantSelector } from "../types/cart.types";

interface ChangeVariantModalProps {
  open: boolean;
  item: CartItem | null;
  onClose: () => void;
}

export const ChangeVariantModal = ({ open, item, onClose }: ChangeVariantModalProps) => {
  const { data, isLoading } = useProductOptions(item?.productId);
  const { mutate: changeVariant, isPending } = useChangeItemVariant();

  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});

  useEffect(() => {
    if (open && data && item) {
      const initial: Record<number, number> = {};

      const currentVariant = data.variants.find((v) => v.id === item.productVariantId);
      if (currentVariant && currentVariant.optionValueIds) {
        data.options.forEach((opt) => {
          const matchedVal = opt.values.find((val) => currentVariant.optionValueIds.includes(val.id));
          if (matchedVal) {
            initial[opt.id] = matchedVal.id;
          }
        });
      }

      data.options.forEach((opt) => {
        if (!initial[opt.id] && opt.values.length > 0) {
          initial[opt.id] = opt.values[0].id;
        }
      });

      setSelectedOptions(initial);
    }
  }, [open, data, item]);

  const selectedVariant: ProductVariantSelector | undefined = useMemo(() => {
    if (!data?.variants || data.variants.length === 0) return undefined;
    const optionIds = (data.options || []).map((o) => o.id);

    if (optionIds.length === 0) {
      return data.variants[0];
    }

    return data.variants.find((v) => {
      const vValIds = v.optionValueIds || [];
      return optionIds.every((optId) => {
        const valId = selectedOptions[optId];
        return valId !== undefined && vValIds.includes(valId);
      });
    });
  }, [data, selectedOptions]);

  const isCurrentVariant = selectedVariant && item && selectedVariant.id === item.productVariantId;
  const isOutOfStock = !selectedVariant || selectedVariant.quantityInStock <= 0 || !selectedVariant.isActive;

  const handleSelectOption = (optionId: number, valueId: number) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionId]: valueId,
    }));
  };

  const handleConfirm = () => {
    if (!item || !selectedVariant || isCurrentVariant || isOutOfStock) return;
    changeVariant(
      {
        cartItemId: item.id,
        newProductVariantId: selectedVariant.id,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const currentPreviewImage = selectedVariant?.imageUrl || data?.primaryImageUrl || item?.imageUrl;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      centered
      width={560}
      title={
        <div data-testid="change-variant-modal-title" className="text-base font-bold text-slate-800 pb-1 border-b border-slate-100">
          Đổi phân loại sản phẩm
        </div>
      }
    >
      {isLoading ? (
        <div data-testid="change-variant-modal-loading" className="py-12 flex flex-col items-center justify-center gap-3">
          <Spin size="large" />
          <span className="text-xs text-slate-500 font-medium">Đang tải danh sách phân loại...</span>
        </div>
      ) : !data ? (
        <div className="py-8 text-center text-slate-500 text-sm">
          Không thể lấy thông tin tùy chọn của sản phẩm.
        </div>
      ) : (
        <div data-testid="change-variant-modal-content" className="pt-3 space-y-5">
          <div className="flex gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-20 h-20 bg-white rounded-lg p-1.5 border border-slate-200/80 flex items-center justify-center shrink-0 overflow-hidden">
              {currentPreviewImage ? (
                <img
                  src={currentPreviewImage}
                  alt={data.productName}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 rounded flex items-center justify-center text-xs text-slate-400">
                  Ảnh
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{data.productName}</h4>
                <div className="text-xs text-slate-500 mt-0.5">
                  Phân loại hiện tại: <span className="font-medium text-slate-700">{item?.variantName || "Mặc định"}</span>
                </div>
              </div>

              <div className="flex items-baseline gap-2 pt-1">
                {selectedVariant ? (
                  <>
                    <span className="text-base font-extrabold text-blue-600">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(selectedVariant.price)}
                    </span>
                    {selectedVariant.compareAtPrice && selectedVariant.compareAtPrice > selectedVariant.price && (
                      <span className="text-xs text-slate-400 line-through">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(selectedVariant.compareAtPrice)}
                      </span>
                    )}
                    <div className="ml-auto">
                      {selectedVariant.isActive && selectedVariant.quantityInStock > 0 ? (
                        <Tag color="success" className="m-0 text-xs font-semibold">
                          Còn {selectedVariant.quantityInStock} máy
                        </Tag>
                      ) : (
                        <Tag color="error" className="m-0 text-xs font-semibold">
                          Tạm hết hàng
                        </Tag>
                      )}
                    </div>
                  </>
                ) : (
                  <span className="text-xs text-rose-500 font-semibold">Tùy chọn không hợp lệ</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-1">
            {data.options.map((option) => (
              <div key={option.id} className="space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  {option.name}
                </div>
                <div className="flex flex-wrap gap-2">
                  {option.values.map((val) => {
                    const isSelected = selectedOptions[option.id] === val.id;
                    return (
                      <button
                        key={val.id}
                        type="button"
                        onClick={() => handleSelectOption(option.id, val.id)}
                        className={`h-9 px-3 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/70 text-blue-700 shadow-2xs font-semibold ring-1 ring-blue-500/20"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
                      >
                        {val.colorHexCode && (
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                            style={{ backgroundColor: val.colorHexCode }}
                          />
                        )}
                        <span>{val.value}</span>
                        {isSelected && <CheckOutlined className="text-[10px] text-blue-600 ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button onClick={onClose} disabled={isPending} className="rounded-lg h-10 px-5 font-medium">
              Đóng
            </Button>
            <Button
              type="primary"
              onClick={handleConfirm}
              loading={isPending}
              disabled={!selectedVariant || Boolean(isCurrentVariant) || isOutOfStock}
              className="rounded-lg h-10 px-6 font-bold bg-blue-600 hover:bg-blue-700 shadow-xs"
              data-testid="confirm-change-variant-btn"
            >
              {isCurrentVariant ? "Đang chọn phân loại này" : isOutOfStock ? "Tạm hết hàng" : "Xác nhận đổi"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
