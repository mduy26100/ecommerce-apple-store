import React, { useState } from "react";
import {
  Card,
  Button,
  Space,
  Popconfirm,
  Tag,
  Empty,
  Table,
  Spin,
  Badge,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  AppstoreAddOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  useSpecificationGroups,
  useCreateSpecificationGroup,
  useUpdateSpecificationGroup,
  useDeleteSpecificationGroup,
  useReorderSpecificationGroups,
  useCreateSpecification,
  useUpdateSpecification,
  useDeleteSpecification,
  useReorderSpecifications,
} from "../hooks/useSpecifications";
import type {
  ProductSpecificationGroupDto,
  ProductSpecificationDto,
  CreateProductSpecificationGroupRequest,
  UpdateProductSpecificationGroupRequest,
  CreateProductSpecificationRequest,
  UpdateProductSpecificationRequest,
} from "../types/specification.types";
import { SpecificationGroupModal } from "./SpecificationGroupModal";
import { SpecificationModal } from "./SpecificationModal";

interface SpecificationsManagerProps {
  productId: number;
}

export const SpecificationsManager: React.FC<SpecificationsManagerProps> = ({
  productId,
}) => {
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] =
    useState<ProductSpecificationGroupDto | null>(null);

  const [specModalOpen, setSpecModalOpen] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null);
  const [activeGroupName, setActiveGroupName] = useState<string>("");
  const [editingSpec, setEditingSpec] = useState<ProductSpecificationDto | null>(null);

  const { data: groups = [], isLoading } = useSpecificationGroups(productId);

  const createGroupMutation = useCreateSpecificationGroup(productId);
  const updateGroupMutation = useUpdateSpecificationGroup(productId);
  const deleteGroupMutation = useDeleteSpecificationGroup(productId);
  const reorderGroupsMutation = useReorderSpecificationGroups(productId);

  const createSpecMutation = useCreateSpecification(productId);
  const updateSpecMutation = useUpdateSpecification(productId);
  const deleteSpecMutation = useDeleteSpecification(productId);
  const reorderSpecsMutation = useReorderSpecifications(productId);

  const handleOpenCreateGroup = () => {
    setEditingGroup(null);
    setGroupModalOpen(true);
  };

  const handleOpenEditGroup = (group: ProductSpecificationGroupDto) => {
    setEditingGroup(group);
    setGroupModalOpen(true);
  };

  const handleSubmitGroup = async (
    values:
      | CreateProductSpecificationGroupRequest
      | UpdateProductSpecificationGroupRequest
  ) => {
    if (editingGroup) {
      await updateGroupMutation.mutateAsync({
        id: editingGroup.id,
        payload: values as UpdateProductSpecificationGroupRequest,
      });
    } else {
      await createGroupMutation.mutateAsync(
        values as CreateProductSpecificationGroupRequest
      );
    }
    setGroupModalOpen(false);
    setEditingGroup(null);
  };

  const handleDeleteGroup = async (id: number) => {
    await deleteGroupMutation.mutateAsync(id);
  };

  const handleMoveGroup = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= groups.length) return;

    const reordered = [...groups];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    await reorderGroupsMutation.mutateAsync({
      orderedGroupIds: reordered.map((g) => g.id),
    });
  };

  const handleOpenCreateSpec = (group: ProductSpecificationGroupDto) => {
    setActiveGroupId(group.id);
    setActiveGroupName(group.name);
    setEditingSpec(null);
    setSpecModalOpen(true);
  };

  const handleOpenEditSpec = (
    group: ProductSpecificationGroupDto,
    spec: ProductSpecificationDto
  ) => {
    setActiveGroupId(group.id);
    setActiveGroupName(group.name);
    setEditingSpec(spec);
    setSpecModalOpen(true);
  };

  const handleSubmitSpec = async (
    values: CreateProductSpecificationRequest | UpdateProductSpecificationRequest
  ) => {
    if (editingSpec) {
      await updateSpecMutation.mutateAsync({
        id: editingSpec.id,
        payload: values as UpdateProductSpecificationRequest,
      });
    } else {
      await createSpecMutation.mutateAsync(
        values as CreateProductSpecificationRequest
      );
    }
    setSpecModalOpen(false);
    setEditingSpec(null);
  };

  const handleDeleteSpec = async (id: number) => {
    await deleteSpecMutation.mutateAsync(id);
  };

  const handleMoveSpec = async (
    group: ProductSpecificationGroupDto,
    specIndex: number,
    direction: "up" | "down"
  ) => {
    const targetIndex = direction === "up" ? specIndex - 1 : specIndex + 1;
    if (targetIndex < 0 || targetIndex >= group.specifications.length) return;

    const reordered = [...group.specifications];
    const [moved] = reordered.splice(specIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    await reorderSpecsMutation.mutateAsync({
      groupId: group.id,
      payload: {
        orderedSpecIds: reordered.map((s) => s.id),
      },
    });
  };

  const totalSpecsCount = groups.reduce(
    (acc, g) => acc + (g.specifications?.length || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <FolderOutlined className="text-blue-600" />
            <span>Quản lý thông số kỹ thuật theo nhóm</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng cộng {groups.length} nhóm thông số • {totalSpecsCount} thông số kỹ thuật chi tiết
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenCreateGroup}
          className="bg-blue-600 hover:bg-blue-700 font-medium"
        >
          Thêm nhóm thông số
        </Button>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center items-center">
          <Spin size="large" />
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 text-center">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có nhóm thông số kỹ thuật nào"
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreateGroup}
            >
              Tạo nhóm thông số đầu tiên
            </Button>
          </Empty>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group, groupIndex) => {
            const specColumns: ColumnsType<ProductSpecificationDto> = [
              {
                title: "Thứ tự",
                dataIndex: "displayOrder",
                key: "displayOrder",
                width: 100,
                align: "center",
                render: (_, record, specIndex) => (
                  <div className="flex items-center justify-center gap-1">
                    <span className="w-5 text-center font-bold text-slate-600">
                      {record.displayOrder}
                    </span>
                    <div className="flex flex-col">
                      <Button
                        type="text"
                        size="small"
                        icon={<ArrowUpOutlined className="text-[10px]" />}
                        disabled={specIndex === 0}
                        onClick={() => handleMoveSpec(group, specIndex, "up")}
                        className="h-4 w-4 p-0"
                      />
                      <Button
                        type="text"
                        size="small"
                        icon={<ArrowDownOutlined className="text-[10px]" />}
                        disabled={specIndex === group.specifications.length - 1}
                        onClick={() => handleMoveSpec(group, specIndex, "down")}
                        className="h-4 w-4 p-0"
                      />
                    </div>
                  </div>
                ),
              },
              {
                title: "Tên thông số",
                dataIndex: "name",
                key: "name",
                width: 200,
                render: (text: string) => (
                  <span className="font-semibold text-slate-800">{text}</span>
                ),
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
                title: "Đơn vị",
                dataIndex: "unit",
                key: "unit",
                width: 90,
                align: "center",
                render: (unit: string | null) => (
                  <span className="text-slate-500 font-mono text-xs">
                    {unit || "—"}
                  </span>
                ),
              },
              {
                title: "Thao tác",
                key: "action",
                width: 110,
                align: "center",
                render: (_, record) => (
                  <Space size="small">
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => handleOpenEditSpec(group, record)}
                      aria-label="Sửa thông số"
                    />
                    <Popconfirm
                      title="Xóa thông số kỹ thuật"
                      description="Bạn có chắc chắn muốn xóa thông số này không?"
                      onConfirm={() => handleDeleteSpec(record.id)}
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
              <Card
                key={group.id}
                size="small"
                className="border border-slate-200 rounded-xl shadow-xs overflow-hidden"
                styles={{
                  header: {
                    backgroundColor: "#f8fafc",
                    borderBottom: "1px solid #e2e8f0",
                    padding: "10px 16px",
                  },
                  body: {
                    padding: "12px 16px",
                  },
                }}
                title={
                  <div className="flex items-center gap-2">
                    <Badge
                      count={`#${group.displayOrder}`}
                      style={{
                        backgroundColor: "#2563eb",
                        color: "#fff",
                        fontWeight: "bold",
                      }}
                    />
                    <span className="font-bold text-slate-900 text-sm sm:text-base">
                      {group.name}
                    </span>
                    <Tag color="cyan" className="rounded-full text-xs ml-1">
                      {group.specifications?.length || 0} thông số
                    </Tag>
                  </div>
                }
                extra={
                  <Space size="small">
                    <Button
                      type="text"
                      size="small"
                      icon={<ArrowUpOutlined />}
                      disabled={groupIndex === 0}
                      onClick={() => handleMoveGroup(groupIndex, "up")}
                      aria-label="Chuyển nhóm lên"
                    />
                    <Button
                      type="text"
                      size="small"
                      icon={<ArrowDownOutlined />}
                      disabled={groupIndex === groups.length - 1}
                      onClick={() => handleMoveGroup(groupIndex, "down")}
                      aria-label="Chuyển nhóm xuống"
                    />
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => handleOpenEditGroup(group)}
                      aria-label="Chỉnh sửa nhóm"
                    >
                      Sửa nhóm
                    </Button>
                    <Popconfirm
                      title="Xóa nhóm thông số"
                      description={`Bạn có chắc chắn muốn xóa nhóm "${group.name}" và toàn bộ thông số bên trong không?`}
                      onConfirm={() => handleDeleteGroup(group.id)}
                      okText="Xóa"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true }}
                    >
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        aria-label="Xóa nhóm"
                      />
                    </Popconfirm>
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => handleOpenCreateSpec(group)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Thêm thông số
                    </Button>
                  </Space>
                }
              >
                <div className="space-y-3">
                  <Table
                    dataSource={group.specifications || []}
                    columns={specColumns}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    bordered
                    locale={{
                      emptyText: (
                        <div className="py-4 text-center">
                          <p className="text-xs text-slate-400 mb-2">
                            Nhóm này chưa có thông số kỹ thuật nào
                          </p>
                          <Button
                            type="dashed"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => handleOpenCreateSpec(group)}
                          >
                            Thêm thông số đầu tiên cho nhóm này
                          </Button>
                        </div>
                      ),
                    }}
                  />

                  {group.specifications && group.specifications.length > 0 && (
                    <Button
                      type="dashed"
                      block
                      icon={<AppstoreAddOutlined />}
                      onClick={() => handleOpenCreateSpec(group)}
                      className="text-xs text-slate-600 hover:text-blue-600 hover:border-blue-500"
                    >
                      + Thêm thông số mới vào nhóm "{group.name}"
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <SpecificationGroupModal
        open={groupModalOpen}
        onCancel={() => {
          setGroupModalOpen(false);
          setEditingGroup(null);
        }}
        onSubmit={handleSubmitGroup}
        initialValues={editingGroup}
        loading={
          createGroupMutation.isPending || updateGroupMutation.isPending
        }
        productId={productId}
      />

      <SpecificationModal
        open={specModalOpen}
        onCancel={() => {
          setSpecModalOpen(false);
          setEditingSpec(null);
        }}
        onSubmit={handleSubmitSpec}
        initialValues={editingSpec}
        loading={createSpecMutation.isPending || updateSpecMutation.isPending}
        groupId={activeGroupId ?? 0}
        groupName={activeGroupName}
      />
    </div>
  );
};
