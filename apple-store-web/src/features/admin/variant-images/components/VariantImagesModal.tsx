import { Modal } from "antd";
import { ProductImagesByColorManager } from "@features/admin/product-images";
import type { ProductVariantItem } from "@features/admin/variants";

export interface VariantImagesModalProps {
  open: boolean;
  variant: ProductVariantItem | null;
  productId?: number;
  onCancel: () => void;
}

export const VariantImagesModal = ({
  open,
  variant,
  productId,
  onCancel,
}: VariantImagesModalProps) => {
  const effectiveProductId = productId || variant?.productId || 0;
  const colorValueId = variant?.variantValues?.find(
    (vv) => vv.colorHexCode || vv.optionName?.toLowerCase().includes("màu")
  )?.optionValueId;

  return (
    <Modal
      open={open}
      title={
        <div>
          <span>Bộ sưu tập hình ảnh</span>
          {variant && (
            <span className="text-sm font-normal text-slate-500 ml-2">
              — SKU: {variant.sku} {variant.variantName ? `(${variant.variantName})` : ""}
            </span>
          )}
        </div>
      }
      onCancel={onCancel}
      footer={null}
      width={780}
      zIndex={1500}
      styles={{
        mask: { zIndex: 1500 },
        wrapper: { zIndex: 1500 },
        body: {
          maxHeight: "75vh",
          overflowY: "auto",
          overflowX: "hidden",
          paddingRight: "6px",
        },
      }}
      destroyOnHidden
    >
      {effectiveProductId > 0 && (
        <div className="mt-2">
          <ProductImagesByColorManager
            productId={effectiveProductId}
            initialOptionValueId={colorValueId}
          />
        </div>
      )}
    </Modal>
  );
};

export default VariantImagesModal;
