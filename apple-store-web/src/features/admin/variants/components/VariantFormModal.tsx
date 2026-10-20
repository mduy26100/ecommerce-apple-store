import { useEffect } from "react";
import { Modal, Form, Input, InputNumber, Switch, Select } from "antd";
import { useColorsAll, useStorageOptionsAll } from "@features/admin";
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
  const { data: colors = [], isLoading: isLoadingColors } = useColorsAll();
  const { data: storageOptions = [], isLoading: isLoadingStorage } = useStorageOptionsAll();

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.setFieldsValue({
          sku: initialData.sku,
          variantName: initialData.variantName,
          colorId: initialData.colorId,
          storageOptionId: initialData.storageOptionId,
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
        });
      }
    }
  }, [open, initialData, form]);

  const handleFinish = (values: any) => {
    if (isEditing) {
      onSubmit({
        sku: values.sku.trim().toUpperCase(),
        variantName: values.variantName ? values.variantName.trim() : undefined,
        colorId: values.colorId,
        storageOptionId: values.storageOptionId,
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
        colorId: values.colorId,
        storageOptionId: values.storageOptionId,
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
      title={isEditing ? "Chỉnh sửa phiên bản" : "Thêm phiên bản mới"}
      okText="Lưu"
      cancelText="Hủy"
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      onOk={() => form.submit()}
      destroyOnHidden
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="mt-4"
        initialValues={{ price: 0, quantityInStock: 10, isActive: true }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <Form.Item
            label="Màu sắc"
            name="colorId"
          >
            <Select
              id="colorId"
              className="w-full!"
              allowClear
              placeholder="Chọn màu sắc"
              loading={isLoadingColors}
              options={colors.map((c) => ({
                value: c.id,
                label: (
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full border border-slate-300 inline-block"
                      style={{ backgroundColor: c.hexCode || undefined }}
                    />
                    <span>{c.name}</span>
                  </div>
                ),
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Dung lượng bộ nhớ"
            name="storageOptionId"
          >
            <Select
              id="storageOptionId"
              className="w-full!"
              allowClear
              placeholder="Chọn dung lượng"
              loading={isLoadingStorage}
              options={storageOptions.map((s) => ({
                value: s.id,
                label: s.name,
              }))}
            />
          </Form.Item>
        </div>

        <Form.Item
          label="Mã SKU (duy nhất)"
          name="sku"
          rules={[
            { required: true, whitespace: true, message: "Vui lòng nhập mã SKU!" },
            { max: 100, message: "Mã SKU tối đa 100 ký tự!" },
          ]}
        >
          <Input id="sku" placeholder="Ví dụ: IP16PM-256GB-DESERT" className="uppercase font-mono" />
        </Form.Item>

        <Form.Item
          label="Tên hiển thị phiên bản"
          name="variantName"
          rules={[{ max: 200, message: "Tên phiên bản tối đa 200 ký tự!" }]}
        >
          <Input id="variantName" placeholder="Ví dụ: 256GB - Titan Sa Mạc" />
        </Form.Item>

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

          <Form.Item
            label="Giá so sánh / Giá gốc (VNĐ)"
            name="compareAtPrice"
          >
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
    </Modal>
  );
};

export default VariantFormModal;
