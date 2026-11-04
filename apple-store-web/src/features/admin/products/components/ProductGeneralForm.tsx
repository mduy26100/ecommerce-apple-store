import { useEffect } from "react";
import { Form, Input, InputNumber, Switch, Select, Button, Card } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { useCategoriesAll } from "@features/admin/categories";
import type {
  ProductItem,
  ProductDetailItem,
  CreateProductPayload,
  UpdateProductPayload,
} from "../types/product.types";

const toSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
};

export interface ProductGeneralFormProps {
  initialData?: ProductItem | ProductDetailItem | null;
  isEditing?: boolean;
  isLoading?: boolean;
  onSubmit: (values: CreateProductPayload | UpdateProductPayload) => Promise<void>;
}

export const ProductGeneralForm = ({
  initialData,
  isEditing = false,
  isLoading = false,
  onSubmit,
}: ProductGeneralFormProps) => {
  const [form] = Form.useForm();
  const { data: categories = [], isLoading: isLoadingCategories } = useCategoriesAll();

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        categoryId: initialData.categoryId,
        name: initialData.name,
        slug: initialData.slug,
        modelCode: initialData.modelCode,
        warrantyMonths: initialData.warrantyMonths ?? 12,
        shortDescription: initialData.shortDescription,
        description: (initialData as ProductDetailItem).description ?? "",
        isActive: initialData.isActive ?? true,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        warrantyMonths: 12,
        isActive: true,
      });
    }
  }, [initialData, form]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditing) {
      const generatedSlug = toSlug(e.target.value);
      form.setFieldValue("slug", generatedSlug);
    }
  };

  const handleFinish = async (values: any) => {
    const payload: CreateProductPayload | UpdateProductPayload = {
      categoryId: values.categoryId,
      name: values.name.trim(),
      slug: values.slug.trim().toLowerCase(),
      modelCode: values.modelCode ? values.modelCode.trim() : undefined,
      shortDescription: values.shortDescription ? values.shortDescription.trim() : undefined,
      description: values.description ? values.description.trim() : undefined,
      warrantyMonths: values.warrantyMonths,
      isActive: values.isActive ?? true,
    };
    await onSubmit(payload);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{ warrantyMonths: 12, isActive: true }}
      requiredMark="optional"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Thông tin cơ bản" className="border-slate-100 shadow-xs rounded-2xl">
            <Form.Item
              label="Tên sản phẩm"
              name="name"
              rules={[
                { required: true, whitespace: true, message: "Vui lòng nhập tên sản phẩm!" },
                { max: 200, message: "Tên sản phẩm tối đa 200 ký tự!" },
              ]}
            >
              <Input
                id="name"
                placeholder="Ví dụ: iPhone 16 Pro Max, MacBook Pro 14 M3..."
                onChange={handleNameChange}
                className="h-10 rounded-xl"
              />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label="Danh mục sản phẩm"
                name="categoryId"
                rules={[{ required: true, message: "Vui lòng chọn danh mục sản phẩm!" }]}
              >
                <Select
                  id="categoryId"
                  placeholder="Chọn danh mục"
                  loading={isLoadingCategories}
                  className="h-10 rounded-xl"
                  options={categories.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                />
              </Form.Item>

              <Form.Item
                label="Mã model thiết bị"
                name="modelCode"
                rules={[{ max: 50, message: "Mã model tối đa 50 ký tự!" }]}
              >
                <Input
                  id="modelCode"
                  placeholder="Ví dụ: A3106, MYD82VN/A..."
                  className="h-10 rounded-xl"
                />
              </Form.Item>
            </div>

            <Form.Item
              label="Đường dẫn tĩnh (Slug)"
              name="slug"
              rules={[
                { required: true, whitespace: true, message: "Vui lòng nhập slug sản phẩm!" },
                { max: 250, message: "Đường dẫn tối đa 250 ký tự!" },
                {
                  pattern: /^[a-z0-9-]+$/,
                  message: "Đường dẫn chỉ chứa chữ thường, số và dấu gạch nối (-)",
                },
              ]}
            >
              <Input
                id="slug"
                placeholder="Ví dụ: iphone-16-pro-max"
                className="h-10 rounded-xl font-mono"
              />
            </Form.Item>
          </Card>

          <Card title="Nội dung mô tả" className="border-slate-100 shadow-xs rounded-2xl">
            <Form.Item label="Mô tả tóm tắt" name="shortDescription">
              <Input.TextArea
                id="shortDescription"
                rows={3}
                placeholder="Tóm tắt những điểm nhấn đột phá nhất của sản phẩm..."
                maxLength={500}
                showCount
                className="rounded-xl"
              />
            </Form.Item>

            <Form.Item label="Mô tả chi tiết" name="description">
              <Input.TextArea
                id="description"
                rows={8}
                placeholder="Nhập bài viết mô tả chi tiết tính năng, công nghệ, thiết kế của sản phẩm..."
                className="rounded-xl"
              />
            </Form.Item>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Cấu hình & Trạng thái" className="border-slate-100 shadow-xs rounded-2xl">
            <Form.Item
              label="Thời gian bảo hành (tháng)"
              name="warrantyMonths"
              rules={[{ required: true, message: "Vui lòng nhập thời hạn bảo hành!" }]}
            >
              <InputNumber
                id="warrantyMonths"
                className="w-full h-10 rounded-xl flex items-center"
                min={0}
                max={60}
                placeholder="12"
              />
            </Form.Item>

            <Form.Item
              label="Trạng thái hiển thị & kinh doanh"
              name="isActive"
              valuePropName="checked"
            >
              <Switch
                checkedChildren="Đang hoạt động"
                unCheckedChildren="Tạm ẩn / Khóa"
                className="bg-slate-300"
              />
            </Form.Item>

            <div className="pt-4 border-t border-slate-100">
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={isLoading}
                block
                className="h-11 bg-blue-600 hover:bg-blue-700 font-semibold rounded-xl shadow-xs"
              >
                {isEditing ? "Lưu thay đổi sản phẩm" : "Tạo sản phẩm mới"}
              </Button>
            </div>
          </Card>

          {!isEditing && (
            <Card className="border-blue-100 bg-blue-50/50 rounded-2xl">
              <div className="text-xs text-blue-800 leading-relaxed">
                <span className="font-bold block mb-1">Quy trình thiết lập sản phẩm:</span>
                Sau khi tạo thông tin cơ bản thành công, bạn sẽ được chuyển đến trang quản lý đầy đủ để cấu hình Phiên bản (màu sắc, dung lượng, giá bán), Tải lên hình ảnh theo màu và Thông số kỹ thuật.
              </div>
            </Card>
          )}
        </div>
      </div>
    </Form>
  );
};

export default ProductGeneralForm;
