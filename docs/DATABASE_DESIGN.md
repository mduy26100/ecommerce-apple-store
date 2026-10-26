# Thiết Kế Cơ Sở Dữ Liệu (Database Design)

> **Ghi chú quan trọng:** Schema hiện tại phục vụ cho giai đoạn ban đầu (MVP), có thể bổ sung thêm index và bảng quan hệ phụ trong các đợt phát triển tiếp theo.

---

## 1. Tổng quan kiến trúc dữ liệu

Cơ sở dữ liệu của hệ thống Urban Stitch được xây dựng trên nền tảng **SQL Server**, phân tách thành 3 Schemas độc lập theo từng miền nghiệp vụ (Bounded Contexts):
- `catalog`: Quản lý toàn bộ cấu trúc sản phẩm, thuộc tính động, biến thể, hình ảnh và nhóm thông số kỹ thuật.
- `sales`: Quản lý giỏ hàng, thông tin thanh toán, chi tiết đơn đặt hàng và trạng thái đơn hàng.
- `identity`: Quản lý danh tính người dùng, phân quyền truy cập (RBAC) và phiên xác thực JWT/RefreshToken.

---

## 2. Chuẩn hóa Thực thể Cơ sở (BaseEntity Pattern)

Để đảm bảo tính nhất quán và loại bỏ việc lặp lại mã nguồn, **toàn bộ các bảng nghiệp vụ trong 2 schema `catalog` và `sales` đều kế thừa từ lớp thực thể cơ sở `BaseEntity<int>`**.

### Các trường Auditing & Soft Delete tự động (Áp dụng chung):

| Tên trường | Kiểu dữ liệu | Nullable | Mô tả chức năng |
| :--- | :--- | :---: | :--- |
| `Id` | `int` | Không | Khóa chính (Primary Key), tự tăng (IDENTITY). |
| `IsActive` | `bit` | Không | Trạng thái kích hoạt bản ghi (Mặc định: `1` - Hoạt động). |
| `CreatedOn` | `datetimeoffset` | Không | Mốc thời gian UTC tạo bản ghi (Tự động gán khi INSERT). |
| `CreatedBy` | `nvarchar(max)` | Có | Tên tài khoản hoặc định danh người tạo. |
| `LastModifiedOn` | `datetimeoffset` | Có | Mốc thời gian UTC cập nhật bản ghi gần nhất. |
| `LastModifiedBy` | `nvarchar(max)` | Có | Tên tài khoản hoặc định danh người chỉnh sửa. |
| `IsDeleted` | `bit` | Không | Cờ đánh dấu xóa mềm (Mặc định: `0` - Chưa xóa). |
| `DeletedOn` | `datetimeoffset` | Có | Mốc thời gian UTC khi bản ghi bị xóa mềm. |
| `DeletedBy` | `nvarchar(max)` | Có | Tên tài khoản hoặc định danh người thực hiện xóa. |

> **Quy ước:** 
> - Mọi truy vấn đọc trong hệ thống đều được Entity Framework Core áp dụng **Global Query Filter** (`WHERE IsDeleted = 0`) tự động.
> - Riêng schema **`identity`** sử dụng cấu trúc bảng chuẩn của framework ASP.NET Core Identity nên không kế thừa lớp `BaseEntity` này.
> - Trong danh sách chi tiết các bảng dưới đây, **chỉ liệt kê các cột nghiệp vụ đặc thù**, không lặp lại các cột dùng chung trên.

---

## 3. Bản đồ Quan hệ giữa các Bảng (Relationship Mapping)

Thay vì biểu đồ đồ họa khó hiển thị trên một số trình đọc markdown, mối quan hệ thực thể được chuẩn hóa qua bảng quan hệ trực quan dưới đây:

| Bảng nguồn | Quan hệ | Bảng đích | Khóa ngoại (Foreign Key) | Ý nghĩa nghiệp vụ |
| :--- | :---: | :--- | :--- | :--- |
| `catalog.Categories` | **1 - N** | `catalog.Products` | `Products.CategoryId` | Một danh mục chứa nhiều sản phẩm (iPhone, Mac, iPad...). |
| `catalog.Products` | **1 - N** | `catalog.ProductVariants` | `ProductVariants.ProductId` | Một dòng máy có nhiều cấu hình biến thể (màu sắc, dung lượng). |
| `catalog.Colors` | **1 - N** | `catalog.ProductVariants` | `ProductVariants.ColorId` | Màu sắc áp dụng cho biến thể sản phẩm cụ thể. |
| `catalog.StorageOptions` | **1 - N** | `catalog.ProductVariants` | `ProductVariants.StorageOptionId` | Dung lượng bộ nhớ áp dụng cho biến thể sản phẩm cụ thể. |
| `catalog.Products` | **1 - N** | `catalog.ProductImages` | `ProductImages.ProductId` | Thư viện hình ảnh thuộc về sản phẩm. |
| `catalog.Colors` | **1 - N** | `catalog.ProductImages` | `ProductImages.ColorId` | Hình ảnh sản phẩm được gắn với màu sắc cụ thể để chuyển ảnh. |
| `catalog.Products` | **1 - N** | `catalog.ProductOptions` | `ProductOptions.ProductId` | Tùy chọn thuộc tính động mở rộng của sản phẩm (RAM, Kết nối). |
| `catalog.ProductOptions` | **1 - N** | `catalog.ProductOptionValues`| `ProductOptionValues.OptionId` | Giá trị cụ thể của tùy chọn động (16GB, Wi-Fi + 5G). |
| `catalog.ProductVariants`| **N - N** | `catalog.ProductOptionValues`| Qua bảng `ProductVariantValues` | Ánh xạ biến thể mang những tùy chọn động mở rộng nào. |
| `catalog.Products` | **1 - N** | `catalog.ProductSpecificationGroups` | `ProductSpecificationGroups.ProductId` | Sản phẩm có nhiều nhóm thông số (Màn hình, Camera...). |
| `catalog.ProductSpecificationGroups` | **1 - N** | `catalog.ProductSpecifications` | `ProductSpecifications.GroupId` | Một nhóm thông số chứa nhiều mục kỹ thuật chi tiết. |
| `identity.Users` | **1 - N** | `sales.Carts` | `Carts.UserId` | Mỗi người dùng sở hữu giỏ hàng cá nhân. |
| `sales.Carts` | **1 - N** | `sales.CartItems` | `CartItems.CartId` | Giỏ hàng chứa nhiều mặt hàng chọn mua. |
| `catalog.ProductVariants`| **1 - N** | `sales.CartItems` | `CartItems.ProductVariantId` | Mặt hàng trong giỏ liên kết trực tiếp tới biến thể cụ thể. |
| `identity.Users` | **1 - N** | `sales.Orders` | `Orders.UserId` | Người dùng đặt một hoặc nhiều đơn hàng. |
| `sales.Orders` | **1 - N** | `sales.OrderItems` | `OrderItems.OrderId` | Một đơn hàng gồm nhiều dòng sản phẩm đã mua. |
| `catalog.ProductVariants`| **1 - N** | `sales.OrderItems` | `OrderItems.ProductVariantId` | Mặt hàng đã đặt tham chiếu tới biến thể gốc trong kho. |
| `identity.Users` | **1 - N** | `identity.RefreshTokens` | `RefreshTokens.UserId` | Người dùng có các phiên Refresh Token đang hoạt động. |
| `identity.Users` | **N - N** | `identity.Roles` | Qua bảng `identity.UserRoles` | Phân quyền vai trò người dùng (Admin, Customer). |

---

## 4. Chi tiết các Bảng Dữ liệu Nghiệp vụ

### 4.1. Phân hệ Danh mục & Sản phẩm (`catalog`)

#### 1. Bảng `catalog.Categories` (Danh mục sản phẩm)
- **Mục đích:** Quản lý các nhóm ngành hàng chính của Apple (iPhone, MacBook, iPad, Apple Watch, AirPods, iMac, Phụ kiện).

| Cột nghiệp vụ | Kiểu dữ liệu | Nullable | Ràng buộc / Index | Mô tả |
| :--- | :--- | :---: | :---: | :--- |
| `Name` | `nvarchar(150)` | Không | | Tên danh mục hiển thị |
| `Slug` | `nvarchar(150)` | Không | Unique Index | Đường dẫn URL thân thiện (ví dụ: `iphone`, `macbook`) |
| `Description` | `nvarchar(max)` | Có | | Đoạn văn bản giới thiệu danh mục |
| `ImageUrl` | `nvarchar(1000)` | Có | | Đường dẫn ảnh đại diện/banner danh mục |
| `DisplayOrder` | `int` | Không | Default 0 | Thứ tự sắp xếp hiển thị trên thanh điều hướng |

---

#### 2. Bảng `catalog.Products` (Sản phẩm gốc / Parent Product)
- **Mục đích:** Đại diện cho dòng sản phẩm chung (ví dụ: iPhone 16 Pro Max, MacBook Pro 14" M4).

| Cột nghiệp vụ | Kiểu dữ liệu | Nullable | Ràng buộc / Index | Mô tả |
| :--- | :--- | :---: | :---: | :--- |
| `CategoryId` | `int` | Không | FK $\rightarrow$ `Categories(Id)` | Danh mục sản phẩm trực thuộc |
| `Name` | `nvarchar(200)` | Không | | Tên sản phẩm chính thức |
| `Slug` | `nvarchar(200)` | Không | Unique Index | Đường dẫn URL chi tiết sản phẩm |
| `ChipName` | `nvarchar(100)` | Có | | Tên chip xử lý Apple Silicon (A18 Pro, M4 Pro) |
| `BadgeText` | `nvarchar(50)` | Có | | Huy hiệu nổi bật (BÁN CHẠY, HÀNG MỚI, SẴN HÀNG) |
| `ShortDescription` | `nvarchar(500)` | Có | | Tóm tắt cấu hình nổi bật |
| `Description` | `nvarchar(max)` | Có | | Bài viết đánh giá chi tiết sản phẩm |
| `Price` | `decimal(18,2)` | Không | Check $\ge 0$ | Giá hiển thị cơ sở (giá khởi điểm) |
| `CompareAtPrice` | `decimal(18,2)` | Có | | Giá niêm yết cũ để hiển thị % giảm giá |

---

#### 3. Bảng `catalog.Colors` (Bảng Màu sắc)
- **Mục đích:** Chuẩn hóa bảng màu thương mại đặc trưng của Apple.

| Cột nghiệp vụ | Kiểu dữ liệu | Nullable | Ràng buộc / Index | Mô tả |
| :--- | :--- | :---: | :---: | :--- |
| `Name` | `nvarchar(100)` | Không | | Tên màu sắc (Titan Sa Mạc, Titan Tự Nhiên, Đen Không Gian) |
| `HexCode` | `nvarchar(10)` | Không | | Mã màu HEX (ví dụ: `#C7B5A7`) hiển thị vòng tròn màu |
| `DisplayOrder` | `int` | Không | Default 0 | Thứ tự hiển thị lựa chọn màu |

---

#### 4. Bảng `catalog.StorageOptions` (Dung lượng bộ nhớ)
- **Mục đích:** Chuẩn hóa các nấc dung lượng bộ nhớ trong/ổ cứng.

| Cột nghiệp vụ | Kiểu dữ liệu | Nullable | Ràng buộc / Index | Mô tả |
| :--- | :--- | :---: | :---: | :--- |
| `Capacity` | `nvarchar(50)` | Không | | Nhãn hiển thị dung lượng (`128GB`, `256GB`, `1TB`) |
| `CapacityInGB` | `int` | Không | Check $> 0$ | Giá trị quy đổi ra GB phục vụ sắp xếp tăng dần |
| `DisplayOrder` | `int` | Không | Default 0 | Thứ tự hiển thị nút chọn |

---

#### 5. Bảng `catalog.ProductVariants` (Biến thể sản phẩm cụ thể / SKU)
- **Mục đích:** Đại diện cho một sản phẩm vật lý cụ thể trong kho có thể bán và giao nhận.

| Cột nghiệp vụ | Kiểu dữ liệu | Nullable | Ràng buộc / Index | Mô tả |
| :--- | :--- | :---: | :---: | :--- |
| `ProductId` | `int` | Không | FK $\rightarrow$ `Products(Id)` | Dòng sản phẩm cha trực thuộc |
| `ColorId` | `int` | Có | FK $\rightarrow$ `Colors(Id)` | Màu sắc tương ứng (nếu có) |
| `StorageOptionId` | `int` | Có | FK $\rightarrow$ `StorageOptions(Id)` | Dung lượng tương ứng (nếu có) |
| `SKU` | `nvarchar(100)` | Không | Unique Index | Mã định danh quản lý kho độc nhất |
| `VariantName` | `nvarchar(250)` | Không | | Tên gọi đầy đủ của biến thể cấu hình |
| `Price` | `decimal(18,2)` | Không | Check $\ge 0$ | Giá bán thực tế của cấu hình |
| `CompareAtPrice` | `decimal(18,2)` | Có | | Giá gốc ban đầu của cấu hình |
| `QuantityInStock` | `int` | Không | Check $\ge 0$, Default 0 | Số lượng tồn kho sẵn sàng bán |
| `RowVersion` | `rowversion` | Không | Concurrency Token | Khóa lạc quan chống race condition khi mua hàng |

---

#### 6. Bảng `catalog.ProductOptions` & `catalog.ProductOptionValues` (Thuộc tính biến thể động)
- **Mục đích:** Khai báo các trục thuộc tính mở rộng không cố định (Kích cỡ mặt đồng hồ, RAM, Phiên bản kết nối).

| Bảng | Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| `ProductOptions` | `ProductId`, `Name`, `DisplayOrder` | `int`, `nvarchar(100)`, `int` | FK $\rightarrow$ `Products(Id)` | Tên trục tùy chọn (ví dụ: "Kết nối", "RAM") |
| `ProductOptionValues`| `OptionId`, `Value`, `DisplayOrder` | `int`, `nvarchar(100)`, `int` | FK $\rightarrow$ `ProductOptions(Id)` | Giá trị chi tiết (ví dụ: "Wi-Fi + 5G", "16GB") |

---

#### 7. Bảng `catalog.ProductVariantValues` (Bảng nối Biến thể - Tùy chọn động)
- **Mục đích:** Xác định biến thể cụ thể đang mang những giá trị tùy chọn động mở rộng nào.

| Cột | Kiểu dữ liệu | Nullable | Ràng buộc | Mô tả |
| :--- | :--- | :---: | :---: | :--- |
| `VariantId` | `int` | Không | PK, FK $\rightarrow$ `ProductVariants(Id)` | Biến thể sản phẩm |
| `OptionValueId` | `int` | Không | PK, FK $\rightarrow$ `ProductOptionValues(Id)` | Giá trị tùy chọn động tương ứng |

---

#### 8. Bảng `catalog.ProductImages` (Bộ sưu tập hình ảnh sản phẩm)
- **Mục đích:** Quản lý đa ảnh sản phẩm, liên kết theo màu sắc để đổi ảnh động trên giao diện Storefront.

| Cột nghiệp vụ | Kiểu dữ liệu | Nullable | Ràng buộc / Index | Mô tả |
| :--- | :--- | :---: | :---: | :--- |
| `ProductId` | `int` | Không | FK $\rightarrow$ `Products(Id)` | Sản phẩm cha |
| `ColorId` | `int` | Có | FK $\rightarrow$ `Colors(Id)` | Màu sắc tương ứng của ảnh (nếu là ảnh theo màu) |
| `ImageUrl` | `nvarchar(1000)` | Có | | Đường dẫn ảnh CDN (Cloudinary) |
| `AltText` | `nvarchar(255)` | Có | | Mô tả ảnh phục vụ SEO & Accessibility |
| `DisplayOrder` | `int` | Không | Default 0 | Thứ tự hiển thị trong slider ảnh |
| `IsPrimary` | `bit` | Không | Default 0 | Đánh dấu ảnh đại diện chính của sản phẩm |

---

#### 9. Bảng `catalog.ProductSpecificationGroups` & `catalog.ProductSpecifications` (Thông số kỹ thuật phân cấp)
- **Mục đích:** Xử lý danh mục thông số kỹ thuật đồ sộ của thiết bị công nghệ Apple theo từng nhóm chủ đề.

| Bảng | Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| `ProductSpecificationGroups` | `ProductId`, `Name`, `DisplayOrder` | `int`, `nvarchar(150)`, `int` | FK $\rightarrow$ `Products(Id)` | Nhóm thông số (Màn hình, Camera, Vi xử lý...) |
| `ProductSpecifications` | `GroupId`, `Name`, `Value`, `Unit`, `DisplayOrder` | `int`, `nvarchar(150)`, `nvarchar(max)`, `nvarchar(50)`, `int` | FK $\rightarrow$ `ProductSpecificationGroups(Id)` | Thông số chi tiết (Độ sáng 2000 nits, Khẩu độ f/1.78) |

---

### 4.2. Phân hệ Bán hàng & Giỏ hàng (`sales`)

#### 1. Bảng `sales.Carts` & `sales.CartItems` (Giỏ hàng trực tuyến)
- **Mục đích:** Lưu trữ giỏ hàng và danh sách sản phẩm tạm tính, hỗ trợ liền mạch cho cả khách thành viên đã đăng nhập và khách vãng lai (Guest Cart).

| Bảng | Cột nghiệp vụ | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| `Carts` | `UserId` | `int` (Nullable) | FK $\rightarrow$ `identity.Users(Id)`, Filtered Unique Index `[UserId] IS NOT NULL AND [IsDeleted] = 0` | ID tài khoản nếu đã đăng nhập |
| `Carts` | `GuestId` | `varchar(100)` (Nullable) | Filtered Unique Index `[GuestId] IS NOT NULL AND [IsDeleted] = 0` | UUID định danh phiên khách vãng lai (lưu tại Cookie/LocalStorage) |
| `Carts` | `ExpiresOn` | `datetimeoffset` (Nullable) | | Thời điểm hết hạn của giỏ hàng phục vụ dọn dẹp giỏ rác định kỳ |
| `CartItems` | `CartId` | `int` | FK $\rightarrow$ `Carts(Id)` (Cascade Delete) | Mã giỏ hàng trực thuộc |
| `CartItems` | `ProductVariantId` | `int` | FK $\rightarrow$ `ProductVariants(Id)` (Cascade Delete) | Biến thể sản phẩm được chọn mua |
| `CartItems` | `Quantity` | `int` | Check `[Quantity] > 0` | Số lượng chọn mua (bắt buộc > 0) |
| `CartItems` | `UnitPrice` | `decimal(18,2)` | Precision 18, Scale 2 | Đơn giá sản phẩm tại thời điểm bỏ giỏ (hỗ trợ phát hiện đổi giá) |
| `CartItems` | `IsSelected` | `bit` | Default `1` | Đánh dấu chọn sản phẩm để thanh toán (Selective Checkout) |

> **Ràng buộc duy nhất (Unique Constraint chống trùng lặp):**
> Bảng `CartItems` áp dụng Filtered Unique Index trên cặp `(CartId, ProductVariantId)` kèm điều kiện `WHERE [IsDeleted] = 0`. Điều này triệt tiêu hoàn toàn lỗi vỡ index khi phục hồi sản phẩm đã xóa mềm hoặc cộng dồn số lượng.
>
> **Cơ chế Tự phục hồi Số lượng Tồn kho (Self-Healing Cart Inventory Safeguard):**
> Trong trường hợp người dùng thêm số lượng lớn nhưng chưa thanh toán, sau đó tồn kho thực tế bị giảm hoặc hết hàng rồi nhập lại với số lượng nhỏ hơn số lượng trong giỏ (ví dụ: giỏ lưu 14 máy nhưng cửa hàng chỉ còn 5 máy):
> Khi người dùng truy cập giỏ hàng, hệ thống Backend (`CartService.cs`) tự động phát hiện `Quantity > QuantityInStock`, ép số lượng về `1` và gọi `SaveChangesAsync()` để cập nhật vĩnh viễn xuống database. Đồng thời, các chỉ số `LineTotal`, `TotalItems`, `SelectedItemsCount` và `Subtotal` chỉ tính toán dựa trên các mặt hàng sẵn có (`IsAvailable && QuantityInStock > 0`).

---

#### 2. Bảng `sales.Orders` & `sales.OrderItems` (Đơn đặt hàng & Chi tiết mặt hàng)
- **Mục đích:** Lưu trữ đơn hàng hoàn tất sau khi checkout và snapshot bất biến toàn diện của sản phẩm tại thời điểm mua (hỗ trợ Dynamic Options, khách vãng lai, voucher và lợi nhuận gộp).

| Bảng | Cột nghiệp vụ | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| `Orders` | `OrderNumber` | `varchar(40)` | Unique Index, Not Null | Mã đơn hàng định danh (Ví dụ: `ORD-20261026-A1B2C3`) |
| `Orders` | `UserId` | `int` (Nullable) | FK $\rightarrow$ `identity.Users(Id)` (Restrict) | ID người dùng nếu là thành viên đăng nhập |
| `Orders` | `GuestId` | `varchar(100)` (Nullable) | Index | Mã phiên định danh khách vãng lai (Guest Checkout) |
| `Orders` | `Status` | `varchar(30)` | HasConversion Enum `OrderStatus` | Trạng thái: `Pending` (Chờ xử lý), `Confirmed` (Đã xác nhận), `Processing` (Đang đóng gói), `Shipping` (Đang giao hàng), `Delivered` (Đã giao hàng), `Completed` (Đã nhận hàng), `Cancelled` (Đã hủy), `Returned` (Trả hàng) |
| `Orders` | `StatusHistoryJson` | `nvarchar(max)` (Nullable) | | Chuỗi JSON lưu trữ mốc thời gian, trạng thái, người thực hiện (`Customer`/`Manager`) và lý do/ghi chú tiến trình |
| `Orders` | `PaymentMethod` | `varchar(30)` | HasConversion Enum `PaymentMethod` | Phương thức: `COD`, `VNPAY`, `MOMO`, `BankTransfer` |
| `Orders` | `PaymentStatus` | `varchar(30)` | HasConversion Enum `PaymentStatus` | Trạng thái TT: `Pending`, `Paid`, `Failed`, `Refunded` |
| `Orders` | `RecipientName` | `nvarchar(150)` | Not Null | Họ tên người nhận hàng |
| `Orders` | `RecipientPhone` | `varchar(20)` | Not Null | Số điện thoại liên hệ giao hàng |
| `Orders` | `RecipientEmail` | `varchar(150)` (Nullable) | | Email nhận thông báo và link tra cứu đơn hàng |
| `Orders` | `ShippingAddressLine` | `nvarchar(250)` | Not Null | Địa chỉ số nhà / tên đường |
| `Orders` | `ShippingWard` / `District` / `Province` | `nvarchar(100)` | Ward/District Nullable, Province Not Null | Thông tin hành chính giao vận |
| `Orders` | `Subtotal` | `decimal(18,2)` | Check `>= 0` | Tổng tiền hàng trước chiết khấu và phí vận chuyển |
| `Orders` | `ShippingFee` | `decimal(18,2)` | Check `>= 0`, Default `0` | Phí giao hàng |
| `Orders` | `VoucherId` | `int` (Nullable) | FK $\rightarrow$ `sales.Vouchers(Id)` (SetNull) | Mã ID voucher khuyến mãi đã áp dụng |
| `Orders` | `VoucherCode` | `varchar(50)` (Nullable) | | Snapshot mã voucher tại thời điểm đặt |
| `Orders` | `DiscountAmount` | `decimal(18,2)` | Check `>= 0`, Default `0` | Số tiền thực tế được giảm giá |
| `Orders` | `TotalAmount` | `decimal(18,2)` | Check `>= 0` | Tổng thanh toán cuối cùng (`Subtotal + ShippingFee - DiscountAmount`) |
| `Orders` | `ShippingAddressUpdateCount` | `int` | Default `0`, Not Null | Số lần khách hàng đã chỉnh sửa thông tin giao nhận (giới hạn tối đa 1 lần duy nhất khi đơn đang Chờ xử lý) |
| `Orders` | `RowVersion` | `rowversion` | Concurrency Token | Khóa lạc quan chống race condition khi cập nhật đơn |
| `OrderItems` | `OrderId` | `int` | FK $\rightarrow$ `Orders(Id)` (Cascade Delete) | Đơn hàng trực thuộc |
| `OrderItems` | `ProductVariantId` | `int` (Nullable) | FK $\rightarrow$ `ProductVariants(Id)` (SetNull) | Biến thể gốc (giữ nguyên đơn nếu xóa biến thể) |
| `OrderItems` | `ProductName` | `nvarchar(250)` | Not Null | Snapshot tên sản phẩm lúc mua |
| `OrderItems` | `SKU` | `varchar(100)` | Not Null | Snapshot SKU lúc mua |
| `OrderItems` | `VariantName` | `nvarchar(250)` (Nullable) | | Snapshot tên phân loại (Ví dụ: "Titan Tự Nhiên - 512GB") |
| `OrderItems` | `ThumbnailUrl` | `nvarchar(500)` (Nullable) | | Snapshot ảnh đại diện biến thể lúc mua |
| `OrderItems` | `SelectedAttributesJson` | `nvarchar(1000)` (Nullable) | | Snapshot Dynamic Options: `[{"OptionName":"Màu sắc","Value":"Titan Tự Nhiên"},{"OptionName":"Dung lượng","Value":"512GB"}]` |
| `OrderItems` | `CostPrice` | `decimal(18,2)` | Check `>= 0`, Default `0` | Snapshot giá vốn tại thời điểm bán (tính lợi nhuận gộp) |
| `OrderItems` | `UnitPrice` | `decimal(18,2)` | Check `>= 0` | Đơn giá bán thực tế |
| `OrderItems` | `Quantity` | `int` | Check `> 0` | Số lượng mua |
| `OrderItems` | `LineTotal` | `decimal(18,2)` | Check `>= 0` | Thành tiền từng dòng (`UnitPrice * Quantity`) |

---

#### 3. Bảng `sales.Vouchers`, `sales.UserVouchers` & `sales.VoucherUsages` (Khuyến mãi, Ví voucher cá nhân & Lịch sử sử dụng)
- **Mục đích:** Quản lý toàn diện chiến dịch khuyến mãi đa đối tượng (Public, Bắt buộc đăng nhập, Cấp riêng cho User cụ thể), quản lý ví voucher cá nhân của khách hàng và ghi nhận nhật ký sử dụng mã chống gian lận.

| Bảng | Cột nghiệp vụ | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| `Vouchers` | `Code` | `varchar(50)` | Unique Index, Not Null | Mã voucher (Ví dụ: `TET2026`, `APPLE100K`, `VIPMEMBER`) |
| `Vouchers` | `Name` | `nvarchar(150)` | Not Null | Tên chương trình ưu đãi |
| `Vouchers` | `Description` | `nvarchar(500)` (Nullable) | | Điều khoản và mô tả áp dụng |
| `Vouchers` | `TargetType` | `varchar(30)` | HasConversion Enum `VoucherTargetType` | Đối tượng: `Public` (Công khai ai cũng dùng được), `RegisteredOnly` (Bắt buộc tài khoản đăng nhập), `AssignedOnly` (Chỉ cấp riêng cho User cụ thể) |
| `Vouchers` | `DiscountType` | `varchar(30)` | HasConversion Enum `VoucherDiscountType` | `Percentage` (% giảm) hoặc `FixedAmount` (Số tiền cố định) |
| `Vouchers` | `DiscountValue` | `decimal(18,2)` | Check `> 0` | Giá trị giảm (% từ 1-100 hoặc số tiền VNĐ) |
| `Vouchers` | `MinOrderAmount` | `decimal(18,2)` (Nullable) | | Giá trị đơn hàng tối thiểu để được áp dụng mã |
| `Vouchers` | `MaxDiscountAmount` | `decimal(18,2)` (Nullable) | | Mức giảm tối đa cho voucher loại `%` |
| `Vouchers` | `StartDate` / `EndDate` | `datetimeoffset` | Not Null, Index | Khoảng thời gian chiến dịch có hiệu lực |
| `Vouchers` | `UsageLimit` | `int` (Nullable) | | Tổng lượt sử dụng tối đa toàn hệ thống |
| `Vouchers` | `UsageCount` | `int` | Check `>= 0`, Default `0` | Số lượt thực tế đã được áp dụng |
| `Vouchers` | `PerUserLimit` | `int` | Check `> 0`, Default `1` | Số lần tối đa một người được phép sử dụng (cho Public/Registered) |
| `Vouchers` | `RowVersion` | `rowversion` | Concurrency Token | Khóa lạc quan chống race condition khi nhận voucher |
| `UserVouchers` | `UserId` | `int` | FK $\rightarrow$ `identity.Users(Id)` (Cascade) | Tài khoản người dùng được cấp riêng voucher |
| `UserVouchers` | `VoucherId` | `int` | FK $\rightarrow$ `sales.Vouchers(Id)` (Cascade) | Mã voucher được cấp |
| `UserVouchers` | `AssignedUsageLimit` | `int` | Check `> 0`, Default `1` | Số lượt sử dụng cấp riêng cho User này (Ví dụ: VIP được 3 lần) |
| `UserVouchers` | `UsedCount` | `int` | Check `>= 0`, Default `0` | Số lượt User này đã sử dụng thực tế |
| `UserVouchers` | `AssignedAt` | `datetimeoffset` | Not Null | Thời điểm cấp voucher vào ví |
| `UserVouchers` | `ExpiresAt` | `datetimeoffset` (Nullable) | Index | Hạn dùng riêng của User (nếu null lấy theo `Vouchers.EndDate`) |
| `UserVouchers` | `AssignedBy` | `nvarchar(150)` (Nullable) | | Username Admin cấp tay hoặc sự kiện tự động (`SYSTEM_BIRTHDAY`) |
| `UserVouchers` | `Note` | `nvarchar(250)` (Nullable) | | Lý do cấp ("Tặng voucher sinh nhật tháng 10", "Bồi thường đơn hàng") |
| `VoucherUsages` | `VoucherId` | `int` | FK $\rightarrow$ `Vouchers(Id)` (Cascade Delete) | Voucher được sử dụng |
| `VoucherUsages` | `OrderId` | `int` | FK $\rightarrow$ `Orders(Id)` (Cascade Delete) | Đơn hàng áp dụng mã |
| `VoucherUsages` | `UserId` | `int` (Nullable) | FK $\rightarrow$ `identity.Users(Id)` (Restrict) | Tài khoản sử dụng nếu đã đăng nhập |
| `VoucherUsages` | `GuestId` | `varchar(100)` (Nullable) | Index | Mã phiên nếu là khách vãng lai |
| `VoucherUsages` | `CustomerPhone` / `Email` | `varchar` (Nullable) | | Thông tin người dùng chống gian lận lặp lại mã |
| `VoucherUsages` | `DiscountAmount` | `decimal(18,2)` | Check `>= 0` | Số tiền thực tế được giảm cho đơn đó |
| `VoucherUsages` | `UsedAt` | `datetimeoffset` | Not Null | Thời điểm áp dụng mã |

> **Ràng buộc duy nhất trên `UserVouchers`:**
> Áp dụng Filtered Unique Index trên cặp `(UserId, VoucherId) WHERE [IsDeleted] = 0`. Điều này ngăn chặn việc cấp trùng lặp cùng một voucher cho một người dùng; khi cần tăng số lượt sử dụng thì cập nhật trực tiếp `AssignedUsageLimit`.

---

### 4.3. Phân hệ Xác thực & Định danh (`identity`)

Sử dụng cấu trúc chuẩn của **ASP.NET Core Identity** đặt trong schema `identity`, bổ sung cơ chế quản lý Refresh Token:

| Bảng | Các cột chính | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `identity.Users` | `Id`, `Email`, `UserName`, `PasswordHash`, `FirstName`, `LastName`, `AvatarUrl`, `IsActive` | PK `Id`, Unique `Email` | Lưu trữ tài khoản và thông tin người dùng |
| `identity.Roles` | `Id`, `Name`, `NormalizedName`, `Description` | PK `Id`, Unique `NormalizedName` | Danh mục vai trò (`Administrator`, `Customer`) |
| `identity.UserRoles` | `UserId`, `RoleId` | PK kép (`UserId`, `RoleId`) | Phân quyền vai trò cho tài khoản người dùng |
| `identity.RefreshTokens` | `Id`, `UserId`, `Token`, `ExpiresOn`, `RevokedOn`, `CreatedOn` | PK `Id`, FK $\rightarrow$ `Users(Id)` | Quản lý vòng đời Refresh Token cấp cho trình duyệt |

---

## 5. Giải trình Thiết kế: Tối ưu cho Ngành Bán Lẻ Điện Thoại & Thiết Bị Công Nghệ

Hệ thống bán lẻ thiết bị công nghệ Apple đòi hỏi sự kết hợp hài hòa giữa tốc độ truy vấn cao và khả năng biến đổi cấu hình linh hoạt:

1. **Mô hình Hybrid EAV (Cố định kết hợp Động):**  
   - 95% dòng máy iPhone phân hóa theo Màu sắc và Dung lượng $\rightarrow$ Đặt trực tiếp khóa ngoại `ColorId` và `StorageOptionId` trong `ProductVariants` có đánh Index giúp các thao tác lọc danh mục, tìm kiếm trên Storefront đạt tốc độ tối đa không cần qua bảng nối.
   - Các dòng sản phẩm khác (Apple Watch có size mặt 41mm/45mm; MacBook có RAM 16GB/24GB/32GB; iPad có Wi-Fi/Cellular) $\rightarrow$ Sử dụng hệ thống `ProductOptions` và `ProductOptionValues` để mở rộng tùy ý trong Admin mà **không cần can thiệp mã nguồn hay chạy lại migration**.
2. **Nhóm thông số kỹ thuật phân cấp (Grouped Specifications):**  
   - Gom hàng chục thông số phức tạp của thiết bị di động thành các nhóm chuyên môn (Màn hình, Camera, Vi xử lý, Pin & Sạc), phục vụ hiển thị accordion trực quan và dễ dàng phát triển tính năng so sánh cấu hình sau này.
3. **Quản lý ảnh đa chiều theo màu sắc (Color-specific Media):**  
   - Bảng `ProductImages` liên kết trực tiếp với `ColorId`, giúp giao diện Storefront tự động cập nhật đúng bộ ảnh chụp khi người dùng bấm đổi màu sắc máy.
4. **Khóa lạc quan chống bán vượt tồn kho (Overselling Concurrency Protection):**  
   - Cột `RowVersion` trên bảng `ProductVariants` ngăn chặn triệt để tình trạng 2 khách hàng đồng thời đặt mua chiếc máy cuối cùng trong kho.
5. **Snapshot dữ liệu đơn hàng bất biến (Order Immutability):**  
   - Bảng `OrderItems` lưu trữ độc lập giá bán và tên sản phẩm tại thời điểm giao dịch, bảo vệ lịch sử hóa đơn không bao giờ bị sai lệch khi giá niêm yết trong kho thay đổi.
