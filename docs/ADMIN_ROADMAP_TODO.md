# KẾ HOẠCH & BẢNG TIẾN ĐỘ TRIỂN KHAI PHÂN HỆ QUẢN TRỊ (Admin Roadmap & Todo List)

> **HƯỚNG DẪN DÀNH CHO AI AGENT & KỸ SƯ:**
> - Tài liệu này là kim chỉ nam điều phối tiến độ. Mỗi khi bắt đầu một tính năng mới, hãy tìm mục `[ ]` đầu tiên chưa hoàn thành.
> - Tuyệt đối làm theo trình tự từ trên xuống dưới, không nhảy cóc.
> - **Môi trường Test - Thao tác DB thoải mái:** Toàn quyền Thêm, Sửa, Xóa dữ liệu thật trong Database (`AppleStoreDb`) qua UI hoặc API. Khuyến khích tạo dữ liệu sản phẩm Apple thực tế để làm giàu catalog cho hệ thống.
> - Sau khi hoàn thành code BE + FE của một tính năng $\rightarrow$ **bắt buộc chạy kiểm thử Playwright Headless trong Terminal**.
> - Chỉ khi toàn bộ kịch bản test báo **PASS 100%**, thực hiện commit theo chuẩn tại [GIT_WORKFLOW.md](file:///c:/Users/Admin/Documents/ecommerce-apple-store/docs/GIT_WORKFLOW.md), chủ động `git push`, sau đó **đổi `[ ]` thành `[x]`** trong file này rồi mới chuyển sang tính năng tiếp theo!

---

## BẢNG TIẾN ĐỘ TỔNG QUAN (PROGRESS SUMMARY)

| Giai đoạn | Nội dung công việc | Trạng thái |
| :--- | :--- | :--- |
| **Giai đoạn 0** | Nền tảng môi trường & Cấu hình Playwright Headless | [x] Hoàn thành |
| **Giai đoạn 1** | Quản lý Màu sắc sản phẩm (Colors CRUD) | [x] Hoàn thành |
| **Giai đoạn 2** | Quản lý Tùy chọn dung lượng (StorageOptions CRUD) | [x] Hoàn thành |
| **Giai đoạn 3** | Quản trị Danh mục sản phẩm (Categories Admin UI) | [x] Hoàn thành |
| **Giai đoạn 4** | Quản lý Dòng sản phẩm (Products CRUD) | [x] Hoàn thành |
| **Giai đoạn 5** | Quản lý Biến thể & Tồn kho (ProductVariants CRUD) | [x] Hoàn thành |
| **Giai đoạn 6** | Quản lý Ảnh biến thể (VariantImages CRUD & Gallery) | [x] Hoàn thành |
| **Giai đoạn 7** | Quản lý Thông số kỹ thuật (ProductSpecifications CRUD) | [x] Hoàn thành |
| **Giai đoạn 8** | Quản lý Đơn hàng & Snapshot (Orders & OrderItems View/Status) | [x] Hoàn thành |
| **Giai đoạn 9** | Kiểm thử Hồi quy Toàn diện Cuối cùng (Full Headless Regression Test) | [x] Hoàn thành |

---

## CHI TIẾT TỪNG GIAI ĐOẠN & TODO LIST

---

### GIAI ĐOẠN 0: NỀN TẢNG MÔI TRƯỜNG & PLAYWRIGHT HEADLESS
- [x] Cài đặt `@playwright/test` và Chromium headless trong thư mục `apple-store-web`
- [x] Cấu hình file `apple-store-web/playwright.config.ts` với `headless: true`, `screenshot: 'off'`, `trace: 'off'`
- [x] Thêm script chạy test vào `apple-store-web/package.json`: `"test:e2e": "playwright test"`
- [x] Khởi chạy Backend (`dotnet run`) và Frontend (`npm run dev`) chạy ngầm, xác nhận cổng mạng 5044 và 5173 hoạt động
- [x] Tạo kịch bản kiểm thử mẫu `e2e/smoke-test.spec.ts` kiểm tra trang chủ và cổng admin
- [x] Chạy lệnh `npx playwright test e2e/smoke-test.spec.ts` và xác nhận PASS trên terminal
- [x] Commit: `chore: setup headless playwright testing environment` & `git push`

---

### GIAI ĐOẠN 1: QUẢN LÝ MÀU SẮC SẢN PHẨM (COLORS CRUD)
#### Backend (`apple-store-app`):
- [x] Tạo DTOs tại `Application/Features/Catalog/Colors/DTOs/` (`ColorDto.cs`, `CreateColorRequest.cs`, `UpdateColorRequest.cs`, `ColorPagedRequest.cs`)
- [x] Tạo Specifications tại `Application/Features/Catalog/Colors/Specifications/` (`ColorFilterSpec.cs`, `ColorByCodeSpec.cs`, `ColorByNameSpec.cs`)
- [x] Tạo Service interface & implementation tại `Application/Features/Catalog/Colors/Services/` (`IColorService.cs`, `ColorService.cs`)
- [x] Đăng ký `services.AddScoped<IColorService, ColorService>();` trong `DependencyInjection.cs`
- [x] Tạo Controller tại `Host/Controllers/Manager/ColorsController.cs` và `Host/Controllers/Public/ColorsController.cs`

#### Frontend (`apple-store-web`):
- [x] Tạo types tại `src/features/admin/colors/types/colors.types.ts`
- [x] Tạo API client tại `src/features/admin/colors/api/colors.api.ts`
- [x] Tạo React Query hooks tại `src/features/admin/colors/hooks/useColors.ts`
- [x] Tạo components: Bảng màu sắc `ColorsTable.tsx`, Modal tạo/sửa `ColorFormModal.tsx` với ColorPicker
- [x] Tạo trang quản trị `src/pages/admin/Colors/ColorsPage.tsx`
- [x] Cập nhật định tuyến `AppRouter.tsx` (`/admin/colors`) và menu sidebar `menuItems.ts`

#### Kiểm thử & Hoàn tất:
- [x] Viết kịch bản kiểm thử headless `e2e/admin-colors.spec.ts` (test tạo mới, xem danh sách, cập nhật, xóa, bắt lỗi trùng code)
- [x] Chạy ngầm kịch bản: `npx playwright test e2e/admin-colors.spec.ts`
- [x] Đọc log terminal, sửa lỗi nếu có đến khi PASS 100%
- [x] Commit: `feat: implement manager colors crud module` & `git push`
- [x] Đánh dấu `[x]` hoàn thành Giai đoạn 1

---

### GIAI ĐOẠN 2: QUẢN LÝ TÙY CHỌN DUNG LƯỢNG (STORAGE OPTIONS CRUD)
#### Backend (`apple-store-app`):
- [x] Tạo DTOs tại `Application/Features/Catalog/StorageOptions/DTOs/` (`StorageOptionDto.cs`, `CreateStorageOptionRequest.cs`, `UpdateStorageOptionRequest.cs`, `StorageOptionPagedRequest.cs`)
- [x] Tạo Specifications tại `Application/Features/Catalog/StorageOptions/Specifications/` (`StorageOptionFilterSpec.cs`, `StorageOptionByNameSpec.cs`)
- [x] Tạo Service tại `Application/Features/Catalog/StorageOptions/Services/` (`IStorageOptionService.cs`, `StorageOptionService.cs`)
- [x] Đăng ký DI trong `DependencyInjection.cs`
- [x] Tạo Controllers tại `Host/Controllers/Manager/StorageOptionsController.cs` và `Host/Controllers/Public/StorageOptionsController.cs`

#### Frontend (`apple-store-web`):
- [x] Tạo types tại `src/features/admin/storage-options/types/storage.types.ts`
- [x] Tạo API client tại `src/features/admin/storage-options/api/storage.api.ts`
- [x] Tạo hooks React Query tại `src/features/admin/storage-options/hooks/useStorageOptions.ts`
- [x] Tạo components: `StorageOptionsTable.tsx`, `StorageOptionFormModal.tsx`
- [x] Tạo trang `src/pages/admin/StorageOptions/StorageOptionsPage.tsx`
- [x] Đăng ký route `/admin/storage-options` và menu sidebar `menuItems.ts`

#### Kiểm thử & Hoàn tất:
- [x] Viết kịch bản `e2e/admin-storage-options.spec.ts`
- [x] Chạy ngầm: `npx playwright test e2e/admin-storage-options.spec.ts`
- [x] Đọc log terminal, sửa lỗi nếu có đến khi PASS 100%
- [x] Commit: `feat: implement manager storage options module` & `git push`
- [x] Đánh dấu `[x]` hoàn thành Giai đoạn 2

---

### GIAI ĐOẠN 3: QUẢN TRỊ DANH MỤC SẢN PHẨM (CATEGORIES ADMIN UI)
#### Backend (`apple-store-app`):
- [x] Xác nhận Backend `CategoriesController.cs` và `CategoryService.cs` đã đáp ứng đầy đủ API Manager
- [x] Kiểm tra các ràng buộc logic: không cho phép xóa danh mục khi có sản phẩm liên kết

#### Frontend (`apple-store-web`):
- [x] Tạo types tại `src/features/admin/categories/types/category.types.ts`
- [x] Tạo API client tại `src/features/admin/categories/api/categories.api.ts`
- [x] Tạo hooks React Query tại `src/features/admin/categories/hooks/useCategories.ts`
- [x] Tạo components: `CategoriesTable.tsx`, `CategoryFormModal.tsx`
- [x] Tạo trang quản trị `src/pages/admin/Categories/CategoriesPage.tsx`
- [x] Đăng ký route `/admin/categories` và mục menu "Danh mục" trong `menuItems.ts`

#### Kiểm thử & Hoàn tất:
- [x] Viết kịch bản `e2e/admin-categories.spec.ts` (test tạo danh mục iPhone/Mac, sửa tên, phân trang)
- [x] Chạy ngầm: `npx playwright test e2e/admin-categories.spec.ts`
- [x] Đọc log terminal, sửa lỗi nếu có đến khi PASS 100%
- [x] Commit: `feat: implement manager categories management ui` & `git push`
- [x] Đánh dấu `[x]` hoàn thành Giai đoạn 3

---

### GIAI ĐOẠN 4: QUẢN LÝ DÒNG SẢN PHẨM (PRODUCTS CRUD)
#### Backend (`apple-store-app`):
- [x] Tạo DTOs tại `Application/Features/Catalog/Products/DTOs/` (`ProductSummaryDto.cs`, `ProductDetailDto.cs`, `CreateProductRequest.cs`, `UpdateProductRequest.cs`, `ProductPagedRequest.cs`)
- [x] Tạo Specifications tại `Application/Features/Catalog/Products/Specifications/` (`ProductFilterSpec.cs`, `ProductBySlugSpec.cs`, `ProductWithDetailsSpec.cs`)
- [x] Tạo Service tại `Application/Features/Catalog/Products/Services/` (`IProductService.cs`, `ProductService.cs`)
- [x] Đăng ký DI trong `DependencyInjection.cs`
- [x] Tạo Controllers tại `Host/Controllers/Manager/ProductsController.cs` và `Host/Controllers/Public/ProductsController.cs`

#### Frontend (`apple-store-web`):
- [x] Tạo types tại `src/features/admin/products/types/product.types.ts`
- [x] Tạo API client tại `src/features/admin/products/api/products.api.ts`
- [x] Tạo hooks React Query tại `src/features/admin/products/hooks/useProducts.ts`
- [x] Tạo components: `ProductsTable.tsx`, `ProductFormDrawer.tsx`, bộ lọc theo danh mục
- [x] Tạo trang danh sách `src/pages/admin/Products/ProductsPage.tsx`
- [x] Đăng ký route `/admin/products` và mục menu "Sản phẩm" trong `menuItems.ts`

#### Kiểm thử & Hoàn tất:
- [x] Viết kịch bản `e2e/admin-products.spec.ts` (tạo sản phẩm iPhone 16 Pro, kiểm tra lọc danh mục, chỉnh sửa)
- [x] Chạy ngầm: `npx playwright test e2e/admin-products.spec.ts`
- [x] Đọc log terminal, sửa lỗi nếu có đến khi PASS 100%
- [x] Commit: `feat: implement manager products catalog module` & `git push`
- [x] Đánh dấu `[x]` hoàn thành Giai đoạn 4

---

### GIAI ĐOẠN 5: QUẢN LÝ BIẾN THỂ & TỒN KHO (PRODUCT VARIANTS CRUD)
#### Backend (`apple-store-app`):
- [x] Tạo DTOs tại `Application/Features/Catalog/ProductVariants/DTOs/` (`ProductVariantDto.cs`, `CreateProductVariantRequest.cs`, `UpdateProductVariantRequest.cs`)
- [x] Tạo Specifications tại `Application/Features/Catalog/ProductVariants/Specifications/` (`VariantsByProductSpec.cs`, `VariantBySkuSpec.cs`)
- [x] Tạo Service tại `Application/Features/Catalog/ProductVariants/Services/` (`IProductVariantService.cs`, `ProductVariantService.cs`) với kiểm tra trùng SKU, non-negative price, kiểm soát `RowVersion`
- [x] Đăng ký DI trong `DependencyInjection.cs`
- [x] Tạo Controller tại `Host/Controllers/Manager/ProductVariantsController.cs`

#### Frontend (`apple-store-web`):
- [x] Tạo types tại `src/features/admin/variants/types/variant.types.ts`
- [x] Tạo API client tại `src/features/admin/variants/api/variants.api.ts`
- [x] Tạo hooks React Query tại `src/features/admin/variants/hooks/useVariants.ts`
- [x] Tạo components: Bảng biến thể `VariantsTable.tsx`, Modal tạo/sửa biến thể `VariantFormModal.tsx`
- [x] Tích hợp tab hoặc drawer quản lý biến thể vào trang chi tiết sản phẩm (`/admin/products/:id`)
- [x] Kiểm tra định dạng tiền tệ VNĐ, badge màu sắc và nhãn dung lượng

#### Kiểm thử & Hoàn tất:
- [x] Viết kịch bản `e2e/admin-variants.spec.ts` (tạo biến thể 256GB Desert Titanium, kiểm tra SKU trùng ném lỗi)
- [x] Chạy ngầm: `npx playwright test e2e/admin-variants.spec.ts`
- [x] Đọc log terminal, sửa lỗi nếu có đến khi PASS 100%
- [x] Commit: `feat: implement product variants and stock management` & `git push`
- [x] Đánh dấu `[x]` hoàn thành Giai đoạn 5

---

### GIAI ĐOẠN 6: QUẢN LÝ ẢNH BIẾN THỂ (VARIANT IMAGES & GALLERY)
#### Backend (`apple-store-app`):
- [x] Tạo DTOs tại `Application/Features/Catalog/VariantImages/DTOs/` (`VariantImageDto.cs`, `CreateVariantImageRequest.cs`, `UpdateVariantImageRequest.cs`)
- [x] Tạo Specifications tại `Application/Features/Catalog/VariantImages/Specifications/` (`ImagesByVariantSpec.cs`)
- [x] Tạo Service tại `Application/Features/Catalog/VariantImages/Services/` (`IVariantImageService.cs`, `VariantImageService.cs`) hỗ trợ logic đặt ảnh đại diện chính duy nhất (`SetPrimaryAsync`)
- [x] Đăng ký DI trong `DependencyInjection.cs`
- [x] Tạo Controller tại `Host/Controllers/Manager/VariantImagesController.cs`

#### Frontend (`apple-store-web`):
- [x] Tạo types tại `src/features/admin/variant-images/types/variant-image.types.ts`
- [x] Tạo API client tại `src/features/admin/variant-images/api/variant-images.api.ts`
- [x] Tạo hooks React Query tại `src/features/admin/variant-images/hooks/useVariantImages.ts`
- [x] Tạo component Gallery: `VariantImageGallery.tsx` hiển thị lưới ảnh, nút đặt làm ảnh chính, nút xóa
- [x] Tích hợp vào Modal/Drawer quản lý biến thể

#### Kiểm thử & Hoàn tất:
- [x] Viết kịch bản `e2e/admin-variant-images.spec.ts` (thêm ảnh cho variant, chuyển đổi ảnh đại diện chính)
- [x] Chạy ngầm: `npx playwright test e2e/admin-variant-images.spec.ts`
- [x] Đọc log terminal, sửa lỗi nếu có đến khi PASS 100%
- [x] Commit: `feat: implement variant image gallery management` & `git push`
- [x] Đánh dấu `[x]` hoàn thành Giai đoạn 6

---

### GIAI ĐOẠN 7: QUẢN LÝ THÔNG SỐ KỸ THUẬT (PRODUCT SPECIFICATIONS CRUD)
#### Backend (`apple-store-app`):
- [x] Tạo DTOs tại `Application/Features/Catalog/ProductSpecifications/DTOs/` (`ProductSpecificationDto.cs`, `CreateProductSpecificationRequest.cs`, `UpdateProductSpecificationRequest.cs`)
- [x] Tạo Specifications tại `Application/Features/Catalog/ProductSpecifications/Specifications/` (`SpecsByProductSpec.cs`)
- [x] Tạo Service tại `Application/Features/Catalog/ProductSpecifications/Services/` (`IProductSpecificationService.cs`, `ProductSpecificationService.cs`)
- [x] Đăng ký DI trong `DependencyInjection.cs`
- [x] Tạo Controller tại `Host/Controllers/Manager/ProductSpecificationsController.cs`

#### Frontend (`apple-store-web`):
- [x] Tạo types tại `src/features/admin/specifications/types/specification.types.ts`
- [x] Tạo API client tại `src/features/admin/specifications/api/specifications.api.ts`
- [x] Tạo hooks React Query tại `src/features/admin/specifications/hooks/useSpecifications.ts`
- [x] Tạo component `SpecificationsManager.tsx` hiển thị thông số theo nhóm `GroupName` và form thêm nhanh
- [x] Tích hợp vào màn hình quản lý sản phẩm
- [x] Tích hợp ngăn kéo `ProductSpecificationsDrawer.tsx` và nút thao tác quản lý thông số trong `ProductsTable.tsx`

#### Kiểm thử & Hoàn tất:
- [x] Viết kịch bản `e2e/admin-specifications.spec.ts` (thêm thông số "Màn hình - Kích thước - 6.3 inch", sửa, xóa)
- [x] Chạy ngầm: `npx playwright test e2e/admin-specifications.spec.ts`
- [x] Đọc log terminal, sửa lỗi nếu có đến khi PASS 100%
- [x] Commit: `feat: implement product specifications management` & `git push`
- [x] Đánh dấu `[x]` hoàn thành Giai đoạn 7

---

### GIAI ĐOẠN 8: QUẢN TRỊ ĐƠN HÀNG & SNAPSHOT (ORDERS MANAGEMENT)
#### Backend (`apple-store-app`):
- [x] Tạo DTOs tại `Application/Features/Sales/Orders/DTOs/` (`OrderSummaryDto.cs`, `OrderDetailDto.cs`, `OrderItemDto.cs`, `OrderPagedRequest.cs`, `UpdateOrderStatusRequest.cs`, `CancelOrderRequest.cs`)
- [x] Tạo Specifications tại `Application/Features/Sales/Orders/Specifications/` (`OrderFilterSpec.cs`, `OrderWithDetailsSpec.cs`)
- [x] Tạo Service tại `Application/Features/Sales/Orders/Services/` (`IOrderService.cs`, `OrderService.cs`) xử lý chuyển đổi trạng thái đơn và hoàn kho khi hủy
- [x] Đăng ký DI trong `DependencyInjection.cs`
- [x] Tạo Controller tại `Host/Controllers/Manager/OrdersController.cs`

#### Frontend (`apple-store-web`):
- [x] Tạo types tại `src/features/admin/orders/types/order.types.ts`
- [x] Tạo API client tại `src/features/admin/orders/api/orders.api.ts`
- [x] Tạo hooks React Query tại `src/features/admin/orders/hooks/useOrders.ts`
- [x] Tạo components: `OrdersTable.tsx`, `OrderDetailDrawer.tsx` (hiển thị snapshot, timeline tiến trình, nút đổi trạng thái)
- [x] Tạo trang quản trị `src/pages/admin/Orders/OrdersPage.tsx`
- [x] Đăng ký route `/admin/orders` và mục menu "Đơn hàng" trong `menuItems.ts`

#### Kiểm thử & Hoàn tất:
- [x] Viết kịch bản `e2e/admin-orders.spec.ts` (xem danh sách đơn hàng, xem chi tiết snapshot sản phẩm, chuyển trạng thái đơn)
- [x] Chạy ngầm: `npx playwright test e2e/admin-orders.spec.ts`
- [x] Đọc log terminal, sửa lỗi nếu có đến khi PASS 100%
- [x] Commit: `feat: implement manager orders and snapshot viewer` & `git push`
- [x] Đánh dấu `[x]` hoàn thành Giai đoạn 8

---

### GIAI ĐOẠN 9: KIỂM THỬ HỒI QUY TOÀN DIỆN CUỐI CÙNG (FULL REGRESSION)
- [x] Tạo kịch bản toàn diện `e2e/admin-full-regression.spec.ts` kết nối liền mạch luồng tạo Danh mục $\rightarrow$ Màu sắc $\rightarrow$ Dung lượng $\rightarrow$ Dòng sản phẩm $\rightarrow$ Biến thể $\rightarrow$ Ảnh $\rightarrow$ Thông số $\rightarrow$ Xem đơn hàng
- [x] Chạy toàn bộ test suite ở chế độ headless: `npx playwright test --reporter=list`
- [x] Xác nhận 100% kịch bản báo PASS, không có bất kỳ console warning hoặc API lỗi nào
- [x] Commit: `test: verify full admin portal regression suite` & `git push`
- [x] Đánh dấu `[x]` hoàn thành Giai đoạn 9 và bàn giao kết quả
