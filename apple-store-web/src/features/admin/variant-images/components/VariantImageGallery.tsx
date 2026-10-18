import { useState } from "react";
import { Form, Input, InputNumber, Button, Card, Popconfirm, Tag, Empty, Spin } from "antd";
import { PlusOutlined, StarOutlined, StarFilled, DeleteOutlined, PictureOutlined } from "@ant-design/icons";
import {
  useVariantImages,
  useCreateVariantImage,
  useSetPrimaryVariantImage,
  useDeleteVariantImage,
} from "../hooks/useVariantImages";

export interface VariantImageGalleryProps {
  variantId: number;
  productId?: number;
}

export const VariantImageGallery = ({
  variantId,
  productId,
}: VariantImageGalleryProps) => {
  const [form] = Form.useForm();
  const [previewUrl, setPreviewUrl] = useState("");

  const { data: images = [], isLoading } = useVariantImages(variantId);
  const createMutation = useCreateVariantImage(variantId, productId);
  const setPrimaryMutation = useSetPrimaryVariantImage(variantId, productId);
  const deleteMutation = useDeleteVariantImage(variantId, productId);

  const handleFinish = async (values: any) => {
    await createMutation.mutateAsync({
      productVariantId: variantId,
      imageUrl: values.imageUrl.trim(),
      altText: values.altText ? values.altText.trim() : undefined,
      displayOrder: values.displayOrder ?? 0,
      isPrimary: values.isPrimary ?? false,
    });
    form.resetFields();
    setPreviewUrl("");
  };

  return (
    <div className="space-y-6">
      <Card
        size="small"
        title="Thêm hình ảnh mới"
        className="border-slate-200 bg-slate-50/50 rounded-xl"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{ displayOrder: 0 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div className="md:col-span-2 space-y-3">
              <Form.Item
                label="Đường dẫn ảnh (URL)"
                name="imageUrl"
                rules={[
                  { required: true, whitespace: true, message: "Vui lòng nhập URL ảnh!" },
                  { type: "url", message: "Đường dẫn URL không hợp lệ!" },
                ]}
                className="mb-2"
              >
                <Input
                  id="imageUrl"
                  placeholder="https://example.com/images/iphone-16-pro.png"
                  onChange={(e) => setPreviewUrl(e.target.value)}
                />
              </Form.Item>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Form.Item label="Mô tả ảnh (Alt Text)" name="altText" className="mb-0">
                  <Input id="altText" placeholder="Mặt trước iPhone 16 Pro" />
                </Form.Item>
                <Form.Item label="Thứ tự hiển thị" name="displayOrder" className="mb-0">
                  <InputNumber id="displayOrder" className="w-full" min={0} placeholder="0" />
                </Form.Item>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-2 border border-dashed border-slate-300 rounded-xl bg-white h-36">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Xem trước"
                  className="max-h-full max-w-full object-contain rounded"
                  onError={() => setPreviewUrl("")}
                />
              ) : (
                <div className="text-center text-slate-400">
                  <PictureOutlined className="text-3xl mb-1" />
                  <div className="text-xs">Xem trước ảnh</div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              type="primary"
              htmlType="submit"
              icon={<PlusOutlined />}
              loading={createMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 font-semibold rounded-lg"
            >
              Thêm ảnh vào bộ sưu tập
            </Button>
          </div>
        </Form>
      </Card>

      <div>
        <div className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <span>Danh sách hình ảnh</span>
          <Tag color="blue">{images.length} ảnh</Tag>
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center">
            <Spin />
          </div>
        ) : images.length === 0 ? (
          <Empty description="Phiên bản này chưa có hình ảnh nào" className="my-8" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((img) => (
              <div
                key={img.id}
                className={`relative group rounded-xl border overflow-hidden bg-white shadow-xs transition-all ${
                  img.isPrimary
                    ? "border-amber-400 ring-2 ring-amber-400/20"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="aspect-square bg-slate-50 flex items-center justify-center p-2">
                  <img
                    src={img.imageUrl}
                    alt={img.altText || "Ảnh sản phẩm"}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="p-2.5 bg-white border-t border-slate-100 flex items-center justify-between gap-1">
                  {img.isPrimary ? (
                    <Tag color="gold" icon={<StarFilled />} className="mr-0 font-semibold">
                      Ảnh chính
                    </Tag>
                  ) : (
                    <Button
                      size="small"
                      type="text"
                      icon={<StarOutlined />}
                      onClick={() => setPrimaryMutation.mutate(img.id)}
                      loading={setPrimaryMutation.isPending}
                      className="text-slate-500 hover:text-amber-500 text-xs px-1"
                    >
                      Đặt chính
                    </Button>
                  )}

                  <Popconfirm
                    title="Xóa ảnh này?"
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => deleteMutation.mutate(img.id)}
                  >
                    <Button
                      size="small"
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      loading={deleteMutation.isPending}
                      title="Xóa"
                    />
                  </Popconfirm>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VariantImageGallery;
