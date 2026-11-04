import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Card, Badge, Spin, Empty, Button, Select } from "antd";
import {
  InfoCircleOutlined,
  AppstoreOutlined,
  PictureOutlined,
  TagsOutlined,
  SlidersOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import {
  ProductGeneralForm,
  ProductDetailHeader,
  ProductDetailMetrics,
  useProductDetail,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@features/admin/products";
import {
  useVariantsByProduct,
  useCreateVariant,
  useUpdateVariant,
  useDeleteVariant,
  VariantsTable,
  VariantFormModal,
  ProductOptionsManager,
} from "@features/admin/variants";
import { ProductImagesByColorManager } from "@features/admin/product-images";
import { SpecificationsManager } from "@features/admin/specifications";
import type {
  CreateProductPayload,
  UpdateProductPayload,
} from "@features/admin/products";
import type {
  ProductVariantItem,
  CreateVariantPayload,
  UpdateVariantPayload,
} from "@features/admin/variants";

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const isNew = id === "new" || location.pathname.endsWith("/new");
  const productId = isNew ? 0 : Number(id) || 0;

  const urlTab = searchParams.get("tab") || "general";
  const [activeTab, setActiveTab] = useState(urlTab);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariantItem | null>(null);

  const { data: product, isLoading: isLoadingDetail } = useProductDetail(productId);
  const { data: variants = [], isLoading: isLoadingVariants } = useVariantsByProduct(productId);

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  const createVariantMutation = useCreateVariant(productId);
  const updateVariantMutation = useUpdateVariant(productId);
  const deleteVariantMutation = useDeleteVariant(productId);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setSearchParams({ tab: key }, { replace: true });
  };

  const handleCreateProduct = async (values: CreateProductPayload | UpdateProductPayload) => {
    const result = await createProductMutation.mutateAsync(values as CreateProductPayload);
    if (result && result.id) {
      navigate(`/admin/products/${result.id}`);
    } else {
      navigate("/admin/products");
    }
  };

  const handleUpdateProduct = async (values: CreateProductPayload | UpdateProductPayload) => {
    await updateProductMutation.mutateAsync({
      id: productId,
      payload: values as UpdateProductPayload,
    });
  };

  const handleDeleteProduct = async (prodId: number) => {
    await deleteProductMutation.mutateAsync(prodId);
    navigate("/admin/products");
  };

  const handleOpenCreateVariant = () => {
    setEditingVariant(null);
    setVariantModalOpen(true);
  };

  const handleOpenEditVariant = (variant: ProductVariantItem) => {
    setEditingVariant(variant);
    setVariantModalOpen(true);
  };

  const handleCloseVariantModal = () => {
    setVariantModalOpen(false);
    setEditingVariant(null);
  };

  const handleSubmitVariant = async (values: CreateVariantPayload | UpdateVariantPayload) => {
    if (editingVariant) {
      await updateVariantMutation.mutateAsync({
        id: editingVariant.id,
        payload: values as UpdateVariantPayload,
      });
    } else {
      await createVariantMutation.mutateAsync(values as CreateVariantPayload);
    }
    handleCloseVariantModal();
  };

  const handleDeleteVariant = async (variantId: number) => {
    await deleteVariantMutation.mutateAsync(variantId);
  };

  if (isNew) {
    return (
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center text-[10px] sm:text-xs font-semibold text-gray-400 tracking-wider uppercase gap-y-1 select-none">
            <span>SẢN PHẨM</span>
            <span className="mx-2 text-gray-300">/</span>
            <span>QUẢN TRỊ SẢN PHẨM</span>
            <span className="mx-2 text-gray-300">/</span>
            <span className="text-gray-600">THÊM SẢN PHẨM MỚI</span>
          </div>

          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/admin/products")}
            className="w-full sm:w-auto rounded-xl h-10 px-4 font-medium text-xs border-slate-200 text-slate-700 hover:text-blue-600 flex! items-center! justify-center! gap-1.5 shadow-2xs shrink-0"
          >
            Quay lại danh sách
          </Button>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight m-0">
          Thêm Sản Phẩm Mới
        </h1>

        <ProductGeneralForm
          isEditing={false}
          isLoading={createProductMutation.isPending}
          onSubmit={handleCreateProduct}
        />
      </div>
    );
  }

  if (isLoadingDetail) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Spin size="large" />
        <span className="text-slate-500 text-sm">Đang tải dữ liệu sản phẩm...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-16">
        <Card className="max-w-lg mx-auto text-center border-slate-100 shadow-xs rounded-2xl p-6">
          <Empty description="Không tìm thấy thông tin sản phẩm yêu cầu hoặc sản phẩm đã bị xóa" />
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/admin/products")}
            className="mt-4 bg-blue-600 hover:bg-blue-700 rounded-xl"
          >
            Quay lại danh sách
          </Button>
        </Card>
      </div>
    );
  }

  const tabList = [
    {
      key: "general",
      label: "Thông tin chung",
      icon: <InfoCircleOutlined />,
      badge: null,
    },
    {
      key: "variants",
      label: "Phiên bản & Tồn kho",
      icon: <AppstoreOutlined />,
      badge: (
        <Badge
          count={variants.length}
          overflowCount={99}
          color="#2563eb"
          className="ml-0.5"
        />
      ),
    },
    {
      key: "images",
      label: "Hình ảnh theo màu",
      icon: <PictureOutlined />,
      badge: null,
    },
    {
      key: "options",
      label: "Thuộc tính tùy chọn",
      icon: <TagsOutlined />,
      badge: null,
    },
    {
      key: "specs",
      label: "Thông số kỹ thuật",
      icon: <SlidersOutlined />,
      badge: null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center text-[10px] sm:text-xs font-semibold text-gray-400 tracking-wider uppercase gap-y-1 select-none">
          <span>SẢN PHẨM</span>
          <span className="mx-2 text-gray-300">/</span>
          <span>QUẢN TRỊ SẢN PHẨM</span>
          <span className="mx-2 text-gray-300">/</span>
          <span className="text-gray-600">{product.name}</span>
        </div>

        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/admin/products")}
          className="w-full sm:w-auto rounded-xl h-10 px-4 font-medium text-xs border-slate-200 text-slate-700 hover:text-blue-600 flex! items-center! justify-center! gap-1.5 shadow-2xs shrink-0"
        >
          Quay lại danh sách
        </Button>
      </div>

      <ProductDetailHeader
        product={product}
        onDelete={handleDeleteProduct}
        isDeleting={deleteProductMutation.isPending}
      />

      <ProductDetailMetrics product={product} variants={variants} />

      <Card className="border-slate-100 shadow-xs rounded-2xl">
        <div className="block lg:hidden mb-6 w-full">
          <Select
            value={activeTab}
            onChange={handleTabChange}
            className="w-full! h-11! text-sm! font-semibold!"
            options={tabList.map((tab) => ({
              value: tab.key,
              label: (
                <div className="flex items-center justify-between w-full font-medium text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="text-base text-blue-600">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge}
                </div>
              ),
            }))}
          />
        </div>

        <div className="hidden lg:grid grid-cols-5 gap-2.5 w-full mb-6">
          {tabList.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleTabChange(tab.key)}
                className={`flex! items-center! justify-center! text-center! gap-2! px-3! py-3! rounded-xl! border! transition-all! cursor-pointer! w-full! select-none! ${
                  isActive
                    ? "bg-blue-50! border-blue-500! text-blue-600! font-bold! shadow-xs!"
                    : "bg-white! border-slate-200! text-slate-700! hover:bg-slate-50! hover:border-slate-300! font-medium!"
                }`}
              >
                <span className="text-base shrink-0 flex items-center justify-center">
                  {tab.icon}
                </span>
                <span className="text-sm font-semibold truncate!">
                  {tab.label}
                </span>
                {tab.badge}
              </button>
            );
          })}
        </div>

        {activeTab === "general" && (
          <div className="pt-2">
            <ProductGeneralForm
              initialData={product}
              isEditing={true}
              isLoading={updateProductMutation.isPending}
              onSubmit={handleUpdateProduct}
            />
          </div>
        )}

        {activeTab === "variants" && (
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-800 text-base m-0">
                  Danh sách phiên bản sản phẩm
                </h3>
                <p className="text-xs text-slate-500 m-0 mt-0.5">
                  Quản lý các biến thể màu sắc, dung lượng, giá bán, tồn kho và hình ảnh đại diện
                </p>
              </div>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleOpenCreateVariant}
                className="bg-blue-600 hover:bg-blue-700 font-semibold h-10 px-4 rounded-xl shadow-xs shrink-0 w-full sm:w-auto"
              >
                Thêm phiên bản mới
              </Button>
            </div>

            <VariantsTable
              data={variants}
              loading={isLoadingVariants}
              onEdit={handleOpenEditVariant}
              onDelete={handleDeleteVariant}
              isDeleting={deleteVariantMutation.isPending}
            />
          </div>
        )}

        {activeTab === "images" && (
          <div className="pt-2">
            <ProductImagesByColorManager productId={productId} />
          </div>
        )}

        {activeTab === "options" && (
          <div className="pt-2">
            <ProductOptionsManager productId={productId} />
          </div>
        )}

        {activeTab === "specs" && (
          <div className="pt-2">
            <SpecificationsManager productId={productId} />
          </div>
        )}
      </Card>

      <VariantFormModal
        open={variantModalOpen}
        productId={productId}
        initialData={editingVariant}
        confirmLoading={createVariantMutation.isPending || updateVariantMutation.isPending}
        onCancel={handleCloseVariantModal}
        onSubmit={handleSubmitVariant}
      />
    </div>
  );
};

export default ProductDetailPage;
