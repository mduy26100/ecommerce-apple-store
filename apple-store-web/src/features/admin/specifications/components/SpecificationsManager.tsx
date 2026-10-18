import React, { useState } from "react";
import { Table, Button, Space, Popconfirm, Tag, Empty } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  useSpecifications,
  useCreateSpecification,
  useUpdateSpecification,
  useDeleteSpecification,
} from "../hooks/useSpecifications";
import type {
  ProductSpecificationDto,
  CreateProductSpecificationRequest,
  UpdateProductSpecificationRequest,
} from "../types/specification.types";
import { SpecificationModal } from "./SpecificationModal";

interface SpecificationsManagerProps {
  productId: number;
}

export const SpecificationsManager: React.FC<SpecificationsManagerProps> = ({
  productId,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSpec, setEditingSpec] = useState<ProductSpecificationDto | null>(null);

  const { data: specifications = [], isLoading } = useSpecifications(productId);
  const createMutation = useCreateSpecification(productId);
  const updateMutation = useUpdateSpecification(productId);
  const deleteMutation = useDeleteSpecification(productId);

  const handleOpenCreate = () => {
    setEditingSpec(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (spec: ProductSpecificationDto) => {
    setEditingSpec(spec);
    setModalOpen(true);
  };

  const handleSubmit = async (
    values: CreateProductSpecificationRequest | UpdateProductSpecificationRequest
  ) => {
    if (editingSpec) {
      await updateMutation.mutateAsync({
        id: editingSpec.id,
        payload: values as UpdateProductSpecificationRequest,
      });
    } else {
      await createMutation.mutateAsync(values as CreateProductSpecificationRequest);
    }
    setModalOpen(false);
    setEditingSpec(null);
  };

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync(id);
  };

  const columns: ColumnsType<ProductSpecificationDto> = [
    {
      title: "Nhóm thông số",
      dataIndex: "groupName",
      key: "groupName",
      width: 160,
      render: (group: string) => (
        <Tag color="blue">{group || "Chung"}</Tag>
      ),
    },
    {
      title: "Tên thông số",
      dataIndex: "name",
      key: "name",
      width: 180,
      render: (text: string) => <span className="font-medium text-slate-800">{text}</span>,
    },
    {
      title: "Giá trị",
      dataIndex: "value",
      key: "value",
      render: (text: string, record) => (
        <span className="text-slate-700">
          {text} {record.unit ? `(${record.unit})` : ""}
        </span>
      ),
    },
    {
      title: "Thứ tự",
      dataIndex: "displayOrder",
      key: "displayOrder",
      width: 90,
      align: "center",
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleOpenEdit(record)}
            aria-label="Sửa thông số"
          />
          <Popconfirm
            title="Xóa thông số kỹ thuật"
            description="Bạn có chắc chắn muốn xóa thông số này không?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              aria-label="Xóa thông số"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-slate-800">
            Danh sách thông số kỹ thuật
          </h3>
          <p className="text-xs text-slate-500">
            Tổng cộng {specifications.length} thông số được cấu hình
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenCreate}
        >
          Thêm thông số
        </Button>
      </div>

      <Table
        dataSource={specifications}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={false}
        locale={{
          emptyText: (
            <Empty
              description="Chưa có thông số kỹ thuật nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ),
        }}
        size="middle"
        bordered
      />

      <SpecificationModal
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingSpec(null);
        }}
        onSubmit={handleSubmit}
        initialValues={editingSpec}
        loading={createMutation.isPending || updateMutation.isPending}
        productId={productId}
      />
    </div>
  );
};
