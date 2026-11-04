# Thiết Kế Cơ Sở Dữ Liệu (Database Design)

> **Tài liệu thiết kế cơ sở dữ liệu nền tảng thương mại điện tử Urban Stitch (Apple Store Ecosystem).**  
> Bản đặc tả chuẩn hóa toàn bộ 27 bảng dữ liệu, phân vùng Schema, cấu trúc thuộc tính sản phẩm đa năng (Hybrid EAV), nhóm thông số kỹ thuật phân cấp, quản lý kho hàng với kiểm soát tương tranh khóa lạc quan (Optimistic Concurrency Control) và hệ thống khuyến mãi - thanh toán bảo mật.

---

## 1. Tổng quan Kiến trúc Dữ liệu

Cơ sở dữ liệu của hệ thống Urban Stitch được xây dựng trên nền tảng **Microsoft SQL Server 2022**, phân tách rạch ròi thành 3 Schemas độc lập theo từng miền nghiệp vụ (Bounded Contexts):

| Tên Schema | Phạm vi nghiệp vụ | Bảng trực thuộc | Trách nhiệm chính |
| :--- | :--- | :---: | :--- |
| **`catalog`** | Quản lý Hàng hóa & Cấu hình | 11 bảng | Lưu trữ cấu trúc ngành hàng Apple, bảng màu thương mại, tùy chọn dung lượng, sản phẩm cha, biến thể thương mại, ma trận thuộc tính động (EAV), thư viện ảnh theo màu và nhóm thông số kỹ thuật phân cấp. |
| **`sales`** | Bán hàng, Giỏ hàng & Dòng tiền | 7 bảng | Lưu trữ giỏ hàng (khách vãng lai và thành viên), chi tiết giỏ, đơn đặt hàng, snapshot mặt hàng đã mua, voucher khuyến mãi đa đối tượng, ví voucher cá nhân hóa và nhật ký áp dụng voucher. |
| **`identity`** | Xác thực, Phân quyền & Phiên | 8 bảng | Lưu trữ tài khoản người dùng, vai trò phân quyền (RBAC), liên kết vai trò, thông tin bảo mật mật khẩu, khóa đăng nhập và các phiên Refresh Token hoạt động. |
| **`dbo`** | Lịch sử Hạ tầng & Migration | 1 bảng | Bảng `__EFMigrationsHistory` kiểm soát các phiên bản migration tự động của Entity Framework Core. |

---

## 2. Chuẩn hóa Thực thể Cơ sở (BaseEntity Pattern & Global Query Filter)

Toàn bộ các bảng nghiệp vụ trong 2 schema `catalog` và `sales` đều kế thừa từ lớp thực thể cơ sở `BaseEntity<int>`, đảm bảo tính toàn vẹn và đồng nhất 100% trong toàn bộ hệ thống:

### Các trường Auditing & Xóa mềm (Soft Delete) tự động

| Tên cột | Kiểu dữ liệu | Nullable | Ràng buộc / Mặc định | Ý nghĩa nghiệp vụ |
| :--- | :--- | :---: | :---: | :--- |
| `Id` | `int` | Không | `PRIMARY KEY IDENTITY(1,1)` | Khóa chính duy nhất của bản ghi. |
| `IsActive` | `bit` | Không | Mặc định `1` | Trạng thái hiển thị / kích hoạt bản ghi trong hệ thống. |
| `CreatedOn` | `datetimeoffset` | Không | `UtcNow` | Mốc thời gian tạo bản ghi chuẩn quốc tế kèm múi giờ. |
| `CreatedBy` | `nvarchar(max)` | Có | `NULL` | Định danh tài khoản người dùng tạo bản ghi. |
| `LastModifiedOn` | `datetimeoffset` | Có | `NULL` | Mốc thời gian chỉnh sửa thông tin bản ghi gần nhất. |
| `LastModifiedBy` | `nvarchar(max)` | Có | `NULL` | Định danh tài khoản người dùng sửa bản ghi. |
| `IsDeleted` | `bit` | Không | Mặc định `0` | Cờ xóa mềm (0: Khả dụng, 1: Đã xóa mềm). |
| `DeletedOn` | `datetimeoffset` | Có | `NULL` | Mốc thời gian khi bản ghi bị xóa mềm. |
| `DeletedBy` | `nvarchar(max)` | Có | `NULL` | Định danh tài khoản thực hiện thao tác xóa mềm. |

> **Quy tắc vận hành:**
>
> - **Global Query Filter:** Mọi truy vấn đọc (`SELECT`) qua Entity Framework Core đều được tự động gắn bộ lọc ngầm `WHERE IsDeleted = 0`. Dữ liệu xóa mềm không bao giờ bị mất vĩnh viễn và không làm gãy các ràng buộc khóa ngoại lịch sử.
> - **Tối ưu bảng danh mục:** Riêng schema `identity` tuân thủ chuẩn Microsoft ASP.NET Core Identity nên quản lý trường kiểm soát riêng (`LockoutEnabled`, `AccessFailedCount`, `ConcurrencyStamp`).

---

## 3. Bản đồ Quan hệ giữa các Bảng (Relationship Mapping)

Mối quan hệ thực thể toàn hệ thống được mô tả bằng bảng quan hệ tường minh:

| Bảng nguồn | Loại quan hệ | Bảng đích | Khóa ngoại (Foreign Key) | Hành vi ràng buộc (Cascade Action) | Ý nghĩa nghiệp vụ thực tế |
| :--- | :---: | :--- | :--- | :---: | :--- |
| `catalog.Categories` | **1 - N** | `catalog.Products` | `Products.CategoryId` | `RESTRICT` | Một danh mục (iPhone, Mac, iPad) chứa nhiều dòng máy. |
| `catalog.Products` | **1 - N** | `catalog.ProductVariants` | `ProductVariants.ProductId` | `CASCADE` | Một dòng máy có nhiều phiên bản màu sắc, dung lượng cụ thể. |
| `catalog.Colors` | **1 - N** | `catalog.ProductVariants` | `ProductVariants.ColorId` | `RESTRICT` | Biến thể liên kết tới màu sắc thương mại của Apple. |
| `catalog.StorageOptions` | **1 - N** | `catalog.ProductVariants` | `ProductVariants.StorageOptionId` | `RESTRICT` | Biến thể liên kết tới tùy chọn dung lượng lưu trữ. |
| `catalog.Products` | **1 - N** | `catalog.ProductOptions` | `ProductOptions.ProductId` | `CASCADE` | Sản phẩm có các nhóm tùy chọn cấu hình động (Màu sắc, Dung lượng, RAM). |
| `catalog.ProductOptions` | **1 - N** | `catalog.ProductOptionValues` | `ProductOptionValues.OptionId` | `CASCADE` | Mỗi tùy chọn động có nhiều giá trị cụ thể (Titan Sa Mạc, 1TB, 16GB). |
| `catalog.ProductVariants` | **N - N** | `catalog.ProductOptionValues` | Bảng nối `ProductVariantValues` | `CASCADE` | Biến thể cấu hình được tổ hợp từ các giá trị tùy chọn động. |
| `catalog.Products` | **1 - N** | `catalog.ProductImages` | `ProductImages.ProductId` | `CASCADE` | Thư viện hình ảnh thuộc về sản phẩm cha. |
| `catalog.ProductOptionValues` | **1 - N** | `catalog.ProductImages` | `ProductImages.OptionValueId` | `SET NULL` | Hình ảnh gắn chặt với một màu sắc cụ thể để chuyển đổi ảnh khi chọn màu. |
| `catalog.Products` | **1 - N** | `catalog.ProductSpecificationGroups` | `ProductSpecificationGroups.ProductId` | `CASCADE` | Sản phẩm phân chia thông số thành các nhóm (Màn hình, Chip, Camera). |
| `catalog.ProductSpecificationGroups` | **1 - N** | `catalog.ProductSpecifications` | `ProductSpecifications.GroupId` | `CASCADE` | Mỗi nhóm thông số chứa các tiêu chí kỹ thuật chi tiết. |
| `identity.Users` | **1 - N** | `sales.Carts` | `Carts.UserId` | `CASCADE` | Mỗi tài khoản thành viên sở hữu một giỏ hàng chính thức. |
| `sales.Carts` | **1 - N** | `sales.CartItems` | `CartItems.CartId` | `CASCADE` | Giỏ hàng chứa nhiều sản phẩm chọn mua. |
| `catalog.ProductVariants` | **1 - N** | `sales.CartItems` | `CartItems.ProductVariantId` | `CASCADE` | Mặt hàng trong giỏ tham chiếu tới cấu hình biến thể cụ thể. |
| `identity.Users` | **1 - N** | `sales.Orders` | `Orders.UserId` | `SET NULL` | Đơn hàng thuộc về tài khoản khách hàng (hoặc `NULL` nếu là khách vãng lai). |
| `sales.Vouchers` | **1 - N** | `sales.Orders` | `Orders.VoucherId` | `SET NULL` | Đơn hàng được áp dụng mã voucher giảm giá nào. |
| `sales.Orders` | **1 - N** | `sales.OrderItems` | `OrderItems.OrderId` | `CASCADE` | Đơn hàng chứa nhiều dòng sản phẩm đã chốt giá snapshot. |
| `catalog.ProductVariants` | **1 - N** | `sales.OrderItems` | `OrderItems.ProductVariantId` | `SET NULL` | Mặt hàng đã mua liên kết tới biến thể kho (giữ nguyên khi biến thể bị xóa). |
| `sales.Vouchers` | **1 - N** | `sales.UserVouchers` | `UserVouchers.VoucherId` | `CASCADE` | Ví voucher cá nhân hóa cho từng khách hàng thành viên. |
| `identity.Users` | **1 - N** | `sales.UserVouchers` | `UserVouchers.UserId` | `CASCADE` | Tài khoản thành viên nhận voucher quà tặng tri ân hoặc bồi thường. |
| `sales.Vouchers` | **1 - N** | `sales.VoucherUsages` | `VoucherUsages.VoucherId` | `CASCADE` | Nhật ký ghi nhận chi tiết mỗi lượt áp dụng voucher. |

---

## 4. Thiết Kế Cơ Sở Dữ Liệu Thuộc Tính Đa Năng & Linh Hoạt (Dynamic Hybrid EAV)

### 4.1. Bài toán Thách thức của Ngành hàng Apple

Hệ sinh thái sản phẩm công nghệ Apple sở hữu ma trận cấu hình vô cùng phức tạp và thay đổi liên tục theo từng năm:

- **iPhone:** Phân hóa theo Màu sắc thương mại (Titan Sa Mạc, Titan Tự Nhiên, Titan Đen, Titan Trắng) và Bộ nhớ trong (128GB, 256GB, 512GB, 1TB, 2TB).
- **MacBook:** Phân hóa theo Dòng chip (M3, M4, M4 Pro, M4 Max, M5, M6 Ultra), RAM thống nhất (16GB, 24GB, 36GB, 48GB, 64GB, 128GB), Dung lượng SSD (512GB đến 8TB) và Màu sắc vỏ nhôm (Space Black, Silver, Sky Blue).
- **iPad:** Phân hóa theo Kích thước màn hình (11 inch, 13 inch), Kết nối mạng (Wi-Fi đơn thuần hoặc Wi-Fi + 5G Cellular), và Kính phủ (Kính tiêu chuẩn hoặc Kính phủ cấu trúc Nano-texture).
- **Apple Watch:** Phân hóa theo Chất liệu vỏ (Nhôm Jet Black, Titanium hàng không vũ trụ), Kích thước mặt (42mm, 46mm, 49mm Ultra), và Loại dây đeo kèm theo.

> **Nếu thiết kế CSDL theo cách truyền thống (cột cố định vào bảng Product):** Khi Apple ra mắt thuộc tính mới (ví dụ: *Nút Điều Khiển Camera, Mặt kính Nano-texture, Kết nối Vệ tinh hai chiều*), hệ thống buộc phải chạy script ALTER TABLE, sửa đổi entity code, compile lại backend và đối mặt nguy cơ downtime hệ thống.

### 4.2. Giải pháp Kiến trúc Hybrid EAV Độc quyền của Urban Stitch

Hệ thống kết hợp sức mạnh giữa **Cố định hóa các thuộc tính cốt lõi thường dùng** và **Mô hình Entity-Attribute-Value (EAV) động**:

1. **Thuộc tính Cố định Tối ưu Tốc độ (`Colors` & `StorageOptions`):**
   - Bảng `catalog.Colors`: Lưu trữ mã định danh thương mại (`Code`), tên tiếng Việt hiển thị (`Name`) và mã màu chuẩn HEX (`HexCode`, ví dụ `#C4A482`) để render ngay vòng tròn swatch màu trên giao diện mà không cần tính toán lại.
   - Bảng `catalog.StorageOptions`: Lưu trữ nhãn (`128GB`, `1TB`) và giá trị số học nguyên thủy `CapacityValue` (`1024`) cùng đơn vị `Unit` (`GB`) để sắp xếp thứ tự dung lượng tăng dần chính xác 100% bằng câu lệnh SQL số học.
   - Khóa ngoại trực tiếp trên `catalog.ProductVariants`: Cho phép truy vấn siêu tốc 90% trường hợp lọc hàng phổ thông trên Storefront.

2. **Ma trận Thuộc tính Động Không Giới Hạn (`ProductOptions`, `ProductOptionValues`, `ProductVariantValues`):**
   - Cho phép Quản trị viên khởi tạo bất kỳ nhóm tùy chọn cấu hình nào (`ProductOptions.Name` = *Phiên bản kết nối*, *Chất liệu kính màn hình*, *Dung lượng RAM Unified*).
   - Mỗi tùy chọn có tập giá trị động `ProductOptionValues` (ví dụ: *Wi-Fi*, *Wi-Fi + 5G Cellular*, *Nano-texture Glass*).
   - Biến thể thương mại thực tế (`catalog.ProductVariants`) được ánh xạ với tổ hợp giá trị qua bảng liên kết `catalog.ProductVariantValues`.
   - **Lợi ích vượt trội:** Bổ sung dải sản phẩm mới (ví dụ: Apple Glass, Robot gia đình 2026) mà không cần can thiệp bất kỳ dòng lệnh SQL ALTER TABLE nào.

3. **Nhóm Thông Số Kỹ Thuật Đa Tầng Phân Cấp (`ProductSpecificationGroups` & `ProductSpecifications`):**
   - Thay vì lưu một chuỗi JSON vô cấu trúc khó tra cứu, hệ thống chuẩn hóa thông số thành 2 cấp:
     - **Cấp 1 - Nhóm thông số (`ProductSpecificationGroups`):** *Hiệu năng & Vi xử lý*, *Màn hình & Hiển thị*, *Camera & Quay phim*, *Pin & Sạc*, *Thiết kế & Trọng lượng*, *Tiện ích & Kết nối*.
     - **Cấp 2 - Mục kỹ thuật chi tiết (`ProductSpecifications`):** Tên tiêu chí, giá trị và đơn vị tính (ví dụ: *Độ sáng tối đa: 3000 nits*, *Chuẩn kháng nước: IP68*, *Tần số quét: 120Hz ProMotion*).
   - Render tự động bảng thông số kỹ thuật chuyên nghiệp, đồng bộ chuẩn mực như trang chủ chính hãng của Apple.

4. **Thư viện Hình Ảnh Đa Chiều Liên Kết Màu (`catalog.ProductImages`):**
   - Mỗi sản phẩm có bộ sưu tập ảnh phong phú.
   - Mỗi ảnh được liên kết với `OptionValueId` (đại diện cho màu sắc cụ thể) và cờ `IsPrimary`.
   - Khi người dùng bấm đổi màu sắc trên giao diện trang chi tiết sản phẩm, toàn bộ slider ảnh chính và carousel thumbnail lập tức đồng bộ chuyển sang màu tương ứng mà không cần reload trang.

---

## 5. Chi Tiết Danh Mục 27 Bảng Dữ Liệu Hệ Thống

### 5.1. Bảng Dữ liệu Phân hệ Hàng hóa (`catalog`)

#### 1. Bảng `catalog.Categories` (Danh mục sản phẩm)

Quản lý các nhóm ngành hàng thiết bị công nghệ Apple chính hãng:

- `Id` (`int`, PK IDENTITY)
- `Name` (`nvarchar(150)`, NOT NULL): Tên danh mục (iPhone, MacBook, iPad, Apple Watch, AirPods & Âm thanh, iMac & Mac Desktop, Phụ kiện Apple).
- `Slug` (`varchar(100)`, NOT NULL, UNIQUE INDEX): Đường dẫn URL thân thiện SEO (`iphone`, `macbook`, `ipad`...).
- `Description` (`nvarchar(500)`, NULL): Mô tả giới thiệu ngành hàng.
- `ImageUrl` (`nvarchar(1000)`, NULL): Đường dẫn ảnh banner đại diện danh mục.
- `DisplayOrder` (`int`, NOT NULL, DEFAULT 0): Thứ tự ưu tiên sắp xếp trên thanh điều hướng.
- Các trường BaseEntity: `IsActive`, `CreatedOn`, `CreatedBy`, `LastModifiedOn`, `LastModifiedBy`, `IsDeleted`, `DeletedOn`, `DeletedBy`.

#### 2. Bảng `catalog.Colors` (Bảng màu thương mại Apple)

Quản lý danh mục màu sắc chính hãng theo từng thế hệ sản phẩm:

- `Id` (`int`, PK IDENTITY)
- `Name` (`nvarchar(100)`, NOT NULL): Tên màu sắc hiển thị (Titan Sa Mạc, Titan Tự Nhiên, Titan Đen, Titan Trắng, Midnight, Starlight...).
- `Code` (`varchar(50)`, NOT NULL): Mã định danh màu (`DESERT_TITAN`, `NATURAL_TITAN`, `MIDNIGHT`).
- `HexCode` (`varchar(20)`, NOT NULL): Mã màu HEX hiển thị trực quan (`#C4A482`, `#9E9A95`, `#1F2937`).
- Các trường BaseEntity chuẩn.

#### 3. Bảng `catalog.StorageOptions` (Dung lượng bộ nhớ lưu trữ)

Quản lý các định mức dung lượng bộ nhớ:

- `Id` (`int`, PK IDENTITY)
- `Name` (`nvarchar(50)`, NOT NULL): Tên nhãn hiển thị (`128GB`, `256GB`, `512GB`, `1TB`, `2TB`).
- `CapacityValue` (`bigint`, NULL): Giá trị số quy đổi theo GB (`128`, `256`, `512`, `1024`, `2048`) phục vụ sắp xếp tăng dần.
- `Unit` (`varchar(10)`, NULL): Đơn vị tính (`GB`, `TB`).
- Các trường BaseEntity chuẩn.

#### 4. Bảng `catalog.Products` (Sản phẩm cha / Dòng máy chung)

Đại diện cho dòng sản phẩm chung của Apple:

- `Id` (`int`, PK IDENTITY)
- `CategoryId` (`int`, NOT NULL, FK $\rightarrow$ `Categories.Id`): Danh mục ngành hàng trực thuộc.
- `Name` (`nvarchar(250)`, NOT NULL): Tên sản phẩm chính thức (ví dụ: *iPhone 16 Pro Max*, *MacBook Pro 16 inch M4 Max*).
- `Slug` (`varchar(250)`, NOT NULL, UNIQUE INDEX): Đường dẫn URL thân thiện cho chi tiết sản phẩm.
- `ModelCode` (`varchar(50)`, NULL): Mã dòng máy Apple (ví dụ: `A3296`, `A3185`).
- `ShortDescription` (`nvarchar(500)`, NULL): Mô tả tóm tắt nổi bật cấu hình.
- `Description` (`nvarchar(max)`, NULL): Bài viết đánh giá chuyên sâu và hình ảnh chi tiết.
- `WarrantyMonths` (`int`, NOT NULL, DEFAULT 12): Thời gian bảo hành chính hãng Apple VN/A (tháng).
- Các trường BaseEntity chuẩn.

#### 5. Bảng `catalog.ProductOptions` (Tùy chọn cấu hình động)

Khai báo các nhóm thuộc tính tùy biến cho từng sản phẩm:

- `Id` (`int`, PK IDENTITY)
- `ProductId` (`int`, NOT NULL, FK $\rightarrow$ `Products.Id`): Thuộc sản phẩm nào.
- `Name` (`nvarchar(100)`, NOT NULL): Tên nhóm tùy chọn (*Màu sắc*, *Dung lượng*, *RAM Unified*, *Mặt kính*).
- `DisplayOrder` (`int`, NOT NULL, DEFAULT 0): Thứ tự hiển thị trên bộ chọn cấu hình.
- Các trường BaseEntity chuẩn.

#### 6. Bảng `catalog.ProductOptionValues` (Giá trị tùy chọn cấu hình)

Các giá trị chi tiết thuộc về nhóm tùy chọn:

- `Id` (`int`, PK IDENTITY)
- `OptionId` (`int`, NOT NULL, FK $\rightarrow$ `ProductOptions.Id`): Thuộc nhóm tùy chọn nào.
- `Value` (`nvarchar(150)`, NOT NULL): Giá trị hiển thị (*Titan Sa Mạc*, *256GB*, *32GB RAM*, *Kính Nano-texture*).
- `ColorHexCode` (`varchar(20)`, NULL): Mã màu HEX bổ trợ nếu tùy chọn là bảng màu.
- `DisplayOrder` (`int`, NOT NULL, DEFAULT 0): Thứ tự ưu tiên sắp xếp giá trị.
- Các trường BaseEntity chuẩn.

#### 7. Bảng `catalog.ProductVariants` (Biến thể thương mại bán ra & Quản lý Kho)

Đại diện cho mặt hàng vật lý cụ thể trong kho:

- `Id` (`int`, PK IDENTITY)
- `ProductId` (`int`, NOT NULL, FK $\rightarrow$ `Products.Id`): Dòng sản phẩm cha.
- `SKU` (`varchar(100)`, NOT NULL, UNIQUE INDEX): Mã định danh lưu kho độc nhất (ví dụ: `VN-001-1-2`).
- `VariantName` (`nvarchar(200)`, NOT NULL): Tên cấu hình chi tiết (ví dụ: *Titan Sa Mạc / 256GB*).
- `ColorId` (`int`, NULL, FK $\rightarrow$ `Colors.Id`): Khóa ngoại màu sắc cố định.
- `StorageOptionId` (`int`, NULL, FK $\rightarrow$ `StorageOptions.Id`): Khóa ngoại dung lượng cố định.
- `Price` (`decimal(18,2)`, NOT NULL): Giá bán thực tế hiện hành.
- `CompareAtPrice` (`decimal(18,2)`, NULL): Giá niêm yết ban đầu (phục vụ hiển thị % giảm giá).
- `QuantityInStock` (`int`, NOT NULL, DEFAULT 0): **Số lượng tồn kho khả dụng thời gian thực**.
- `CostPrice` (`decimal(18,2)`, NOT NULL, DEFAULT 0): Giá vốn nhập khẩu (phục vụ báo cáo lợi nhuận gộp).
- `RowVersion` (`rowversion`, NOT NULL): **Con dấu thời gian nhị phân kiểm soát khóa lạc quan (Optimistic Concurrency Control)**.
- Các trường BaseEntity chuẩn.

#### 8. Bảng `catalog.ProductVariantValues` (Bảng nối Biến thể - Tùy chọn động)

Ánh xạ biến thể cấu hình với tổ hợp các giá trị thuộc tính động:

- `VariantId` (`int`, NOT NULL, FK $\rightarrow$ `ProductVariants.Id`): Mã biến thể.
- `OptionValueId` (`int`, NOT NULL, FK $\rightarrow$ `ProductOptionValues.Id`): Mã giá trị tùy chọn.
- Khóa chính kết hợp: `PRIMARY KEY ([VariantId], [OptionValueId])`.

#### 9. Bảng `catalog.ProductImages` (Thư viện hình ảnh theo màu)

Quản lý bộ sưu tập ảnh sản phẩm:

- `Id` (`int`, PK IDENTITY)
- `ProductId` (`int`, NOT NULL, FK $\rightarrow$ `Products.Id`): Thuộc sản phẩm nào.
- `OptionValueId` (`int`, NULL, FK $\rightarrow$ `ProductOptionValues.Id`): Liên kết với giá trị màu sắc cụ thể.
- `ImageUrl` (`nvarchar(1000)`, NULL): Đường dẫn ảnh tải lên máy chủ Cloudinary CDN (chấp nhận NULL an toàn cho fallback).
- `AltText` (`nvarchar(255)`, NULL): Văn bản mô tả ảnh cho trợ năng và SEO.
- `DisplayOrder` (`int`, NOT NULL, DEFAULT 0): Thứ tự hiển thị trong bộ sưu tập ảnh.
- `IsPrimary` (`bit`, NOT NULL, DEFAULT 0): Cờ đánh dấu ảnh đại diện chính của màu sắc đó.
- Các trường BaseEntity chuẩn.

#### 10. Bảng `catalog.ProductSpecificationGroups` (Nhóm thông số kỹ thuật)

- `Id` (`int`, PK IDENTITY)
- `ProductId` (`int`, NOT NULL, FK $\rightarrow$ `Products.Id`): Thuộc sản phẩm nào.
- `Name` (`nvarchar(150)`, NOT NULL): Tên nhóm (*Hiệu năng & Vi xử lý*, *Màn hình & Hiển thị*...).
- `DisplayOrder` (`int`, NOT NULL, DEFAULT 0): Thứ tự ưu tiên hiển thị nhóm.
- Các trường BaseEntity chuẩn.

#### 11. Bảng `catalog.ProductSpecifications` (Chi tiết thông số kỹ thuật)

- `Id` (`int`, PK IDENTITY)
- `GroupId` (`int`, NOT NULL, FK $\rightarrow$ `ProductSpecificationGroups.Id`): Thuộc nhóm thông số nào.
- `Name` (`nvarchar(150)`, NOT NULL): Tên tiêu chuẩn kỹ thuật (Chipset, Công nghệ màn hình, Độ phân giải).
- `Value` (`nvarchar(max)`, NOT NULL): Giá trị thông số (*Apple A18 Pro 3nm*, *Super Retina XDR 120Hz*).
- `Unit` (`nvarchar(50)`, NULL): Đơn vị đo lường (nits, inch, giờ, mAh).
- `DisplayOrder` (`int`, NOT NULL, DEFAULT 0): Thứ tự hiển thị trong nhóm.
- Các trường BaseEntity chuẩn.

---

### 5.2. Bảng Dữ liệu Phân hệ Bán hàng & Dòng tiền (`sales`)

#### 12. Bảng `sales.Carts` (Giỏ hàng)

Quản lý phiên giỏ hàng của khách hàng:

- `Id` (`int`, PK IDENTITY)
- `UserId` (`int`, NULL, FK $\rightarrow$ `identity.Users.Id`): Mã tài khoản thành viên (NULL nếu là khách vãng lai).
- `GuestId` (`varchar(100)`, NULL, INDEX): Mã định danh lưu trữ trong LocalStorage/Cookie của khách vãng lai.
- Các trường BaseEntity chuẩn.

#### 13. Bảng `sales.CartItems` (Chi tiết mặt hàng trong giỏ)

- `Id` (`int`, PK IDENTITY)
- `CartId` (`int`, NOT NULL, FK $\rightarrow$ `Carts.Id`): Thuộc giỏ hàng nào.
- `ProductVariantId` (`int`, NOT NULL, FK $\rightarrow$ `ProductVariants.Id`): Biến thể được chọn mua.
- `Quantity` (`int`, NOT NULL, CHECK `Quantity > 0`): Số lượng đặt mua.
- `IsSelected` (`bit`, NOT NULL, DEFAULT 1): Cờ tích chọn thanh toán hay chưa (Selective Checkout).
- Các trường BaseEntity chuẩn.

#### 14. Bảng `sales.Vouchers` (Chính sách Khuyến mãi & Mã giảm giá)

Quản lý các chương trình ưu đãi đa đối tượng:

- `Id` (`int`, PK IDENTITY)
- `Code` (`varchar(50)`, NOT NULL, UNIQUE INDEX): Mã voucher viết hoa không dấu (`APPLE2026`, `CHAOBANMOI`).
- `Name` (`nvarchar(150)`, NOT NULL): Tên chương trình ưu đãi hiển thị.
- `Description` (`nvarchar(500)`, NULL): Mô tả điều kiện sử dụng mã.
- `DiscountType` (`varchar(30)`, NOT NULL): Loại chiết khấu (`Percentage` - theo %, hoặc `FixedAmount` - tiền cố định).
- `DiscountValue` (`decimal(18,2)`, NOT NULL, CHECK `DiscountValue > 0`): Giá trị chiết khấu (10% hoặc 500.000đ).
- `MinOrderAmount` (`decimal(18,2)`, NULL): Giá trị đơn hàng tối thiểu để được áp dụng.
- `MaxDiscountAmount` (`decimal(18,2)`, NULL): Mức giảm giá tối đa (dành cho voucher dạng %).
- `StartDate` (`datetimeoffset`, NOT NULL): Mốc bắt đầu có hiệu lực.
- `EndDate` (`datetimeoffset`, NOT NULL): Mốc kết thúc hiệu lực.
- `UsageLimit` (`int`, NULL): Tổng lượt áp dụng tối đa trên toàn hệ thống.
- `UsageCount` (`int`, NOT NULL, DEFAULT 0): Số lượt đã sử dụng thực tế.
- `PerUserLimit` (`int`, NOT NULL, DEFAULT 1): Giới hạn số lần dùng tối đa trên mỗi khách hàng.
- `TargetType` (`varchar(30)`, NOT NULL, DEFAULT 'Public'): Đối tượng thụ hưởng (`Public`, `RegisteredOnly`, `AssignedOnly`).
- `RowVersion` (`rowversion`, NOT NULL): Khóa lạc quan chống sử dụng vượt quá ngân sách khuyến mãi.
- Các trường BaseEntity chuẩn.

#### 15. Bảng `sales.UserVouchers` (Ví Voucher Cá nhân hóa)

Lưu trữ các mã ưu đãi được cấp phát riêng cho từng thành viên (Quà sinh nhật, Khách VIP, Bồi thường đơn hàng):

- `Id` (`int`, PK IDENTITY)
- `UserId` (`int`, NOT NULL, FK $\rightarrow$ `identity.Users.Id`): Khách hàng sở hữu.
- `VoucherId` (`int`, NOT NULL, FK $\rightarrow$ `Vouchers.Id`): Mã voucher được cấp.
- `AssignedUsageLimit` (`int`, NOT NULL, DEFAULT 1): Số lượt dùng được cấp riêng cho user này.
- `UsedCount` (`int`, NOT NULL, DEFAULT 0): Số lượt khách hàng này đã dùng.
- `AssignedAt` (`datetimeoffset`, NOT NULL): Thời điểm hệ thống cấp tặng vào ví.
- `ExpiresAt` (`datetimeoffset`, NULL): Hạn dùng riêng cho tài khoản này.
- Các trường BaseEntity chuẩn.

#### 16. Bảng `sales.VoucherUsages` (Nhật ký áp dụng Voucher)

- `Id` (`int`, PK IDENTITY)
- `VoucherId` (`int`, NOT NULL, FK $\rightarrow$ `Vouchers.Id`): Mã voucher đã áp dụng.
- `OrderId` (`int`, NOT NULL, FK $\rightarrow$ `Orders.Id`): Đơn hàng đã hưởng ưu đãi.
- `UserId` (`int`, NULL, FK $\rightarrow$ `identity.Users.Id`): Khách hàng áp dụng.
- `DiscountAmount` (`decimal(18,2)`, NOT NULL): Số tiền thực tế được trừ vào đơn.
- `UsedAt` (`datetimeoffset`, NOT NULL): Mốc thời gian giao dịch ghi nhận.

#### 17. Bảng `sales.Orders` (Đơn đặt hàng)

Bảng trung tâm của toàn bộ chu trình bán hàng và báo cáo doanh thu:

- `Id` (`int`, PK IDENTITY)
- `OrderNumber` (`varchar(40)`, NOT NULL, UNIQUE INDEX): Mã đơn hàng giao dịch (ví dụ: `US2600001`).
- `UserId` (`int`, NULL, FK $\rightarrow$ `identity.Users.Id`): Mã khách hàng thành viên (hoặc NULL nếu là khách vãng lai).
- `GuestId` (`varchar(100)`, NULL, INDEX): Mã định danh khách vãng lai để liên kết và tra cứu.
- `Status` (`varchar(30)`, NOT NULL): Trạng thái vòng đời (`Pending`, `Confirmed`, `Shipping`, `Delivered`, `Completed`, `Cancelled`).
- `PaymentMethod` (`varchar(30)`, NOT NULL): Phương thức thanh toán (`COD` - Tiền mặt khi nhận, hoặc `VNPAY` - Trực tuyến).
- `PaymentStatus` (`varchar(30)`, NOT NULL): Trạng thái dòng tiền (`Pending`, `Paid`, `Failed`, `Refunded`).
- `RecipientName` (`nvarchar(150)`, NOT NULL): Tên người nhận hàng.
- `RecipientPhone` (`varchar(20)`, NOT NULL): Số điện thoại liên hệ giao hàng.
- `RecipientEmail` (`varchar(150)`, NULL): Email nhận hóa đơn điện tử.
- `ShippingAddressLine` (`nvarchar(250)`, NOT NULL): Địa chỉ số nhà, tên đường.
- `ShippingWard` (`nvarchar(100)`, NULL): Phường / Xã.
- `ShippingDistrict` (`nvarchar(100)`, NULL): Quận / Huyện.
- `ShippingProvince` (`nvarchar(100)`, NOT NULL): Tỉnh / Thành phố.
- `CustomerNote` (`nvarchar(500)`, NULL): Lời nhắn gửi nhân viên giao hàng.
- `Subtotal` (`decimal(18,2)`, NOT NULL, CHECK $\ge 0$): Tổng tiền hàng nguyên giá.
- `ShippingFee` (`decimal(18,2)`, NOT NULL, DEFAULT 0, CHECK $\ge 0$): Phí vận chuyển hỏa tốc.
- `DiscountAmount` (`decimal(18,2)`, NOT NULL, DEFAULT 0, CHECK $\ge 0$): Số tiền được giảm trừ qua Voucher.
- `TotalAmount` (`decimal(18,2)`, NOT NULL, CHECK $\ge 0$): **Tổng số tiền thanh toán thực tế** (`Subtotal - DiscountAmount + ShippingFee`).
- `VoucherId` (`int`, NULL, FK $\rightarrow$ `Vouchers.Id`): Mã voucher đã dùng.
- `VoucherCode` (`varchar(50)`, NULL): Tên mã voucher ghi nhận.
- `PlacedAt` (`datetimeoffset`, NOT NULL): Thời điểm đặt hàng chính thức.
- `StatusHistoryJson` (`nvarchar(max)`, NULL): **Nhật ký chuyển đổi trạng thái dạng JSON kèm mốc thời gian và ghi chú kiểm toán**.
- `ShippingAddressUpdateCount` (`int`, NOT NULL, DEFAULT 0): Số lần khách đã cập nhật địa chỉ giao hàng (khóa cứng tối đa 1 lần).
- `RowVersion` (`rowversion`, NOT NULL): Khóa lạc quan chống cập nhật trạng thái đơn đồng thời.
- Các trường BaseEntity chuẩn.

#### 18. Bảng `sales.OrderItems` (Snapshot Bất Biến Mặt Hàng Đã Mua)

Lưu lại bản sao snapshot chính xác 100% của mặt hàng tại thời điểm mua:

- `Id` (`int`, PK IDENTITY)
- `OrderId` (`int`, NOT NULL, FK $\rightarrow$ `Orders.Id` ON DELETE CASCADE): Thuộc đơn hàng nào.
- `ProductVariantId` (`int`, NULL, FK $\rightarrow$ `ProductVariants.Id` ON DELETE SET NULL): Biến thể kho tham chiếu.
- `ProductName` (`nvarchar(250)`, NOT NULL): Tên sản phẩm tại thời điểm mua (*iPhone 16 Pro Max*).
- `VariantName` (`nvarchar(200)`, NOT NULL): Tên cấu hình chi tiết (*Titan Sa Mạc / 256GB*).
- `SKU` (`varchar(100)`, NOT NULL): Mã SKU sản phẩm lúc mua.
- `ColorName` (`nvarchar(100)`, NULL): Tên màu sắc snapshot.
- `StorageName` (`nvarchar(50)`, NULL): Dung lượng snapshot.
- `UnitPrice` (`decimal(18,2)`, NOT NULL): **Đơn giá bán chốt tại thời điểm đặt hàng** (bất biến dù sau này giá kho tăng giảm).
- `Quantity` (`int`, NOT NULL, CHECK `Quantity > 0`): Số lượng đã mua.
- `LineTotal` (`decimal(18,2)`, NOT NULL): Thành tiền dòng hàng (`UnitPrice * Quantity`).
- `CostPrice` (`decimal(18,2)`, NOT NULL, DEFAULT 0): Giá vốn tại thời điểm mua (phục vụ tính lợi nhuận gộp chuẩn xác).
- `SelectedAttributesJson` (`nvarchar(max)`, NULL): JSON snapshot toàn bộ thuộc tính động đã chọn.
- `ThumbnailUrl` (`nvarchar(1000)`, NULL): Đường dẫn ảnh thumbnail sản phẩm tại thời điểm mua.
- Các trường BaseEntity chuẩn.

---

### 5.3. Bảng Dữ liệu Phân hệ Xác thực & Định danh (`identity`)

Các bảng được xây dựng trên nền tảng Microsoft ASP.NET Core Identity kết hợp phân quyền RBAC và Refresh Token bảo mật cao:

| Tên bảng | Khóa chính | Khóa ngoại | Mục đích & Trách nhiệm |
| :--- | :---: | :--- | :--- |
| **`identity.Users`** | `Id` (int) | | Lưu trữ tài khoản người dùng, email, mật khẩu đã mã hóa bằng PBKDF2 (`PasswordHash`), họ tên, số điện thoại, trạng thái khóa tài khoản (`LockoutEnd`, `IsActive`). |
| **`identity.Roles`** | `Id` (int) | | Danh mục các vai trò trong hệ thống (`SuperAdmin`, `User`). |
| **`identity.UserRoles`** | `UserId`, `RoleId` | FK $\rightarrow$ `Users`, FK $\rightarrow$ `Roles` | Ánh xạ người dùng nào mang những vai trò gì. |
| **`identity.RefreshTokens`** | `Id` (int) | FK $\rightarrow$ `Users.Id` | Quản lý chuỗi Refresh Token ngẫu nhiên 256-bit bảo mật, ngày hết hạn (`ExpiresAt`), trạng thái thu hồi (`IsRevoked`), IP tạo (`CreatedByIp`), IP thu hồi (`RevokedByIp`). Phục vụ cơ chế Silent Refresh Token an toàn. |
| **`identity.UserClaims`** | `Id` (int) | FK $\rightarrow$ `Users.Id` | Lưu trữ các đặc quyền claim chi tiết của người dùng. |
| **`identity.RoleClaims`** | `Id` (int) | FK $\rightarrow$ `Roles.Id` | Lưu trữ các quyền hạn gắn theo từng vai trò. |
| **`identity.UserLogins`** | `LoginProvider`, `ProviderKey` | FK $\rightarrow$ `Users.Id` | Hỗ trợ mở rộng đăng nhập mạng xã hội (Google, Apple ID). |
| **`identity.UserTokens`** | `UserId`, `LoginProvider`, `Name` | FK $\rightarrow$ `Users.Id` | Lưu các token hệ thống tạo ra (xác thực email, đặt lại mật khẩu). |

---

## 6. Kiểm Soát Tương Tranh Đa Tầng & Bảo Vệ Kho Hàng (3-Tier Concurrency Defense)

### 6.1. Rủi ro Bán vượt tồn kho (Overselling) trong Mở bán Apple

Khi một dòng máy cực "hot" như *iPhone 16 Pro Max Titan Sa Mạc 256GB* mở bán đợt đầu, hàng nghìn khách hàng có thể cùng nhấn nút "Đặt hàng" trong cùng một giây. Nếu chỉ kiểm tra bằng câu lệnh `if (stock >= quantity)` thông thường, các luồng chạy song song sẽ cùng đọc thấy còn hàng, cùng chấp nhận đơn và dẫn tới thảm họa bán vượt quá số lượng hàng có trong kho.

### 6.2. Cơ chế Phòng thủ 3 Lớp Bất Khả Xâm Phạm

Hệ thống Urban Stitch thiết lập hàng rào phòng thủ 3 tầng khép kín:

| Tầng kiểm soát | Cơ chế công nghệ | Vị trí áp dụng | Nguyên lý hoạt động chi tiết |
| :---: | :--- | :--- | :--- |
| **Tầng 1** | **In-Memory Lock với SemaphoreSlim & Lock Ordering** | Tầng Application (Bộ nhớ RAM máy chủ) | - Sử dụng `ConcurrentDictionary<int, SemaphoreSlim>` cấp phát một khóa độc quyền cho từng mã biến thể `ProductVariantId`.<br>- **Nguyên tắc Lock Ordering chống Deadlock:** Khi một đơn hàng chứa nhiều sản phẩm (ví dụ vừa mua iPhone vừa mua Củ sạc 35W), hệ thống **bắt buộc sắp xếp danh sách mã biến thể theo thứ tự ID tăng dần (`OrderBy(x => x.VariantId)`) trước khi xin khóa**. Quy tắc này triệt tiêu hoàn toàn khả năng xảy ra Deadlock chéo giữa các luồng. |
| **Tầng 2** | **ACID Database Transaction với Cấp độ Cô lập Tuyệt đối** | Tầng Infrastructure (SQL Server Engine) | - Đóng gói toàn bộ chuỗi hành động: `Đọc tồn kho` $\rightarrow$ `Kiểm tra số lượng` $\rightarrow$ `Trừ tồn kho ProductVariants` $\rightarrow$ `Tạo Order` $\rightarrow$ `Tạo OrderItems` $\rightarrow$ `Xóa giỏ hàng` $\rightarrow$ `Ghi nhận Voucher` trong một **`IDatabaseTransaction`** duy nhất.<br>- Nếu bất kỳ bước nào gặp sự cố, SQL Server tự động **ROLLBACK 100%**, hoàn trả dữ liệu về nguyên trạng ban đầu. |
| **Tầng 3** | **Khóa Lạc Quan Cơ sở Dữ liệu (`RowVersion`)** | Tầng Database (Cột `RowVersion` kiểu `timestamp`) | - Cột `RowVersion` trên bảng `catalog.ProductVariants` tự động thay đổi giá trị nhị phân mỗi khi có lệnh UPDATE.<br>- Khi cập nhật tồn kho, Entity Framework Core sinh ra câu lệnh `WHERE Id = @Id AND RowVersion = @OriginalRowVersion`.<br>- Nếu có bất kỳ tiến trình nào đã nhanh chân sửa đổi bản ghi trước đó, SQL Server trả về 0 dòng bị ảnh hưởng và EF Core lập tức ném ra ngoại lệ `DbUpdateConcurrencyException`. Giao dịch tự động hủy bỏ an toàn, báo lỗi tồn kho đã thay đổi tới người mua. |

---

## 7. Khả Năng Lưu Trữ & Truy Vấn Báo Cáo Doanh Thu Phân Tích Chuyên Sâu

Cấu trúc cơ sở dữ liệu được thiết kế tối ưu hóa cho các câu lệnh tổng hợp báo cáo kinh doanh tại `/admin/reports` và `/admin/dashboard`:

1. **Chỉ số Doanh thu Thực tế Không Chứa Ảo:**
   - Trường `sales.Orders.Status` kết hợp với `sales.Orders.PaymentStatus` cho phép lọc chuẩn xác doanh thu thực thu:

     ```sql
     SELECT SUM(TotalAmount) FROM [sales].[Orders] 
     WHERE Status IN ('Completed', 'Delivered') AND PaymentStatus = 'Paid';
     ```

   - Tách biệt hoàn toàn doanh thu thực nhận với các đơn hủy (`Cancelled`), đơn hoàn tiền (`Refunded`) hoặc đơn COD chưa thanh toán.

2. **Lợi Nhuận Gộp Tức Thời (Gross Margin):**
   - Nhờ lưu trữ `CostPrice` tại thời điểm mua trên từng dòng `sales.OrderItems`:

     ```sql
     SELECT SUM(LineTotal - (CostPrice * Quantity)) AS GrossProfit 
     FROM [sales].[OrderItems] oi 
     JOIN [sales].[Orders] o ON oi.OrderId = o.Id 
     WHERE o.Status IN ('Completed', 'Delivered') AND o.PaymentStatus = 'Paid';
     ```

   - Ban giám đốc tính toán được chính xác biên lợi nhuận ròng của từng dòng máy Apple theo từng tháng mà không bị sai lệch khi giá nhập hàng sau này biến động.

3. **Phân Tích Xu Hướng Thời Gian Không Bị Trễ:**
   - Cột `PlacedAt` lưu trữ kiểu `datetimeoffset` cho phép gom nhóm theo ngày (`CAST(PlacedAt AS date)`), theo tuần, theo tháng hoặc theo năm chuẩn múi giờ Việt Nam (`+07:00`) mà không bị lỗi lệch ngày do múi giờ UTC.
