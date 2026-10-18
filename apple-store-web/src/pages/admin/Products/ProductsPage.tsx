import { useState, useMemo } from "react";
import { Button, Card, Input, Select } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import PageHeader from "@shared/components/page-header/PageHeader";
import {
  ProductsTable,
  ProductFormModal,
  useProductsPaged,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useCategoriesAll,
} from "@features/admin";
import type {
  ProductItem,
  ProductPagedParams,
  CreateProductPayload,
  UpdateProductPayload,
} from "@features/admin";

export const ProductsPage = () => {
  const [params, setParams] = useState<ProductPagedParams>({
    pageNumber: 1,
    pageSize: 10,
    search: "",
    categoryId: undefined,
    isActive: undefined,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  const { data, isLoading } = useProductsPaged(params);
  const { data: categories = [] } = useCategoriesAll();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams((prev) => ({
      ...prev,
      search: e.target.value,
      pageNumber: 1,
    }));
  };

  const handleCategoryChange = (val?: number) => {
    setParams((prev) => ({
      ...prev,
      categoryId: val,
      pageNumber: 1,
    }));
  };

  const handleStatusChange = (value: string) => {
    setParams((prev) => ({
      ...prev,
      isActive: value === "all" ? undefined : value === "active",
      pageNumber: 1,
    }));
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (product: ProductItem) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (values: CreateProductPayload | UpdateProductPayload) => {
    if (editingProduct) {
      await updateMutation.mutateAsync(
        { id: editingProduct.id, payload: values },
        {
          onSuccess: () => handleCloseModal(),
        }
      );
    } else {
      await createMutation.mutateAsync(values as CreateProductPayload, {
        onSuccess: () => handleCloseModal(),
      });
    }
  };

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync(id);
  };

  const paginationConfig = useMemo(() => {
    const meta = data?.meta?.cursorPagedResult;
    return {
      current: params.pageNumber || 1,
      pageSize: params.pageSize || 10,
      total: meta?.totalCount || (data ? data.length : 0),
      showSizeChanger: true,
      pageSizeOptions: ["10", "20", "50"],
      showTotal: (total: number) => `Tổng cộng ${total} sản phẩm`,
      onChange: (page: number, size: number) => {
        setParams((prev) => ({
          ...prev,
          pageNumber: page,
          pageSize: size,
        }));
      },
    };
  }, [data, params]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          breadcrumbs={["SẢN PHẨM", "QUẢN TRỊ SẢN PHẨM"]}
          title="Quản Lý Sản Phẩm"
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 self-start sm:self-auto shrink-0 font-semibold h-10 px-5 rounded-xl shadow-sm shadow-blue-500/20"
        >
          Thêm sản phẩm
        </Button>
      </div>

      <Card className="border-slate-100 shadow-xs rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
          <Input
            prefix={<SearchOutlined className="text-slate-400 mr-1" />}
            placeholder="Tìm theo tên sản phẩm, slug, mã model..."
            value={params.search}
            onChange={handleSearchChange}
            allowClear
            className="w-full md:max-w-xs rounded-xl"
          />

          <div className="flex flex-wrap items-center gap-3">
            <Select
              allowClear
              placeholder="Tất cả danh mục"
              onChange={handleCategoryChange}
              className="w-full sm:w-48"
              options={categories.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
            />

            <Select
              defaultValue="all"
              onChange={handleStatusChange}
              className="w-full sm:w-40"
              options={[
                { value: "all", label: "Tất cả trạng thái" },
                { value: "active", label: "Hoạt động" },
                { value: "inactive", label: "Tạm khóa" },
              ]}
            />
          </div>
        </div>

        <ProductsTable
          data={data || []}
          loading={isLoading}
          pagination={paginationConfig}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          isDeleting={deleteMutation.isPending}
        />
      </Card>

      <ProductFormModal
        open={modalOpen}
        initialData={editingProduct}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        onCancel={handleCloseModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default ProductsPage;
