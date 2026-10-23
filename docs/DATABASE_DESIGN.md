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
- **Mục đích:** Lưu trữ giỏ hàng và danh sách sản phẩm tạm tính của người dùng.

| Bảng | Cột nghiệp vụ | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| `Carts` | `UserId` | `int` | FK $\rightarrow$ `identity.Users(Id)` | Tài khoản sở hữu giỏ hàng |
| `CartItems` | `CartId`, `ProductVariantId`, `Quantity`, `UnitPrice` | `int`, `int`, `int`, `decimal(18,2)` | FK `CartId`, FK `ProductVariantId`, Check `Quantity > 0` | Chi tiết số lượng và đơn giá từng biến thể trong giỏ |

---

#### 2. Bảng `sales.Orders` & `sales.OrderItems` (Đơn đặt hàng)
- **Mục đích:** Lưu trữ đơn hàng hoàn tất sau khi checkout và snapshot bất biến của sản phẩm tại thời điểm mua.

| Bảng | Cột nghiệp vụ | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| `Orders` | `UserId`, `OrderNumber`, `TotalAmount`, `OrderStatus`, `PaymentStatus`, `ShippingAddress`, `PhoneNumber`, `CustomerName` | `int`, `nvarchar(50)`, `decimal(18,2)`, `nvarchar(50)`... | Unique `OrderNumber`, Check `TotalAmount >= 0` | Thông tin tổng đơn đặt hàng, giao vận và thanh toán |
| `OrderItems` | `OrderId`, `ProductVariantId`, `SKU`, `ProductName`, `UnitPrice`, `Quantity` | `int`, `int`, `nvarchar(100)`, `nvarchar(250)`, `decimal(18,2)`, `int` | FK `OrderId`, FK `ProductVariantId`, Check `Quantity > 0` | Snapshot bất biến lịch sử sản phẩm lúc mua hàng |

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
