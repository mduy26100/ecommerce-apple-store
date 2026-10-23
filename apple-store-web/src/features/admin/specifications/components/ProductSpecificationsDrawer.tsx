import React from "react";
import { Drawer } from "antd";
import type { ProductItem } from "../../products/types/product.types";
import { SpecificationsManager } from "./SpecificationsManager";

interface ProductSpecificationsDrawerProps {
  open: boolean;
  onClose: () => void;
  product: ProductItem | null;
}

export const ProductSpecificationsDrawer: React.FC<ProductSpecificationsDrawerProps> = ({
  open,
  onClose,
  product,
}) => {
  return (
    <Drawer
      title={
        <div>
          <span className="font-semibold text-slate-800">Thông số kỹ thuật</span>
          {product && (
            <span className="ml-2 text-sm font-normal text-slate-500">
              - {product.name}
            </span>
          )}
        </div>
      }
      open={open}
      onClose={onClose}
      width={880}
      destroyOnClose
    >
      {product && <SpecificationsManager productId={product.id} />}
    </Drawer>
  );
};
