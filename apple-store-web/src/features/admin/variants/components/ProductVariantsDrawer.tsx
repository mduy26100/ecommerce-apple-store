import { useState } from "react";
import { Drawer, Button, Empty } from "antd";
import { PlusOutlined, AppstoreOutlined } from "@ant-design/icons";
import {
  useVariantsByProduct,
  useCreateVariant,
  useUpdateVariant,
  useDeleteVariant,
} from "../hooks/useVariants";
import { VariantsTable } from "./VariantsTable";
import { VariantFormModal } from "./VariantFormModal";
import type {
  ProductVariantItem,
  CreateVariantPayload,
  UpdateVariantPayload,
} from "../types/variant.types";
import type { ProductItem } from "@features/admin/products";

export interface ProductVariantsDrawerProps {
  open: boolean;
  product: ProductItem | null;
  onClose: () => void;
}

export const ProductVariantsDrawer = ({
  open,
  product,
  onClose,
}: ProductVariantsDrawerProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariantItem | null>(null);

  const productId = product?.id || 0;
  const { data: variants = [], isLoading } = useVariantsByProduct(productId);
  const createMutation = useCreateVariant(productId);
  const updateMutation = useUpdateVariant(productId);
  const deleteMutation = useDeleteVariant(productId);

  const handleOpenCreate = () => {
    setEditingVariant(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (variant: ProductVariantItem) => {
    setEditingVariant(variant);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingVariant(null);
  };

  const handleSubmit = async (values: CreateVariantPayload | UpdateVariantPayload) => {
    if (editingVariant) {
      await updateMutation.mutateAsync(
        { id: editingVariant.id, payload: values as UpdateVariantPayload },
        {
          onSuccess: () => handleCloseModal(),
        }
      );
    } else {
      await createMutation.mutateAsync(values as CreateVariantPayload, {
        onSuccess: () => handleCloseModal(),
      });
    }
  };

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync(id);
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={780}
      title={
        <div className="flex items-center gap-2">
          <AppstoreOutlined className="text-blue-600" />
          <span>Quản lý phiên bản & tồn kho</span>
          {product && (
            <span className="text-sm font-normal text-slate-500">
              — {product.name}
            </span>
          )}
        </div>
      }
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 font-semibold rounded-xl"
        >
          Thêm phiên bản
        </Button>
      }
      destroyOnHidden
    >
      {!product ? (
        <Empty description="Không có thông tin sản phẩm" />
      ) : (
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
            <span className="text-slate-600">
              Sản phẩm: <strong className="text-slate-800">{product.name}</strong> ({product.categoryName})
            </span>
            <span className="text-slate-500 font-mono">
              Slug: /{product.slug}
            </span>
          </div>

          <VariantsTable
            data={variants}
            loading={isLoading}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            isDeleting={deleteMutation.isPending}
          />
        </div>
      )}

      {product && (
        <VariantFormModal
          open={modalOpen}
          productId={product.id}
          initialData={editingVariant}
          confirmLoading={createMutation.isPending || updateMutation.isPending}
          onCancel={handleCloseModal}
          onSubmit={handleSubmit}
        />
      )}
    </Drawer>
  );
};

export default ProductVariantsDrawer;
