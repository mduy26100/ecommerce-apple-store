import { Modal } from "antd";
import { VariantImageGallery } from "./VariantImageGallery";
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
      width={760}
      destroyOnHidden
    >
      {variant && (
        <div className="mt-4">
          <VariantImageGallery
            variantId={variant.id}
            productId={productId || variant.productId}
          />
        </div>
      )}
    </Modal>
  );
};

export default VariantImagesModal;
