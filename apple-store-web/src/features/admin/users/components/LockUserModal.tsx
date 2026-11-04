import { useEffect } from "react";
import { Modal, Form, Select, InputNumber, Input, message, Alert } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useLockUser } from "../hooks/useUsers";
import type { UserItem, LockUserPayload } from "../types/user.types";

interface LockUserModalProps {
  open: boolean;
  user: UserItem | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export const LockUserModal = ({ open, user, onCancel, onSuccess }: LockUserModalProps) => {
  const [form] = Form.useForm();
  const { mutate: lockUser, isPending } = useLockUser();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        durationPreset: 7,
        customDays: 7,
        reason: "",
      });
    }
  }, [open, form]);

  const handleSubmit = (values: any) => {
    if (!user) return;

    const days = values.durationPreset === "custom"
      ? (values.customDays ?? 7)
      : Number(values.durationPreset);

    const payload: LockUserPayload = {
      days,
      reason: values.reason ? values.reason.trim() : undefined,
    };

    lockUser(
      { id: user.id, payload },
      {
        onSuccess: () => {
          message.success(`Đã khóa tài khoản người dùng thành công trong ${days} ngày!`);
          onSuccess();
        },
        onError: (error: any) => {
          const errorMsg =
            error?.response?.data?.error?.message ||
            error?.message ||
            "Khóa tài khoản thất bại!";
          message.error(errorMsg);
        },
      }
    );
  };

  const preset = Form.useWatch("durationPreset", form);

  return (
    <Modal
      open={open}
      title={
        <div className="flex items-center gap-2 text-red-600">
          <LockOutlined />
          <span>Tạm Khóa Tài Khoản Người Dùng</span>
        </div>
      }
      okText="Xác nhận khóa"
      okButtonProps={{ danger: true }}
      cancelText="Hủy"
      confirmLoading={isPending}
      onCancel={onCancel}
      onOk={() => form.submit()}
      destroyOnClose
    >
      <Alert
        message={`Khóa tài khoản: ${user?.fullName || user?.email || ""}`}
        description="Khi bị khóa, người dùng sẽ không thể đăng nhập hoặc làm mới phiên trên bất kỳ thiết bị nào cho đến khi hết thời hạn."
        type="warning"
        showIcon
        className="my-3 text-xs"
      />

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="durationPreset"
          label="Thời hạn khóa tài khoản"
          rules={[{ required: true, message: "Vui lòng chọn thời hạn khóa!" }]}
        >
          <Select
            id="lockDurationSelect"
            options={[
              { label: "1 ngày", value: 1 },
              { label: "3 ngày", value: 3 },
              { label: "7 ngày (Mặc định)", value: 7 },
              { label: "14 ngày (2 tuần)", value: 14 },
              { label: "30 ngày (1 tháng)", value: 30 },
              { label: "Tùy chỉnh số ngày", value: "custom" },
            ]}
          />
        </Form.Item>

        {preset === "custom" && (
          <Form.Item
            name="customDays"
            label="Số ngày khóa"
            rules={[
              { required: true, message: "Vui lòng nhập số ngày khóa!" },
              { type: "number", min: 1, max: 365, message: "Số ngày từ 1 đến 365!" },
            ]}
          >
            <InputNumber id="customLockDays" min={1} max={365} className="w-full" placeholder="Nhập số ngày..." />
          </Form.Item>
        )}

        <Form.Item name="reason" label="Lý do khóa (Tùy chọn)">
          <Input.TextArea
            id="lockReason"
            rows={2}
            placeholder="Ghi chú lý do vi phạm hoặc yêu cầu tạm khóa..."
            maxLength={200}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default LockUserModal;

