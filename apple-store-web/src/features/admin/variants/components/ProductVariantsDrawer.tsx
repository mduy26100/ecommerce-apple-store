import { useState, useMemo } from "react";
import { Drawer, Button, Empty, Tabs, Tag, Space, Descriptions, Card, Badge, Spin } from "antd";
import {
  PlusOutlined,
  AppstoreOutlined,
  EditOutlined,
  ShoppingOutlined,
  SlidersOutlined,
  FileTextOutlined,
  BarcodeOutlined,
  SafetyCertificateOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import {
  useVariantsByProduct,
  useCreateVariant,
  useUpdateVariant,
  useDeleteVariant,
} from "../hooks/useVariants";
import { VariantsTable } from "./VariantsTable";
import { VariantFormModal } from "./VariantFormModal";
import { SpecificationsManager } from "@features/admin/specifications";
import { useProductDetail } from "../../products/hooks/useProducts";
import type {
  ProductVariantItem,
  CreateVariantPayload,
  UpdateVariantPayload,
} from "../types/variant.types";
import type { ProductItem } from "../../products/types/product.types";

export interface ProductVariantsDrawerProps {
  open: boolean;
  product: ProductItem | null;
  onClose: () => void;
  onEditProduct?: (product: ProductItem) => void;
}

const formatCurrency = (val?: number | null) => {
  if (val == null) return "Chưa thiết lập";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(val);
};

export const ProductVariantsDrawer = ({
  open,
  product,
  onClose,
  onEditProduct,
}: ProductVariantsDrawerProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariantItem | null>(null);
  const [activeTab, setActiveTab] = useState("variants");

  const productId = product?.id || 0;
  const { data: productDetail, isLoading: isLoadingDetail } = useProductDetail(productId);
  const { data: variants = [], isLoading: isLoadingVariants } = useVariantsByProduct(productId);
  const createMutation = useCreateVariant(productId);
  const updateMutation = useUpdateVariant(productId);
  const deleteMutation = useDeleteVariant(productId);

  const displayProduct = useMemo(() => {
    if (!product) return null;
    return {
      ...product,
      ...productDetail,
      variantsCount: variants.length,
    };
  }, [product, productDetail, variants]);

  const totalStock = useMemo(() => {
    return variants.reduce((sum, v) => sum + (v.quantityInStock || 0), 0);
  }, [variants]);

  const priceRange = useMemo(() => {
    if (variants.length === 0) {
      if (product?.minPrice || product?.maxPrice) {
        return `${formatCurrency(product.minPrice)} - ${formatCurrency(product.maxPrice)}`;
      }
      return "Chưa có phiên bản nào";
    }
    const prices = variants.map((v) => v.price).filter((p) => p > 0);
    if (prices.length === 0) return "Chưa có giá";
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? formatCurrency(min) : `${formatCurrency(min)} - ${formatCurrency(max)}`;
  }, [variants, product]);

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
      width={940}
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShoppingOutlined className="text-base" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">
                Chi tiết sản phẩm & Quản lý phiên bản
              </span>
              {displayProduct && (
                <Tag color={displayProduct.isActive ? "success" : "default"} className="rounded-md">
                  {displayProduct.isActive ? "Đang kinh doanh" : "Tạm khóa"}
                </Tag>
              )}
            </div>
            {displayProduct && (
              <span className="text-xs font-normal text-slate-500">
                {displayProduct.name} ({displayProduct.categoryName})
              </span>
            )}
          </div>
        </div>
      }
      extra={
        <Space>
          {onEditProduct && displayProduct && (
            <Button
              icon={<EditOutlined />}
              onClick={() => onEditProduct(displayProduct)}
              className="rounded-xl font-medium"
            >
              Sửa sản phẩm
            </Button>
          )}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
            className="bg-blue-600 hover:bg-blue-700 font-semibold rounded-xl shadow-xs"
          >
            Thêm phiên bản
          </Button>
        </Space>
      }
      destroyOnHidden
    >
      {!displayProduct ? (
        <Empty description="Không có thông tin sản phẩm" />
      ) : (
        <div className="space-y-6">
          <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-linear-to-br from-slate-50/80 to-white">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-extrabold text-slate-900 m-0">
                    {displayProduct.name}
                  </h2>
                  <Tag color="blue" className="font-semibold text-xs rounded-md">
                    {displayProduct.categoryName}
                  </Tag>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-mono">
                    <BarcodeOutlined className="text-slate-400" />
                    Model: {displayProduct.modelCode || "Chưa có"}
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <LinkOutlined className="text-slate-400" />
                    Slug: /{displayProduct.slug}
                  </span>
                  <span className="flex items-center gap-1">
                    <SafetyCertificateOutlined className="text-slate-400" />
                    Bảo hành: {displayProduct.warrantyMonths ? `${displayProduct.warrantyMonths} tháng` : "Không"}
                  </span>
                </div>

                {displayProduct.shortDescription && (
                  <p className="text-xs text-slate-600 leading-relaxed mt-2 pt-2 border-t border-slate-200/60 line-clamp-2">
                    {displayProduct.shortDescription}
                  </p>
                )}
              </div>

              <div className="flex lg:flex-col items-center lg:items-end justify-between gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                <div className="text-left lg:text-right">
                  <div className="text-xxs uppercase tracking-wider text-slate-400 font-bold">
                    Khoảng giá
                  </div>
                  <div className="text-sm sm:text-base font-black text-rose-600">
                    {priceRange}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Tag color="geekblue" className="rounded-md font-medium text-xs py-0.5">
                    {variants.length} phiên bản
                  </Tag>
                  <Tag color={totalStock > 0 ? "cyan" : "error"} className="rounded-md font-medium text-xs py-0.5">
                    {totalStock} tồn kho
                  </Tag>
                </div>
              </div>
            </div>
          </Card>

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: "variants",
                label: (
                  <span className="flex items-center gap-2 font-semibold">
                    <AppstoreOutlined />
                    <span>Phiên bản & Tồn kho</span>
                    <Badge count={variants.length} overflowCount={99} color="#2563eb" />
                  </span>
                ),
                children: (
                  <div className="space-y-4 pt-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm m-0">
                          Danh sách phiên bản sản phẩm
                        </h4>
                        <p className="text-xs text-slate-500 m-0">
                          Quản lý các biến thể màu sắc, bộ nhớ, giá bán và hình ảnh của sản phẩm này
                        </p>
                      </div>
                    </div>

                    <VariantsTable
                      data={variants}
                      loading={isLoadingVariants}
                      onEdit={handleOpenEdit}
                      onDelete={handleDelete}
                      isDeleting={deleteMutation.isPending}
                    />
                  </div>
                ),
              },
              {
                key: "specs",
                label: (
                  <span className="flex items-center gap-2 font-semibold">
                    <SlidersOutlined />
                    <span>Thông số kỹ thuật</span>
                  </span>
                ),
                children: (
                  <div className="pt-1">
                    <SpecificationsManager productId={productId} />
                  </div>
                ),
              },
              {
                key: "details",
                label: (
                  <span className="flex items-center gap-2 font-semibold">
                    <FileTextOutlined />
                    <span>Mô tả chi tiết</span>
                  </span>
                ),
                children: (
                  <div className="space-y-4 pt-2">
                    {isLoadingDetail ? (
                      <div className="py-12 flex justify-center">
                        <Spin tip="Đang tải thông tin chi tiết..." />
                      </div>
                    ) : (
                      <>
                        <Descriptions
                          bordered
                          size="small"
                          column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                          className="bg-white rounded-xl overflow-hidden"
                        >
                          <Descriptions.Item label="Tên sản phẩm">
                            <span className="font-bold text-slate-800">
                              {displayProduct.name}
                            </span>
                          </Descriptions.Item>
                          <Descriptions.Item label="Danh mục">
                            <Tag color="blue">{displayProduct.categoryName}</Tag>
                          </Descriptions.Item>
                          <Descriptions.Item label="Mã model">
                            <span className="font-mono">{displayProduct.modelCode || "Chưa có"}</span>
                          </Descriptions.Item>
                          <Descriptions.Item label="Đường dẫn (Slug)">
                            <code className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">
                              /{displayProduct.slug}
                            </code>
                          </Descriptions.Item>
                          <Descriptions.Item label="Bảo hành chính hãng">
                            {displayProduct.warrantyMonths ? `${displayProduct.warrantyMonths} tháng` : "Không bảo hành"}
                          </Descriptions.Item>
                          <Descriptions.Item label="Trạng thái">
                            <Tag color={displayProduct.isActive ? "success" : "default"}>
                              {displayProduct.isActive ? "Đang kinh doanh" : "Tạm khóa"}
                            </Tag>
                          </Descriptions.Item>
                        </Descriptions>

                        <div className="space-y-2 mt-4">
                          <h4 className="font-bold text-slate-800 text-sm">
                            Mô tả chi tiết sản phẩm
                          </h4>
                          {displayProduct.description ? (
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">
                              {displayProduct.description}
                            </div>
                          ) : (
                            <div className="p-6 text-center text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                              Chưa có nội dung mô tả chi tiết cho sản phẩm này
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ),
              },
            ]}
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
