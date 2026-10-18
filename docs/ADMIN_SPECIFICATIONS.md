# TÀI LIỆU ĐẶC TẢ CHI TIẾT PHÂN HỆ QUẢN TRỊ ADMIN (Admin Specifications)

Tài liệu này quy định chi tiết nghiệp vụ, kiến trúc dữ liệu 11 bảng, quy tắc ràng buộc (business rules), API contracts và yêu cầu giao diện (UI/UX) cho phân hệ Quản trị (**Admin Portal**) thuộc dự án **ecommerce-apple-store**.

---

## 1. Nguyên Tắc Thiết Kế Cốt Lõi (Architecture & Domain Principles)

1. **Phân loại danh mục phẳng (Flat Categories):** Chỉ cần phân loại nhóm lớn hệ sinh thái Apple (iPhone, iPad, Mac, Apple Watch, AirPods, Phụ kiện); không dùng phân cấp cây nhiều tầng phức tạp.
2. **Tách biệt Product & ProductVariant:**
   - `Product`: Đại diện cho dòng sản phẩm (Product Line) chứa thông tin thương mại chung (tên dòng, mô tả, bảo hành, model code).
   - `ProductVariant`: Đại diện cho phiên bản vật lý cụ thể để bán (SKU, màu sắc, dung lượng, giá bán, giá so sánh, tồn kho, token khóa đồng thời `RowVersion`).
3. **Không cần bảng Brands:** Toàn bộ sản phẩm là Apple, không cần bảng thương hiệu.
4. **Không cần ProductImages:** Ảnh sản phẩm được quản lý tập trung và chi tiết theo phiên bản thông qua `VariantImages`.
5. **Không cần InventoryStocks:** Tồn kho lưu trực tiếp tại cột `QuantityInStock` của `ProductVariants`.
6. **Thông số kỹ thuật linh hoạt (ProductSpecifications):** Dùng cặp khóa-giá trị linh hoạt (`GroupName`, `Name`, `Value`, `Unit`), hỗ trợ thông số chung của dòng (`ProductVariantId = null`) hoặc thông số riêng của phiên bản (`ProductVariantId` có giá trị).
7. **Đơn hàng lưu Snapshot bất biến:** Tên sản phẩm, SKU, màu sắc, dung lượng, đơn giá tại thời điểm giao dịch được ghi lại cố định vào `OrderItems`, độc lập hoàn toàn với dữ liệu sản phẩm trong tương lai.
8. **Kiểm soát cập nhật đồng thời (Optimistic Concurrency):** `ProductVariants` sử dụng `RowVersion` kiểu `byte[]` / `rowversion` để ngăn chặn cập nhật tồn kho dựa trên dữ liệu cũ.

---

## 2. Đặc Tả Chi Tiết 11 Bảng & Module Quản Trị

---

### PHẦN I: CATALOG (DANH MỤC & SẢN PHẨM)

#### 1. Bảng `catalog.Categories` (Danh mục sản phẩm)
- **Mục đích:** Phân loại sản phẩm Apple thành các dòng lớn: iPhone, iPad, Mac, Apple Watch, AirPods, Phụ kiện.
- **Cấu trúc trường:**
  | Tên cột | Kiểu dữ liệu | Ràng buộc | Diễn giải |
  | :--- | :--- | :--- | :--- |
  | `Id` | `int` | PK, Identity | Mã định danh danh mục |
  | `Name` | `nvarchar(100)` | NOT NULL | Tên danh mục (ví dụ: iPhone, Mac) |
  | `Slug` | `varchar(120)` | NOT NULL, UNIQUE | Đường dẫn thân thiện URL (`iphone`, `mac`) |
  | `Description` | `nvarchar(500)` | NULL | Mô tả tóm tắt |
  | `ImageUrl` | `nvarchar(500)` | NULL | Đường dẫn ảnh biểu trưng |
  | `DisplayOrder` | `int` | DEFAULT 0 | Thứ tự hiển thị ưu tiên |
- **Ràng buộc nghiệp vụ:**
  - `Slug` và `Name` không được trùng lặp.
  - Xóa danh mục phải kiểm tra nếu đang có `Products` thuộc danh mục thì ném `ConflictException` (không cho xóa).
- **Backend API Contract:**
  - `GET /api/manager/categories` (QueryParams: `PageNumber`, `PageSize`, `Search`) $\rightarrow$ Trả về `PagedList<CategoryDto>`
  - `GET /api/manager/categories/{id}` $\rightarrow$ Trả về `CategoryDto`
  - `POST /api/manager/categories` (Body: `CreateCategoryRequest`) $\rightarrow$ `Task` (HTTP 200)
  - `PUT /api/manager/categories/{id}` (Body: `UpdateCategoryRequest`) $\rightarrow$ `Task` (HTTP 200)
  - `DELETE /api/manager/categories/{id}` $\rightarrow$ `Task` (HTTP 200)
  - `GET /api/categories` $\rightarrow$ Trả về danh sách public sắp xếp theo `DisplayOrder`
- **Frontend UI/UX (Đường dẫn `/admin/categories`):**
  - Bảng Ant Design: Cột Tên danh mục, Slug, Ảnh xem trước (Avatar), Thứ tự, Mô tả, Hành động (Sửa, Xóa).
  - Thanh tìm kiếm theo từ khóa có Debounce.
  - Modal Form Tạo mới / Chỉnh sửa: Validation Zod (Tên bắt buộc, Tự sinh slug từ tên, Thứ tự là số nguyên dương).

---

#### 2. Bảng `catalog.Colors` (Màu sắc chuẩn hóa)
- **Mục đích:** Chuẩn hóa bảng màu sản phẩm Apple (Space Gray, Silver, Midnight, Starlight, Desert Titanium,...).
- **Cấu trúc trường:**
  | Tên cột | Kiểu dữ liệu | Ràng buộc | Diễn giải |
  | :--- | :--- | :--- | :--- |
  | `Id` | `int` | PK, Identity | Mã định danh màu |
  | `Name` | `nvarchar(100)` | NOT NULL | Tên màu sắc hiển thị |
  | `Code` | `varchar(50)` | NOT NULL, UNIQUE | Mã nội bộ (ví dụ: `SPACE_GRAY`, `TITAN_DESERT`) |
  | `HexCode` | `varchar(7)` | NULL | Mã màu Hex UI (ví dụ: `#F5E1D2`) |
- **Ràng buộc nghiệp vụ:**
  - `Code` và `Name` là duy nhất.
  - `HexCode` phải đúng định dạng mã màu hex (`#RRGGBB` hoặc `#RGB`).
  - Không được xóa màu nếu đang được tham chiếu bởi `ProductVariants`.
- **Backend API Contract:**
  - `GET /api/manager/colors` (Paged, Search) $\rightarrow$ `PagedList<ColorDto>`
  - `GET /api/manager/colors/{id}` $\rightarrow$ `ColorDto`
  - `POST /api/manager/colors` (Body: `CreateColorRequest`) $\rightarrow$ `Task` (HTTP 200)
  - `PUT /api/manager/colors/{id}` (Body: `UpdateColorRequest`) $\rightarrow$ `Task` (HTTP 200)
  - `DELETE /api/manager/colors/{id}` $\rightarrow$ `Task` (HTTP 200)
  - `GET /api/colors` $\rightarrow$ Toàn bộ danh sách màu cho dropdown lựa chọn.
- **Frontend UI/UX (Đường dẫn `/admin/colors`):**
  - Bảng Ant Design: Cột Xem trước màu (Circle badge hiển thị mã hex), Tên màu, Mã nội bộ (Code), Mã Hex, Thao tác.
  - Form Modal có tích hợp Ant Design ColorPicker kết hợp Text input mã Hex.

---

#### 3. Bảng `catalog.StorageOptions` (Dung lượng lưu trữ)
- **Mục đích:** Chuẩn hóa dung lượng lưu trữ cho iPhone, iPad, Mac (128GB, 256GB, 512GB, 1TB, 2TB).
- **Cấu trúc trường:**
  | Tên cột | Kiểu dữ liệu | Ràng buộc | Diễn giải |
  | :--- | :--- | :--- | :--- |
  | `Id` | `int` | PK, Identity | Mã định danh dung lượng |
  | `Name` | `nvarchar(50)` | NOT NULL | Tên hiển thị (ví dụ: `256GB`, `1TB`) |
  | `CapacityValue` | `bigint` | NULL | Giá trị chuẩn hóa bằng GB (ví dụ: 256, 1024) |
  | `Unit` | `varchar(10)` | NULL | Đơn vị tính (`GB`, `TB`) |
- **Ràng buộc nghiệp vụ:**
  - `Name` không được trùng lặp.
  - `CapacityValue` phải lớn hơn 0 nếu có nhập.
- **Backend API Contract:**
  - `GET /api/manager/storage-options` (Paged, Search) $\rightarrow$ `PagedList<StorageOptionDto>`
  - `GET /api/manager/storage-options/{id}` $\rightarrow$ `StorageOptionDto`
  - `POST /api/manager/storage-options` (Body: `CreateStorageOptionRequest`) $\rightarrow$ `Task` (HTTP 200)
  - `PUT /api/manager/storage-options/{id}` (Body: `UpdateStorageOptionRequest`) $\rightarrow$ `Task` (HTTP 200)
  - `DELETE /api/manager/storage-options/{id}` $\rightarrow$ `Task` (HTTP 200)
  - `GET /api/storage-options` $\rightarrow$ Toàn bộ danh sách phục vụ dropdown.
- **Frontend UI/UX (Đường dẫn `/admin/storage-options`):**
  - Bảng Ant Design: Tên dung lượng, Giá trị số (GB), Đơn vị, Thao tác.
  - Form Modal đơn giản có auto-convert hoặc select đơn vị GB/TB.

---

#### 4. Bảng `catalog.Products` (Dòng sản phẩm)
- **Mục đích:** Lưu thông tin cấp độ dòng sản phẩm (Product Line), ví dụ iPhone 17 Pro, MacBook Pro M4 14", AirPods Pro 3.
- **Cấu trúc trường:**
  | Tên cột | Kiểu dữ liệu | Ràng buộc | Diễn giải |
  | :--- | :--- | :--- | :--- |
  | `Id` | `int` | PK, Identity | Mã định danh dòng sản phẩm |
  | `CategoryId` | `int` | NOT NULL, FK $\rightarrow$ Categories.Id | Thuộc danh mục nào |
  | `Name` | `nvarchar(250)` | NOT NULL | Tên dòng sản phẩm |
  | `Slug` | `varchar(280)` | NOT NULL, UNIQUE | URL slug duy nhất |
  | `ModelCode` | `varchar(100)` | NULL | Mã model nội bộ Apple (ví dụ: `A3102`) |
  | `ShortDescription` | `nvarchar(500)` | NULL | Đoạn giới thiệu ngắn |
  | `Description` | `nvarchar(max)` | NULL | Mô tả chi tiết tính năng |
  | `WarrantyMonths` | `smallint` | DEFAULT 12 | Thời gian bảo hành chính hãng (tháng) |
- **Ràng buộc nghiệp vụ:**
  - `Slug` là duy nhất toàn hệ thống.
  - `CategoryId` bắt buộc phải tồn tại trong bảng `Categories`.
  - Không lưu giá bán trực tiếp trên `Products` (vì giá gắn với từng `ProductVariants`).
  - Xóa `Product` sẽ kiểm tra ràng buộc với các đơn hàng đã mua; nếu đã có biến thể phát sinh đơn hàng thì chặn xóa.
- **Backend API Contract:**
  - `GET /api/manager/products` (PagedRequest + `CategoryId?`, `Search?`) $\rightarrow$ `PagedList<ProductSummaryDto>` (gồm số lượng biến thể và dải giá từ-đến).
  - `GET /api/manager/products/{id}` $\rightarrow$ `ProductDetailDto` (đầy đủ thông tin dòng sản phẩm, kèm danh sách Variants và Specifications).
  - `POST /api/manager/products` (Body: `CreateProductRequest`) $\rightarrow$ `Task` (HTTP 200)
  - `PUT /api/manager/products/{id}` (Body: `UpdateProductRequest`) $\rightarrow$ `Task` (HTTP 200)
  - `DELETE /api/manager/products/{id}` $\rightarrow$ `Task` (HTTP 200)
- **Frontend UI/UX (Đường dẫn `/admin/products`):**
  - Bảng danh sách: Tên dòng sản phẩm, Mã Model, Danh mục (Tag), Số biến thể, Thời gian bảo hành, Hành động (Xem chi tiết/Quản lý cấu hình, Sửa, Xóa).
  - Bộ lọc theo Danh mục, Ô tìm kiếm theo tên hoặc mã model.
  - Nút "Thêm sản phẩm": Mở Drawer/Modal form tạo thông tin dòng sản phẩm.

---

#### 5. Bảng `catalog.ProductVariants` (Biến thể & Phiên bản cấu hình)
- **Mục đích:** Quản trị từng phiên bản thực tế để bán, quản lý SKU, giá bán, giá khuyến mãi và tồn kho.
- **Cấu trúc trường:**
  | Tên cột | Kiểu dữ liệu | Ràng buộc | Diễn giải |
  | :--- | :--- | :--- | :--- |
  | `Id` | `int` | PK, Identity | Mã định danh biến thể |
  | `ProductId` | `int` | NOT NULL, FK $\rightarrow$ Products.Id | Thuộc dòng sản phẩm nào |
  | `SKU` | `varchar(100)` | NOT NULL, UNIQUE | Mã quản lý kho hàng duy nhất |
  | `VariantName` | `nvarchar(200)` | NULL | Tên cấu hình chi tiết (`256GB - Bạc`) |
  | `ColorId` | `int` | NULL, FK $\rightarrow$ Colors.Id | Màu sắc |
  | `StorageOptionId` | `int` | NULL, FK $\rightarrow$ StorageOptions.Id | Dung lượng |
  | `Price` | `decimal(18,2)` | NOT NULL, CHECK $\ge 0$ | Giá bán hiện tại (VNĐ) |
  | `CompareAtPrice` | `decimal(18,2)` | NULL, CHECK $\ge Price$ | Giá niêm yết cũ / Giá so sánh |
  | `QuantityInStock` | `int` | NOT NULL, CHECK $\ge 0$ | Số lượng tồn kho sẵn sàng bán |
  | `RowVersion` | `rowversion` / `byte[]` | NOT NULL | Khóa kiểm soát đồng thời (Concurrency) |
- **Ràng buộc nghiệp vụ:**
  - `SKU` bắt buộc duy nhất toàn bộ hệ thống.
  - `Price >= 0` và `QuantityInStock >= 0`.
  - Nếu `CompareAtPrice` có giá trị, bắt buộc `CompareAtPrice >= Price`.
  - Không bắt buộc mọi sản phẩm phải có `ColorId` hoặc `StorageOptionId` (ví dụ cáp sạc, adapter không có dung lượng).
  - Chống trùng lặp cấu hình: Trong cùng một `ProductId`, không được có 2 biến thể có cùng bộ đôi (`ColorId`, `StorageOptionId`).
- **Backend API Contract:**
  - `GET /api/manager/products/{productId}/variants` $\rightarrow$ `IReadOnlyList<ProductVariantDto>`
  - `GET /api/manager/variants/{id}` $\rightarrow$ `ProductVariantDto`
  - `POST /api/manager/products/{productId}/variants` (Body: `CreateProductVariantRequest`) $\rightarrow$ `Task`
  - `PUT /api/manager/variants/{id}` (Body: `UpdateProductVariantRequest`, có gửi kèm `RowVersion`) $\rightarrow$ `Task`
  - `DELETE /api/manager/variants/{id}` $\rightarrow$ `Task`
- **Frontend UI/UX:**
  - Tích hợp trực tiếp trong màn hình Quản lý Sản phẩm (`/admin/products/:id` hoặc Modal Quản lý Biến thể).
  - Bảng Biến thể: Cột SKU, Tên biến thể, Màu sắc (Tag kèm badge màu), Dung lượng, Giá bán (định dạng tiền tệ VNĐ), Giá niêm yết, Số lượng tồn kho, Trạng thái (Còn hàng / Hết hàng), Thao tác (Sửa giá/kho, Quản lý ảnh, Xóa).
  - Form Tạo/Sửa biến thể: Select Màu sắc (có preview), Select Dung lượng, Input SKU tự sinh hoặc nhập tay, Number input Giá bán và Tồn kho.

---

#### 6. Bảng `catalog.VariantImages` (Thư viện ảnh biến thể)
- **Mục đích:** Quản lý ảnh thực tế cho từng phiên bản sản phẩm (mỗi màu/phiên bản có bộ ảnh riêng).
- **Cấu trúc trường:**
  | Tên cột | Kiểu dữ liệu | Ràng buộc | Diễn giải |
  | :--- | :--- | :--- | :--- |
  | `Id` | `int` | PK, Identity | Mã ảnh |
  | `ProductVariantId` | `int` | NOT NULL, FK $\rightarrow$ ProductVariants.Id | Thuộc biến thể nào |
  | `ImageUrl` | `nvarchar(1000)` | NOT NULL | Đường dẫn URL ảnh |
  | `AltText` | `nvarchar(250)` | NULL | Mô tả ảnh phục vụ SEO & Accessibility |
  | `DisplayOrder` | `int` | DEFAULT 0 | Thứ tự hiển thị trong bộ sưu tập |
  | `IsPrimary` | `bit` | NOT NULL, DEFAULT 0 | Là ảnh đại diện chính của biến thể |
- **Ràng buộc nghiệp vụ:**
  - Mỗi `ProductVariantId` chỉ được có **tối đa một ảnh** có `IsPrimary = true`. Khi đặt một ảnh thành `IsPrimary = true`, hệ thống tự động gỡ `IsPrimary` của các ảnh khác cùng biến thể.
  - Khi xóa ảnh chính, nếu biến thể còn ảnh khác, hệ thống tự động gán ảnh có `DisplayOrder` nhỏ nhất làm ảnh chính mới.
- **Backend API Contract:**
  - `GET /api/manager/variants/{variantId}/images` $\rightarrow$ `IReadOnlyList<VariantImageDto>`
  - `POST /api/manager/variants/{variantId}/images` (Body: `CreateVariantImageRequest`) $\rightarrow$ `Task`
  - `PUT /api/manager/images/{id}` (Body: `UpdateVariantImageRequest`) $\rightarrow$ `Task`
  - `PUT /api/manager/images/{id}/set-primary` $\rightarrow$ `Task`
  - `DELETE /api/manager/images/{id}` $\rightarrow$ `Task`
- **Frontend UI/UX:**
  - Quản lý dạng lưới ảnh (Image Gallery Grid): Hiển thị thumbnail, nhãn "Ảnh chính" (Tag xanh lá), nút đổi thứ tự hiển thị, nút đặt làm ảnh chính và nút xóa ảnh.

---

#### 7. Bảng `catalog.ProductSpecifications` (Thông số kỹ thuật linh hoạt)
- **Mục đích:** Lưu thông số kỹ thuật đa dạng của sản phẩm Apple (Màn hình, Chip, RAM, Camera, Pin, Cổng kết nối, Trọng lượng).
- **Cấu trúc trường:**
  | Tên cột | Kiểu dữ liệu | Ràng buộc | Diễn giải |
  | :--- | :--- | :--- | :--- |
  | `Id` | `int` | PK, Identity | Mã định danh thông số |
  | `ProductId` | `int` | NOT NULL, FK $\rightarrow$ Products.Id | Thuộc dòng sản phẩm |
  | `ProductVariantId` | `int` | NULL, FK $\rightarrow$ ProductVariants.Id | Thuộc phiên bản riêng (nếu có) |
  | `GroupName` | `nvarchar(100)` | NULL | Nhóm thông số (Màn hình, Hiệu năng,...) |
  | `Name` | `nvarchar(150)` | NOT NULL | Tên thông số (Kích thước, Chipset, RAM) |
  | `Value` | `nvarchar(1000)` | NOT NULL | Giá trị thông số (`6.3`, `Apple M4 Pro`) |
  | `Unit` | `nvarchar(30)` | NULL | Đơn vị (`inch`, `GB`, `MP`, `g`) |
  | `DisplayOrder` | `int` | DEFAULT 0 | Thứ tự hiển thị |
- **Ràng buộc nghiệp vụ:**
  - `ProductVariantId = null`: Thông số chung của cả dòng sản phẩm.
  - `ProductVariantId` có giá trị: Thông số riêng biệt cho phiên bản cụ thể đó.
  - Nếu `ProductVariantId` có giá trị, biến thể đó bắt buộc phải thuộc đúng `ProductId`.
- **Backend API Contract:**
  - `GET /api/manager/products/{productId}/specifications` $\rightarrow$ `IReadOnlyList<ProductSpecificationDto>`
  - `POST /api/manager/products/{productId}/specifications` (Body: `CreateProductSpecificationRequest`) $\rightarrow$ `Task`
  - `PUT /api/manager/specifications/{id}` (Body: `UpdateProductSpecificationRequest`) $\rightarrow$ `Task`
  - `DELETE /api/manager/specifications/{id}` $\rightarrow$ `Task`
- **Frontend UI/UX:**
  - Tab "Thông số kỹ thuật" trong màn hình Quản lý Sản phẩm.
  - Hiển thị theo từng nhóm (`GroupName`) dạng Card hoặc Collapse Panel. Có thể thêm nhanh các cặp Nhóm - Tên - Giá trị - Đơn vị.

---

### PHẦN II: SALES (GIỎ HÀNG & ĐƠN HÀNG)

#### 8. Bảng `sales.Carts` & 9. Bảng `sales.CartItems`
- Lưu trữ giỏ hàng đang hoạt động của khách hàng.
- Ràng buộc: `CartId` + `ProductVariantId` là duy nhất; khi thêm trùng biến thể thì tăng số lượng `Quantity`.
- Giá bán lấy trực tiếp từ `ProductVariants.Price` tại thời điểm tính tiền, không tin tưởng giá từ Frontend gửi lên.

---

#### 10. Bảng `sales.Orders` & 11. Bảng `sales.OrderItems` (Quản trị Đơn hàng)
- **Mục đích:** Lưu trữ toàn bộ lịch sử đơn hàng và bản chụp (Snapshot) thông tin sản phẩm tại thời điểm giao dịch.
- **Cấu trúc trường `sales.Orders`:**
  | Tên cột | Kiểu dữ liệu | Ràng buộc | Diễn giải |
  | :--- | :--- | :--- | :--- |
  | `Id` | `int` | PK, Identity | Mã định danh đơn |
  | `OrderNumber` | `varchar(40)` | NOT NULL, UNIQUE | Mã đơn hàng (ví dụ: `AP-20261018-001`) |
  | `UserId` | `int` | NOT NULL | Khách hàng đặt đơn |
  | `Status` | `varchar(30)` | NOT NULL | Trạng thái đơn hàng |
  | `PaymentMethod` | `varchar(30)` | NOT NULL | Hình thức thanh toán (COD) |
  | `PaymentStatus` | `varchar(30)` | NOT NULL | Trạng thái thanh toán (Pending, Paid, Failed) |
  | `RecipientName` | `nvarchar(150)` | NOT NULL | Tên người nhận hàng |
  | `RecipientPhone` | `varchar(20)` | NOT NULL | Số điện thoại nhận hàng |
  | `ShippingAddressLine` | `nvarchar(250)` | NOT NULL | Địa chỉ chi tiết giao hàng |
  | `ShippingWard` | `nvarchar(100)` | NULL | Phường / Xã |
  | `ShippingDistrict` | `nvarchar(100)` | NULL | Quận / Huyện |
  | `ShippingProvince` | `nvarchar(100)` | NOT NULL | Tỉnh / Thành phố |
  | `CustomerNote` | `nvarchar(500)` | NULL | Ghi chú của khách hàng |
  | `Subtotal` | `decimal(18,2)` | NOT NULL | Tổng tiền hàng |
  | `ShippingFee` | `decimal(18,2)` | NOT NULL | Phí vận chuyển |
  | `TotalAmount` | `decimal(18,2)` | NOT NULL | Tổng tiền thanh toán (`Subtotal + ShippingFee`) |
  | `PlacedAt` | `datetime2` | NOT NULL | Thời điểm đặt hàng |

- **Vòng đời trạng thái đơn hàng (Order State Machine):**
  ```text
  [Pending] ────> [Confirmed] ────> [Processing] ────> [Shipped] ────> [Delivered]
      │                 │                 │
      └─────────────────┴─────────────────┴──────────────────────────> [Cancelled]
  ```
  - `Pending`: Chờ duyệt.
  - `Confirmed`: Đã xác nhận thông tin đơn hàng.
  - `Processing`: Đang đóng gói sản phẩm tại kho.
  - `Shipped`: Đang giao hàng.
  - `Delivered`: Giao hàng thành công (Thanh toán COD thành công $\rightarrow$ `PaymentStatus = Paid`).
  - `Cancelled`: Đã hủy đơn hàng (hoàn lại tồn kho cho `ProductVariants`).

- **Cấu trúc trường `sales.OrderItems` (Snapshot bất biến):**
  | Tên cột | Kiểu dữ liệu | Ràng buộc | Diễn giải |
  | :--- | :--- | :--- | :--- |
  | `Id` | `int` | PK, Identity | Mã dòng đơn hàng |
  | `OrderId` | `int` | NOT NULL, FK $\rightarrow$ Orders.Id | Thuộc đơn hàng nào |
  | `ProductVariantId` | `int` | NULL, FK $\rightarrow$ ProductVariants.Id | Cho phép NULL nếu variant bị xóa |
  | `ProductName` | `nvarchar(250)` | NOT NULL | Tên dòng sản phẩm tại lúc mua |
  | `SKU` | `varchar(100)` | NOT NULL | Mã SKU tại lúc mua |
  | `ColorName` | `nvarchar(100)` | NULL | Tên màu sắc tại lúc mua |
  | `StorageName` | `nvarchar(50)` | NULL | Dung lượng tại lúc mua |
  | `UnitPrice` | `decimal(18,2)` | NOT NULL | Đơn giá tại thời điểm mua |
  | `Quantity` | `int` | NOT NULL, $> 0$ | Số lượng mua |
  | `LineTotal` | `decimal(18,2)` | NOT NULL | Thành tiền (`UnitPrice * Quantity`) |

- **Backend API Contract:**
  - `GET /api/manager/orders` (PagedRequest + `Status?`, `Search?`, `FromDate?`, `ToDate?`) $\rightarrow$ `PagedList<OrderSummaryDto>`
  - `GET /api/manager/orders/{id}` $\rightarrow$ `OrderDetailDto` (gồm danh sách `OrderItems` snapshot)
  - `PUT /api/manager/orders/{id}/status` (Body: `UpdateOrderStatusRequest { Status: string }`) $\rightarrow$ `Task` (HTTP 200)
  - `PUT /api/manager/orders/{id}/cancel` (Body: `CancelOrderRequest { Reason: string }`) $\rightarrow$ `Task` (HTTP 200)

- **Frontend UI/UX (Đường dẫn `/admin/orders`):**
  - Bảng danh sách: Mã đơn hàng, Tên người nhận, SĐT, Ngày đặt, Tổng tiền, Trạng thái đơn (Tag theo màu sắc Antd), Trạng thái thanh toán, Thao tác (Xem chi tiết).
  - Drawer Chi tiết đơn hàng:
    - Khối thông tin khách hàng & địa chỉ giao hàng.
    - Khối quy trình trạng thái (Ant Design Steps hiển thị tiến trình đơn).
    - Bảng danh sách sản phẩm snapshot (Ảnh, Tên sản phẩm, Cấu hình màu/dung lượng, Đơn giá, Số lượng, Thành tiền).
    - Bộ điều khiển cập nhật trạng thái đơn (Dropdown chuyển trạng thái tiếp theo hoặc nút Hủy đơn).
