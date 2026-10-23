import { useEffect } from "react";
import { Modal, Form, Input, InputNumber, Switch, Select, Alert, Spin } from "antd";
import { AlertOutlined } from "@ant-design/icons";
import { useProductOptions } from "../hooks/useVariants";
import type {
  ProductVariantItem,
  CreateVariantPayload,
  UpdateVariantPayload,
} from "../types/variant.types";

export interface VariantFormModalProps {
  open: boolean;
  productId: number;
  initialData?: ProductVariantItem | null;
  confirmLoading?: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateVariantPayload | UpdateVariantPayload) => void;
}

export const VariantFormModal = ({
  open,
  productId,
  initialData,
  confirmLoading,
  onCancel,
  onSubmit,
}: VariantFormModalProps) => {
  const [form] = Form.useForm();
  const isEditing = !!initialData;
  const { data: productOptions = [], isLoading: isLoadingOptions } = useProductOptions(productId);

  useEffect(() => {
    if (open) {
      if (initialData) {
        const optionValuesMap: Record<number, number> = {};
        if (initialData.variantValues && initialData.variantValues.length > 0) {
          initialData.variantValues.forEach((item) => {
            optionValuesMap[item.optionId] = item.optionValueId;
          });
        }

        form.setFieldsValue({
          sku: initialData.sku,
          variantName: initialData.variantName,
          optionValues: optionValuesMap,
          price: initialData.price,
          compareAtPrice: initialData.compareAtPrice,
          quantityInStock: initialData.quantityInStock,
          isActive: initialData.isActive,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          price: 0,
          quantityInStock: 10,
          isActive: true,
          optionValues: {},
        });
      }
    }
  }, [open, initialData, form]);

  const handleFinish = (values: any) => {
    const rawOptionValues = values.optionValues || {};
    const optionValueIds: number[] = Object.values(rawOptionValues)
      .map((val) => Number(val))
      .filter((val) => !isNaN(val) && val > 0);

    if (isEditing) {
      onSubmit({
        sku: values.sku.trim().toUpperCase(),
        variantName: values.variantName ? values.variantName.trim() : undefined,
        optionValueIds,
        price: values.price,
        compareAtPrice: values.compareAtPrice,
        quantityInStock: values.quantityInStock,
        rowVersion: initialData?.rowVersion,
        isActive: values.isActive ?? true,
      } as UpdateVariantPayload);
    } else {
      onSubmit({
        productId,
        sku: values.sku.trim().toUpperCase(),
        variantName: values.variantName ? values.variantName.trim() : undefined,
        optionValueIds,
        price: values.price,
        compareAtPrice: values.compareAtPrice,
        quantityInStock: values.quantityInStock,
        isActive: values.isActive ?? true,
      } as CreateVariantPayload);
    }
  };

  return (
    <Modal
      open={open}
      title={
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 text-base">
            {isEditing
              ? `Chi tiết phiên bản — SKU: ${initialData.sku}`
              : "Thêm phiên bản mới"}
          </span>
        </div>
      }
      okText="Lưu thông tin"
      cancelText="Đóng"
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      onOk={() => form.submit()}
      destroyOnHidden
      centered
      width={920}
      zIndex={1500}
      styles={{
        mask: { zIndex: 1500 },
        wrapper: { zIndex: 1500 },
        body: {
          maxHeight: "68vh",
          overflowY: "auto",
          overflowX: "hidden",
          paddingRight: "8px",
        },
      }}
    >
      <div className="space-y-6 mt-4">
        {isLoadingOptions ? (
          <div className="py-6 flex justify-center">
            <Spin tip="Đang tải danh sách thuộc tính..." />
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            initialValues={{ price: 0, quantityInStock: 10, isActive: true }}
          >
            {productOptions.length === 0 ? (
              <Alert
                message="Sản phẩm chưa có nhóm thuộc tính"
                description="Vui lòng thêm các nhóm thuộc tính (ví dụ: Màu sắc, Dung lượng, RAM) tại tab Thuộc tính trước khi thiết lập phiên bản."
                type="warning"
                showIcon
                icon={<AlertOutlined />}
                className="mb-4 rounded-xl"
              />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                  {productOptions.map((opt) => {
                    const isColorOption =
                      opt.name.toLowerCase().includes("màu") ||
                      opt.values.some((v) => Boolean(v.colorHexCode));

                    return (
                      <Form.Item
                        key={opt.id}
                        label={opt.name}
                        name={["optionValues", opt.id]}
                        rules={[{ required: true, message: `Vui lòng chọn ${opt.name}!` }]}
                      >
                        <Select
                          id={`option_${opt.id}`}
                          className="w-full!"
                          placeholder={`Chọn ${opt.name}`}
                          options={opt.values.map((v) => ({
                            value: v.id,
                            label: (
                              <div className="flex items-center gap-2">
                                {isColorOption && (
                                  <span
                                    className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs inline-block shrink-0"
                                    style={{ backgroundColor: v.colorHexCode || "#94a3b8" }}
                                  />
                                )}
                                <span>{v.value}</span>
                              </div>
                            ),
                          }))}
                        />
                      </Form.Item>
                    );
                  })}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                <Form.Item
                  label="Mã SKU (duy nhất)"
                  name="sku"
                  rules={[
                    { required: true, whitespace: true, message: "Vui lòng nhập mã SKU!" },
                    { max: 100, message: "Mã SKU tối đa 100 ký tự!" },
                  ]}
                >
                  <Input
                    id="sku"
                    placeholder="Ví dụ: IP16PM-256GB-DESERT"
                    className="uppercase font-mono"
                  />
                </Form.Item>

                <Form.Item
                  label="Tên hiển thị phiên bản"
                  name="variantName"
                  rules={[{ max: 200, message: "Tên phiên bản tối đa 200 ký tự!" }]}
                >
                  <Input id="variantName" placeholder="Ví dụ: 256GB - Titan Sa Mạc" />
                </Form.Item>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                <Form.Item
                  label="Giá bán (VNĐ)"
                  name="price"
                  rules={[
                    { required: true, message: "Vui lòng nhập giá bán!" },
                    {
                      validator: async (_, value) => {
                        if (value < 0) {
                          throw new Error("Giá bán không được nhỏ hơn 0!");
                        }
                      },
                    },
                  ]}
                >
                  <InputNumber<number>
                    id="price"
                    className="w-full!"
                    min={0}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={(value) => (value ? Number(value.replace(/\$\s?|(,*)/g, "")) : 0)}
                    placeholder="34,990,000"
                  />
                </Form.Item>

                <Form.Item label="Giá so sánh / Giá gốc (VNĐ)" name="compareAtPrice">
                  <InputNumber<number>
                    id="compareAtPrice"
                    className="w-full!"
                    min={0}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={(value) => (value ? Number(value.replace(/\$\s?|(,*)/g, "")) : 0)}
                    placeholder="36,990,000"
                  />
                </Form.Item>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                <Form.Item
                  label="Số lượng tồn kho"
                  name="quantityInStock"
                  rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
                >
                  <InputNumber id="quantityInStock" className="w-full!" min={0} placeholder="10" />
                </Form.Item>

                <Form.Item label="Trạng thái kích hoạt" name="isActive" valuePropName="checked">
                  <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm khóa" />
                </Form.Item>
              </div>
            </Form>
          )}
        </div>
      </Modal>
  );
};

export default VariantFormModal;
