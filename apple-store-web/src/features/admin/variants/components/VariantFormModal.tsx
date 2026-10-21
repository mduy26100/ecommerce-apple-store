import { useEffect } from "react";
import { Modal, Form, Input, InputNumber, Switch, Select, Alert } from "antd";
import { PictureOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useColorsAll, useStorageOptionsAll } from "@features/admin";
import { VariantImageGallery } from "@features/admin/variant-images";
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
      title={
        <div className="flex items-center gap-2">
          <span>
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
      width={840}
      zIndex={1500}
      styles={{
        mask: { zIndex: 1500 },
        wrapper: { zIndex: 1500 },
        body: {
          maxHeight: "78vh",
          overflowY: "auto",
          overflowX: "hidden",
          paddingRight: "6px",
        },
      }}
    >
      <div className="space-y-6 mt-4">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{ price: 0, quantityInStock: 10, isActive: true }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Form.Item label="Màu sắc" name="colorId">
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

            <Form.Item label="Dung lượng bộ nhớ" name="storageOptionId">
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

        {isEditing && initialData ? (
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <PictureOutlined className="text-blue-600 text-base" />
              <h4 className="text-sm font-bold text-slate-800 m-0">
                Bộ sưu tập hình ảnh của phiên bản
              </h4>
            </div>
            <VariantImageGallery
              variantId={initialData.id}
              productId={productId}
            />
          </div>
        ) : (
          <Alert
            message="Bộ sưu tập hình ảnh"
            description="Sau khi lưu tạo mới phiên bản, bạn có thể nhấn vào dòng phiên bản này để tải lên và quản lý ảnh."
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
            className="rounded-lg"
          />
        )}
      </div>
    </Modal>
  );
};

export default VariantFormModal;
