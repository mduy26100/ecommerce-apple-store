import { useState, useMemo } from "react";
import {
  Table,
  Tag,
  Button,
  Input,
  Select,
  Space,
  Card,
  Avatar,
  Popconfirm,
  Tooltip,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined,
  EditOutlined,
  LockOutlined,
  UnlockOutlined,
  KeyOutlined,
  EyeOutlined,
  UserOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import PageHeader from "@shared/components/page-header/PageHeader";
import {
  useUsers,
  useUnlockUser,
  CreateUserModal,
  EditUserModal,
  LockUserModal,
  ResetPasswordModal,
  UserDetailDrawer,
  type UserItem,
  type UserPagedParams,
} from "@features/admin/users";

export const UsersPage = () => {
  const [params, setParams] = useState<UserPagedParams>({
    pageNumber: 1,
    pageSize: 10,
    search: "",
    status: "all",
  });

  const [searchInput, setSearchInput] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalUser, setEditModalUser] = useState<UserItem | null>(null);
  const [lockModalUser, setLockModalUser] = useState<UserItem | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<UserItem | null>(null);
  const [detailUserId, setDetailUserId] = useState<number | null>(null);

  const queryParams = useMemo(() => {
    return {
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
      search: params.search || undefined,
      status: params.status === "all" ? undefined : params.status,
    };
  }, [params]);

  const { data, isLoading, refetch, isFetching } = useUsers(queryParams);
  const { mutate: unlockUser, isPending: isUnlocking } = useUnlockUser();

  const usersList = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray((data as any).items)) return (data as any).items;
    return [];
  }, [data]);

  const paginationMeta = useMemo(() => {
    const meta = (data as any)?.meta?.cursorPagedResult;
    return {
      current: meta?.pageNumber || params.pageNumber || 1,
      pageSize: meta?.pageSize || params.pageSize || 10,
      total: meta?.totalCount ?? usersList.length,
    };
  }, [data, params, usersList]);

  const handleSearch = (value?: string) => {
    const term = typeof value === "string" ? value : searchInput;
    setParams((prev) => ({
      ...prev,
      pageNumber: 1,
      search: term.trim(),
    }));
  };

  const handleStatusChange = (val: string) => {
    setParams((prev) => ({
      ...prev,
      pageNumber: 1,
      status: val,
    }));
  };

  const handleUnlock = (user: UserItem) => {
    unlockUser(user.id, {
      onSuccess: () => {
        message.success(`Đã mở khóa tài khoản ${user.fullName || user.email} thành công!`);
      },
      onError: (error: any) => {
        const errorMsg =
          error?.response?.data?.error?.message ||
          error?.message ||
          "Mở khóa tài khoản thất bại!";
        message.error(errorMsg);
      },
    });
  };

  const columns: ColumnsType<UserItem> = [
    {
      title: "Khách hàng",
      key: "user",
      width: 260,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={38}
            src={record.avatarUrl || undefined}
            icon={<UserOutlined />}
            className="border border-slate-200 bg-slate-100 shrink-0 text-slate-500"
          />
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate mb-0.5 leading-tight">
              {record.fullName}
            </p>
            <p className="text-xxs text-slate-400 font-mono truncate leading-tight">
              @{record.userName}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Địa chỉ Email",
      dataIndex: "email",
      key: "email",
      width: 220,
      render: (email: string) => (
        <span className="text-xs text-slate-600 font-medium">{email}</span>
      ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      width: 130,
      render: (phone: string | null) => (
        <span className="text-xs text-slate-600">{phone || "—"}</span>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 170,
      render: (_, record) => {
        if (record.isLocked) {
          return (
            <Tooltip
              title={
                record.lockoutEnd
                  ? `Khóa đến: ${new Date(record.lockoutEnd).toLocaleString("vi-VN")}`
                  : "Đang bị khóa"
              }
            >
              <Tag color="red" className="rounded-full px-2.5 py-0.5 font-medium border-none cursor-pointer">
                Tạm khóa {record.lockoutDaysRemaining ? `(${record.lockoutDaysRemaining} ngày)` : ""}
              </Tag>
            </Tooltip>
          );
        }
        return (
          <Tag color="green" className="rounded-full px-2.5 py-0.5 font-medium border-none">
            Đang hoạt động
          </Tag>
        );
      },
    },
    {
      title: "Đơn hàng",
      dataIndex: "totalOrders",
      key: "totalOrders",
      width: 100,
      align: "center",
      render: (count: number) => (
        <span className="text-xs font-semibold text-slate-700">{count} đơn</span>
      ),
    },
    {
      title: "Tổng chi tiêu",
      dataIndex: "totalSpent",
      key: "totalSpent",
      width: 140,
      align: "right",
      render: (spent: number) => (
        <span className="text-xs font-bold text-slate-800">
          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(spent)}
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 180,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Space size={6}>
          <Tooltip title="Xem chi tiết hồ sơ">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setDetailUserId(record.id)}
              className="text-slate-500 hover:text-blue-600 hover:bg-blue-50"
            />
          </Tooltip>

          <Tooltip title="Chỉnh sửa thông tin">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => setEditModalUser(record)}
              className="text-slate-500 hover:text-blue-600 hover:bg-blue-50"
            />
          </Tooltip>

          <Tooltip title="Đặt lại mật khẩu">
            <Button
              type="text"
              size="small"
              icon={<KeyOutlined />}
              onClick={() => setResetPasswordUser(record)}
              className="text-slate-500 hover:text-amber-600 hover:bg-amber-50"
            />
          </Tooltip>

          {record.isLocked ? (
            <Popconfirm
              title="Mở khóa tài khoản"
              description={`Bạn có chắc muốn mở khóa ngay cho tài khoản ${record.fullName}?`}
              okText="Mở khóa"
              cancelText="Hủy"
              onConfirm={() => handleUnlock(record)}
            >
              <Button
                type="text"
                size="small"
                icon={<UnlockOutlined />}
                loading={isUnlocking}
                className="text-emerald-600 hover:bg-emerald-50"
              />
            </Popconfirm>
          ) : (
            <Tooltip title="Tạm khóa tài khoản">
              <Button
                type="text"
                size="small"
                icon={<LockOutlined />}
                onClick={() => setLockModalUser(record)}
                className="text-red-500 hover:bg-red-50"
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          breadcrumbs={["QUẢN TRỊ TÀI KHOẢN"]}
          title="Quản Lý Người Dùng"
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 self-start sm:self-auto shrink-0 font-semibold h-10 px-4 rounded-xl"
        >
          Thêm người dùng mới
        </Button>
      </div>

      <Card className="border-slate-100 shadow-xs rounded-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-5">
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Input.Search
              id="userSearchInput"
              placeholder="Tìm theo tên, email, SĐT, username..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                if (!e.target.value) {
                  setParams((prev) => ({
                    ...prev,
                    pageNumber: 1,
                    search: "",
                  }));
                }
              }}
              onSearch={handleSearch}
              allowClear
              className="flex-1 sm:w-80"
            />

            <Select
              id="userStatusFilter"
              value={params.status}
              onChange={handleStatusChange}
              className="w-36 sm:w-40 shrink-0"
              options={[
                { label: "Tất cả trạng thái", value: "all" },
                { label: "Đang hoạt động", value: "active" },
                { label: "Đang bị khóa", value: "locked" },
              ]}
            />
          </div>

          <Button
            icon={<ReloadOutlined spin={isFetching} />}
            onClick={() => refetch()}
            className="rounded-lg text-xs self-end sm:self-auto shrink-0"
          >
            Làm mới
          </Button>
        </div>

        <Table
          rowKey="id"
          dataSource={usersList}
          columns={columns}
          loading={isLoading}
          scroll={{ x: 1000 }}
          pagination={{
            current: paginationMeta.current,
            pageSize: paginationMeta.pageSize,
            total: paginationMeta.total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total) => `Tổng cộng ${total} người dùng`,
            onChange: (page, size) => {
              setParams((prev) => ({
                ...prev,
                pageNumber: page,
                pageSize: size,
              }));
            },
          }}
        />
      </Card>

      <CreateUserModal
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onSuccess={() => {
          setCreateModalOpen(false);
          refetch();
        }}
      />

      <EditUserModal
        open={!!editModalUser}
        user={editModalUser}
        onCancel={() => setEditModalUser(null)}
        onSuccess={() => {
          setEditModalUser(null);
          refetch();
        }}
      />

      <LockUserModal
        open={!!lockModalUser}
        user={lockModalUser}
        onCancel={() => setLockModalUser(null)}
        onSuccess={() => {
          setLockModalUser(null);
          refetch();
        }}
      />

      <ResetPasswordModal
        open={!!resetPasswordUser}
        user={resetPasswordUser}
        onCancel={() => setResetPasswordUser(null)}
        onSuccess={() => {
          setResetPasswordUser(null);
        }}
      />

      <UserDetailDrawer
        open={typeof detailUserId === "number"}
        userId={detailUserId ?? undefined}
        onClose={() => setDetailUserId(null)}
      />
    </div>
  );
};

export default UsersPage;
