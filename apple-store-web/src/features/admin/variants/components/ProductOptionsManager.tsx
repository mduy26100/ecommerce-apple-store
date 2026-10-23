import { useState } from "react";
import {
  Button,
  Input,
  Form,
  Space,
  Tag,
  Popconfirm,
  Empty,
  Spin,
  Alert,
  ColorPicker,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  TagsOutlined,
  BgColorsOutlined,
} from "@ant-design/icons";
import {
  useProductOptions,
  useCreateProductOption,
  useUpdateProductOption,
  useDeleteProductOption,
  useCreateProductOptionValue,
  useUpdateProductOptionValue,
  useDeleteProductOptionValue,
} from "../hooks/useVariants";

interface ProductOptionsManagerProps {
  productId: number;
}

export const ProductOptionsManager = ({ productId }: ProductOptionsManagerProps) => {
  const { data: options = [], isLoading } = useProductOptions(productId);
  const createOptionMutation = useCreateProductOption(productId);
  const updateOptionMutation = useUpdateProductOption(productId);
  const deleteOptionMutation = useDeleteProductOption(productId);

  const createValueMutation = useCreateProductOptionValue(productId);
  const updateValueMutation = useUpdateProductOptionValue(productId);
  const deleteValueMutation = useDeleteProductOptionValue(productId);

  const [addingOption, setAddingOption] = useState(false);
  const [optionForm] = Form.useForm();

  const [editingOptionId, setEditingOptionId] = useState<number | null>(null);
  const [editingOptionName, setEditingOptionName] = useState("");

  const [activeAddingValueOptionId, setActiveAddingValueOptionId] = useState<number | null>(null);
  const [valueForm] = Form.useForm();
  const [newColorHex, setNewColorHex] = useState("#1677ff");

  const [editingValueId, setEditingValueId] = useState<number | null>(null);
  const [editingValueText, setEditingValueText] = useState("");
  const [editingValueColorHex, setEditingValueColorHex] = useState("");

  const isColorOption = (name: string) => {
    const lower = name.toLowerCase();
    return lower.includes("màu") || lower.includes("color");
  };

  const handleCreateOption = async (values: { name: string; displayOrder?: number }) => {
    await createOptionMutation.mutateAsync({
      productId,
      name: values.name.trim(),
      displayOrder: values.displayOrder ?? options.length + 1,
    });
    optionForm.resetFields();
    setAddingOption(false);
  };

  const handleSaveOptionName = async (optionId: number, currentDisplayOrder: number) => {
    if (!editingOptionName.trim()) return;
    await updateOptionMutation.mutateAsync({
      id: optionId,
      payload: {
        name: editingOptionName.trim(),
        displayOrder: currentDisplayOrder,
      },
    });
    setEditingOptionId(null);
  };

  const handleStartAddValue = (optId: number) => {
    setActiveAddingValueOptionId(optId);
    valueForm.resetFields();
    setNewColorHex("#1677ff");
    setEditingValueId(null);
  };

  const handleCreateValue = async (
    optionId: number,
    values: { value: string; colorHexCode?: string }
  ) => {
    await createValueMutation.mutateAsync({
      optionId,
      value: values.value.trim(),
      colorHexCode: values.colorHexCode?.trim() || undefined,
    });
    valueForm.resetFields();
    setActiveAddingValueOptionId(null);
  };

  const handleStartEditValue = (val: {
    id: number;
    value: string;
    colorHexCode?: string | null;
  }) => {
    setEditingValueId(val.id);
    setEditingValueText(val.value);
    setEditingValueColorHex(val.colorHexCode || "");
    setActiveAddingValueOptionId(null);
  };

  const handleSaveValue = async (valueId: number, currentDisplayOrder: number) => {
    if (!editingValueText.trim()) return;
    await updateValueMutation.mutateAsync({
      id: valueId,
      payload: {
        value: editingValueText.trim(),
        colorHexCode: editingValueColorHex.trim() || undefined,
        displayOrder: currentDisplayOrder,
      },
    });
    setEditingValueId(null);
  };

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center">
        <Spin tip="Đang tải danh sách thuộc tính..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="font-bold text-slate-800 text-sm m-0">
            Cấu hình nhóm thuộc tính động
          </h4>
          <p className="text-xs text-slate-500 m-0">
            Định nghĩa các đặc tính (Màu sắc, Dung lượng, RAM, Kích thước) để kết hợp tạo thành các biến thể sản phẩm
          </p>
        </div>

        {!addingOption && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAddingOption(true)}
            className="bg-blue-600 hover:bg-blue-700 font-semibold rounded-xl text-xs shrink-0"
          >
            Thêm nhóm thuộc tính
          </Button>
        )}
      </div>

      {addingOption && (
        <div className="p-4 border border-blue-200 bg-blue-50/40 rounded-xl">
          <Form
            form={optionForm}
            layout="inline"
            onFinish={handleCreateOption}
            className="flex items-center gap-3"
          >
            <Form.Item
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên thuộc tính!" }]}
              className="m-0 flex-1 min-w-50"
            >
              <Input placeholder="Tên thuộc tính (Ví dụ: RAM, Màu sắc, Dung lượng)" />
            </Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={createOptionMutation.isPending}
                className="bg-blue-600 font-medium rounded-lg"
              >
                Lưu
              </Button>
              <Button onClick={() => setAddingOption(false)} className="rounded-lg">
                Hủy
              </Button>
            </Space>
          </Form>
        </div>
      )}

      {options.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Sản phẩm này chưa có nhóm thuộc tính nào"
        >
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => setAddingOption(true)}
          >
            Tạo nhóm thuộc tính đầu tiên (Màu sắc, Dung lượng, RAM...)
          </Button>
        </Empty>
      ) : (
        <div className="space-y-4">
          {options.map((opt) => (
            <div
              key={opt.id}
              className="p-4 bg-white border border-slate-200/90 rounded-xl space-y-3 shadow-2xs"
            >
              <div className="flex items-center justify-between gap-2">
                {editingOptionId === opt.id ? (
                  <div className="flex items-center gap-1.5 flex-1 max-w-sm">
                    <Input
                      size="small"
                      value={editingOptionName}
                      onChange={(e) => setEditingOptionName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveOptionName(opt.id, opt.displayOrder);
                        if (e.key === "Escape") setEditingOptionId(null);
                      }}
                      placeholder="Tên nhóm thuộc tính"
                      className="font-semibold text-sm"
                      autoFocus
                    />
                    <Button
                      type="primary"
                      size="small"
                      icon={<CheckOutlined />}
                      loading={updateOptionMutation.isPending}
                      onClick={() => handleSaveOptionName(opt.id, opt.displayOrder)}
                      className="bg-blue-600"
                      title="Lưu tên nhóm"
                    />
                    <Button
                      size="small"
                      icon={<CloseOutlined />}
                      onClick={() => setEditingOptionId(null)}
                      title="Hủy"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <TagsOutlined className="text-blue-600" />
                    <span className="font-bold text-slate-800 text-sm">{opt.name}</span>
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined className="text-xs" />}
                      onClick={() => {
                        setEditingOptionId(opt.id);
                        setEditingOptionName(opt.name);
                      }}
                      className="text-slate-400 hover:text-blue-600 p-0 h-5 w-5 flex items-center justify-center"
                      title="Đổi tên nhóm thuộc tính"
                    />
                    <Tag color="blue" className="rounded-md font-semibold text-xs ml-1">
                      {opt.values.length} giá trị
                    </Tag>
                  </div>
                )}

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="link"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => handleStartAddValue(opt.id)}
                    className="text-xs p-0 text-blue-600 font-medium"
                  >
                    Thêm giá trị
                  </Button>
                  <Popconfirm
                    title="Xóa nhóm thuộc tính"
                    description={`Bạn có chắc muốn xóa nhóm thuộc tính "${opt.name}" và toàn bộ giá trị bên trong?`}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => deleteOptionMutation.mutate(opt.id)}
                  >
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      title="Xóa nhóm thuộc tính"
                    />
                  </Popconfirm>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {opt.values.length === 0 && activeAddingValueOptionId !== opt.id ? (
                  <span className="text-xs text-slate-400 italic">
                    Chưa có giá trị nào. Bấm &quot;Thêm giá trị&quot; để bổ sung.
                  </span>
                ) : (
                  opt.values.map((val) => {
                    if (editingValueId === val.id) {
                      return (
                        <div
                          key={val.id}
                          className="flex items-center gap-1.5 p-1 px-2 rounded-lg bg-blue-50/80 border border-blue-300 text-xs shadow-2xs"
                        >
                          <Input
                            size="small"
                            value={editingValueText}
                            onChange={(e) => setEditingValueText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveValue(val.id, val.displayOrder);
                              if (e.key === "Escape") setEditingValueId(null);
                            }}
                            placeholder="Giá trị"
                            className="w-28 text-xs"
                            autoFocus
                          />
                          {(editingValueColorHex || isColorOption(opt.name)) && (
                            <div className="flex items-center gap-1">
                              <Tooltip title="Kéo chọn màu trên bảng màu">
                                <ColorPicker
                                  format="hex"
                                  value={editingValueColorHex || "#1677ff"}
                                  onChange={(color) => {
                                    const hex = typeof color === "string" ? color : color.toHexString();
                                    setEditingValueColorHex(hex);
                                  }}
                                  size="small"
                                />
                              </Tooltip>
                              <Input
                                size="small"
                                value={editingValueColorHex}
                                onChange={(e) => setEditingValueColorHex(e.target.value)}
                                placeholder="#hex"
                                className="w-20 text-xs"
                              />
                            </div>
                          )}
                          <Button
                            type="primary"
                            size="small"
                            icon={<CheckOutlined className="text-xs" />}
                            loading={updateValueMutation.isPending}
                            onClick={() => handleSaveValue(val.id, val.displayOrder)}
                            className="bg-blue-600 h-6 w-6 p-0 text-xs flex items-center justify-center rounded"
                            title="Lưu"
                          />
                          <Button
                            size="small"
                            icon={<CloseOutlined className="text-xs" />}
                            onClick={() => setEditingValueId(null)}
                            className="h-6 w-6 p-0 text-xs flex items-center justify-center rounded"
                            title="Hủy"
                          />
                        </div>
                      );
                    }

                    return (
                      <div
                        key={val.id}
                        className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 hover:border-slate-300 transition-colors"
                      >
                        {(val.colorHexCode || isColorOption(opt.name)) && (
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs inline-block shrink-0"
                            style={{ backgroundColor: val.colorHexCode || "#94a3b8" }}
                          />
                        )}
                        <span>{val.value}</span>
                        {val.colorHexCode && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {val.colorHexCode}
                          </span>
                        )}
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined className="text-[11px]" />}
                          onClick={() => handleStartEditValue(val)}
                          className="p-0 h-4 w-4 opacity-50 group-hover:opacity-100 flex items-center justify-center text-xs ml-1 text-slate-500 hover:text-blue-600"
                          title="Chỉnh sửa giá trị"
                        />
                        <Popconfirm
                          title="Xóa giá trị"
                          description={`Xóa giá trị "${val.value}"?`}
                          okText="Xóa"
                          cancelText="Hủy"
                          okButtonProps={{ danger: true }}
                          onConfirm={() => deleteValueMutation.mutate(val.id)}
                        >
                          <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined className="text-[11px]" />}
                            className="p-0 h-4 w-4 opacity-50 group-hover:opacity-100 flex items-center justify-center text-xs text-slate-400 hover:text-red-500"
                            title="Xóa giá trị"
                          />
                        </Popconfirm>
                      </div>
                    );
                  })
                )}
              </div>

              {activeAddingValueOptionId === opt.id && (
                <div className="pt-3 border-t border-slate-100 mt-2 bg-slate-50/50 p-2.5 rounded-lg">
                  <Form
                    form={valueForm}
                    layout="inline"
                    onFinish={(vals) => handleCreateValue(opt.id, vals)}
                    className="flex flex-wrap items-center gap-2.5"
                  >
                    <Form.Item
                      name="value"
                      rules={[{ required: true, message: "Nhập giá trị!" }]}
                      className="m-0 min-w-40"
                    >
                      <Input
                        size="small"
                        placeholder="Giá trị (Ví dụ: 16GB, Titan Sa Mạc)"
                        autoFocus
                      />
                    </Form.Item>

                    <div className="flex items-center gap-1.5">
                      <Tooltip title="Bấm để kéo chọn màu trên bảng màu">
                        <ColorPicker
                          format="hex"
                          value={newColorHex}
                          onChange={(c) => {
                            const hex = typeof c === "string" ? c : c.toHexString();
                            setNewColorHex(hex);
                            valueForm.setFieldsValue({ colorHexCode: hex });
                          }}
                          size="small"
                        />
                      </Tooltip>
                      <Form.Item name="colorHexCode" className="m-0 min-w-32">
                        <Input
                          size="small"
                          prefix={<BgColorsOutlined className="text-slate-400 text-xs" />}
                          placeholder="Mã màu #hex"
                          onChange={(e) => {
                            const val = e.target.value.trim();
                            if (val.startsWith("#") && (val.length === 4 || val.length === 7)) {
                              setNewColorHex(val);
                            }
                          }}
                        />
                      </Form.Item>
                    </div>

                    <Space size="small">
                      <Button
                        type="primary"
                        size="small"
                        htmlType="submit"
                        loading={createValueMutation.isPending}
                        className="bg-blue-600 font-medium rounded-md text-xs"
                      >
                        Lưu
                      </Button>
                      <Button
                        size="small"
                        onClick={() => setActiveAddingValueOptionId(null)}
                        className="rounded-md text-xs"
                      >
                        Hủy
                      </Button>
                    </Space>
                  </Form>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Alert
        message="Lưu ý khi cấu hình thuộc tính"
        description="Khi thêm thuộc tính mới hoặc cập nhật giá trị thuộc tính (tên, mã màu), các biến thể sản phẩm liên kết sẽ tự động đồng bộ theo các giá trị này để khách hàng có thể chọn mua chính xác trên trang chi tiết sản phẩm."
        type="info"
        showIcon
        className="rounded-xl text-xs"
      />
    </div>
  );
};

export default ProductOptionsManager;
