import { useState, useMemo } from "react";
import { Button, Card, Input, Select } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import PageHeader from "@shared/components/page-header/PageHeader";
import {
  CategoriesTable,
  CategoryFormModal,
  useCategoriesPaged,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@features/admin";
import type {
  CategoryItem,
  CategoryPagedParams,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@features/admin";

export const CategoriesPage = () => {
  const [params, setParams] = useState<CategoryPagedParams>({
    pageNumber: 1,
    pageSize: 10,
    search: "",
    isActive: undefined,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  const { data, isLoading } = useCategoriesPaged(params);
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams((prev) => ({
      ...prev,
      search: e.target.value,
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
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (category: CategoryItem) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (values: CreateCategoryPayload | UpdateCategoryPayload) => {
    if (editingCategory) {
      await updateMutation.mutateAsync(
        { id: editingCategory.id, payload: values },
        {
          onSuccess: () => handleCloseModal(),
        }
      );
    } else {
      await createMutation.mutateAsync(values, {
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
      showTotal: (total: number) => `Tổng cộng ${total} danh mục`,
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
          breadcrumbs={["DANH MỤC", "QUẢN TRỊ DANH MỤC"]}
          title="Quản Lý Danh Mục Sản Phẩm"
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 self-start sm:self-auto shrink-0 font-semibold h-10 px-5 rounded-xl shadow-sm shadow-blue-500/20"
        >
          Thêm danh mục
        </Button>
      </div>

      <Card className="border-slate-100 shadow-xs rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <Input
            prefix={<SearchOutlined className="text-slate-400 mr-1" />}
            placeholder="Tìm kiếm danh mục theo tên hoặc mô tả..."
            value={params.search}
            onChange={handleSearchChange}
            allowClear
            className="w-full sm:max-w-md rounded-xl"
          />

          <Select
            defaultValue="all"
            onChange={handleStatusChange}
            className="w-full sm:w-44"
            options={[
              { value: "all", label: "Tất cả trạng thái" },
              { value: "active", label: "Hoạt động" },
              { value: "inactive", label: "Tạm khóa" },
            ]}
          />
        </div>

        <CategoriesTable
          data={data || []}
          loading={isLoading}
          pagination={paginationConfig}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          isDeleting={deleteMutation.isPending}
        />
      </Card>

      <CategoryFormModal
        open={modalOpen}
        initialData={editingCategory}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        onCancel={handleCloseModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default CategoriesPage;
