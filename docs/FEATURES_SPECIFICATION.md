# Đặc Tả Tính Năng Hệ Thống (System Features Specification)

> **Tài liệu đặc tả toàn bộ tính năng hiện có của nền tảng thương mại điện tử Urban Stitch.**  
> Tài liệu này đóng vai trò là kim chỉ nam chức năng (Functional Specification Document - FSD) cho toàn bộ hệ thống, mô tả chi tiết hành vi, đầu vào, đầu ra, quy tắc nghiệp vụ (Business Rules), cơ chế bảo mật Zero-Trust và các kịch bản biên cho từng phân hệ từ Storefront đến Admin Portal.

---

## Mục lục Tính năng Hệ thống

1. [Phân hệ 1: Xác thực, Định danh & Phân quyền (Identity & RBAC)](#1-phân-hệ-xác-thực-định-danh--phân-quyền-identity--rbac)
2. [Phân hệ 2: Danh mục, Thuộc tính Động & Cấu hình Kỹ thuật (Catalog & Specs)](#2-phân-hệ-danh-mục-thuộc-tính-động--cấu-hình-kỹ-thuật-catalog--specs)
3. [Phân hệ 3: Quản lý Sản phẩm, Biến thể & Xử lý Ảnh Cloudinary CDN](#3-phân-hệ-quản-lý-sản-phẩm-biến-thể--xử-lý-ảnh-cloudinary-cdn)
4. [Phân hệ 4: Trải nghiệm Mua sắm Khách hàng (Storefront Experience)](#4-phân-hệ-trải-nghiệm-mua-sắm-khách-hàng-storefront-experience)
5. [Phân hệ 5: Giỏ hàng Trực tuyến & Tự phục hồi Tồn kho (Smart Cart)](#5-phân-hệ-giỏ-hàng-trực-tuyến--tự-phục-hồi-tồn-kho-smart-cart)
6. [Phân hệ 6: Khuyến mãi Đa đối tượng & Ví Voucher Cá nhân hóa (Vouchers)](#6-phân-hệ-khuyến-mãi-đa-đối-tượng--ví-voucher-cá-nhân-hóa-vouchers)
7. [Phân hệ 7: Đặt hàng, Vòng đời Đơn hàng & Tra cứu Bảo mật (Checkout & Lifecycle)](#7-phân-hệ-đặt-hàng-vòng-đời-đơn-hàng--tra-cứu-bảo-mật-checkout--lifecycle)
8. [Phân hệ 8: Thanh toán Trực tuyến VNPay & Kiểm soát Tương tranh Đa tầng](#8-phân-hệ-thanh-toán-trực-tuyến-vnpay--kiểm-soát-tương-tranh-đa-tầng)
9. [Phân hệ 9: Cổng Quản trị & Vận hành Đơn hàng (Admin Portal)](#9-phân-hệ-cổng-quản-trị--vận-hành-đơn-hàng-admin-portal)
10. [Phân hệ 10: Tự động hóa Hạ tầng, Container Docker & Môi trường Triển khai](#10-phân-hệ-tự-động-hóa-hạ-tầng-container-docker--môi-trường-triển-khai)

---

## 1. Phân hệ Xác thực, Định danh & Phân quyền (Identity & RBAC)

### 1.1. Bảng Tổng hợp Tính năng Xác thực

| Mã tính năng | Tên tính năng | Đối tượng áp dụng | Giao diện URL | API Endpoint | Phương thức |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **AUTH-01** | Đăng ký tài khoản khách hàng | Khách vãng lai | `/register` | `/api/auth/register` | `POST` |
| **AUTH-02** | Đăng nhập hệ thống (Storefront & Admin) | Toàn bộ người dùng | `/login`, `/admin/auth/login` | `/api/auth/login` | `POST` |
| **AUTH-03** | Làm mới Access Token ngầm (Silent Refresh) | Người dùng đã đăng nhập | Nền tảng (Axios Interceptor) | `/api/auth/refresh-token` | `POST` |
| **AUTH-04** | Xem thông tin hồ sơ cá nhân | Người dùng đăng nhập | `/profile`, `/admin/profile` | `/api/auth/profile` | `GET` |
| **AUTH-05** | Đổi mật khẩu tài khoản | Người dùng đăng nhập | `/profile` | `/api/auth/change-password` | `POST` |
| **AUTH-06** | Đăng xuất & Thu hồi phiên làm việc | Người dùng đăng nhập | Header Actions | `/api/auth/revoke-token` | `POST` |

### 1.2. Mô tả Chi tiết Nghiệp vụ & Ràng buộc Bảo mật

#### 1. Đăng ký & Đăng nhập (AUTH-01 & AUTH-02)
- **Đầu vào (Input):** Họ tên, Email hợp lệ, Mật khẩu (tối thiểu 6 ký tự, bao gồm chữ hoa, chữ thường, chữ số và ký tự đặc biệt).
- **Đầu ra (Output):** Thông tin người dùng (`Id`, `Email`, `FullName`, `Roles`), `AccessToken` dạng JWT trong phản hồi JSON và `RefreshToken` được lưu trong HTTP-Only Cookie.
- **Quy tắc bảo mật:**
  - Mật khẩu được băm (hash) bằng thuật toán mật mã PBKDF2 của ASP.NET Core Identity.
  - Kiểm tra email duy nhất: nếu email đã tồn tại, hệ thống ném ngoại lệ 400 kèm thông báo thân thiện.
  - Tự động gán quyền `Customer` mặc định cho các tài khoản đăng ký qua giao diện Storefront.

#### 2. Cơ chế Xác thực Kép Token (AUTH-03 & AUTH-06)
- **Kiến trúc Token:**
  - **Access Token:** Có thời hạn sống ngắn (15-60 phút), lưu hoàn toàn trong bộ nhớ RAM của ứng dụng React (Zustand store), tuyệt đối không lưu trong `localStorage` để chống tấn công XSS (Cross-Site Scripting).
  - **Refresh Token:** Lưu trữ trong cơ sở dữ liệu bảng `identity.RefreshTokens`, gắn kèm cờ `HttpOnly`, `SameSite=Strict`, `Secure` trong Cookie của trình duyệt để chống tấn công CSRF.
- **Cơ chế Silent Refresh Token:** Khi Access Token hết hạn, Axios Interceptor phát hiện mã lỗi 401, tự động kích hoạt API `/api/auth/refresh-token` để lấy Access Token mới mà không làm gián đoạn trải nghiệm của người dùng.
- **Thu hồi phiên (Revoke Token):** Khi bấm Đăng xuất, Refresh Token được đánh dấu hủy trong Database và xóa bỏ Cookie khỏi trình duyệt.

---

## 2. Phân hệ Danh mục, Thuộc tính Động & Cấu hình Kỹ thuật (Catalog & Specs)

### 2.1. Bảng Tổng hợp Tính năng Danh mục & Thuộc tính

| Mã tính năng | Tên tính năng | Đối tượng áp dụng | Giao diện URL | API Endpoint | Phương thức |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **CAT-01** | Lấy danh sách danh mục hoạt động | Công khai | Navigation Bar | `/api/categories` | `GET` |
| **CAT-02** | Quản lý Danh mục (CRUD, Slug, Sắp xếp) | Quản trị viên | `/admin/categories` | `/api/manager/categories` | `GET/POST/PUT/DELETE` |
| **CAT-03** | Quản lý Màu sắc thương mại Apple | Quản trị viên | `/admin/colors` | `/api/manager/colors` | `GET/POST/PUT/DELETE` |
| **CAT-04** | Quản lý Dung lượng bộ nhớ | Quản trị viên | `/admin/storage-options` | `/api/manager/storage-options` | `GET/POST/PUT/DELETE` |
| **CAT-05** | Quản lý Tùy chọn động (Options Matrix) | Quản trị viên | `/admin/products/:id` | `/api/manager/product-options` | `GET/POST/PUT/DELETE` |
| **CAT-06** | Quản lý Nhóm thông số kỹ thuật phân cấp | Quản trị viên | `/admin/products/:id` | `/api/manager/spec-groups` | `GET/POST/PUT/DELETE` |

### 2.2. Mô tả Chi tiết Nghiệp vụ & Ràng buộc

#### 1. Quản lý Danh mục Apple (CAT-01 & CAT-02)
- **Cấu trúc:** Quản lý các ngành hàng chuyên biệt: iPhone, iPad, Mac, Apple Watch, AirPods, Phụ kiện.
- **Ràng buộc:** Cột `Slug` được tạo tự động từ `Name`, đánh chỉ mục duy nhất (Unique Index). Hỗ trợ thứ tự hiển thị `DisplayOrder` để quản trị viên tùy biến vị trí xuất hiện trên thanh điều hướng chính.

#### 2. Thuộc tính Cố định: Màu sắc & Dung lượng (CAT-03 & CAT-04)
- **Màu sắc (`Colors`):** Lưu trữ cả tên hiển thị thương mại chuẩn Apple (ví dụ: *Titan Tự Nhiên*, *Xanh Cổ Vịt*, *Starlight*) và mã màu HEX (`#E2DFD7`) phục vụ việc hiển thị nút bấm mẫu màu trực quan cho người mua.
- **Dung lượng (`StorageOptions`):** Lưu trữ tên hiển thị (128GB, 256GB, 1TB) và giá trị số học quy đổi `CapacityInGB` (ví dụ 1TB = 1024GB) để hệ thống tự động sắp xếp các nút chọn dung lượng theo thứ tự tăng dần mà không bị sai lệch kiểu chuỗi.

#### 3. Mô hình Mở rộng Thuộc tính Động (Dynamic Hybrid EAV - CAT-05)
- **Bản chất:** Áp dụng cho các dòng sản phẩm phức tạp (MacBook phân hóa theo RAM 16GB/24GB/32GB; iPad phân hóa theo Wi-Fi / Wi-Fi + 5G; Apple Watch phân hóa theo Size mặt 41mm/45mm).
- **Cơ chế:** Cho phép tạo các `ProductOptions` và `ProductOptionValues` tùy ý trong Admin. Biến thể (`ProductVariants`) liên kết với các giá trị động này qua bảng nối `ProductVariantValues`. Cấu trúc này giúp cửa hàng mở rộng dải sản phẩm mới trong tương lai mà không cần thay đổi cấu trúc bảng SQL Server.

---

## 3. Phân hệ Quản lý Sản phẩm, Biến thể & Xử lý Ảnh Cloudinary CDN

### 3.1. Bảng Tổng hợp Tính năng Sản phẩm & Media

| Mã tính năng | Tên tính năng | Đối tượng áp dụng | Giao diện URL | API Endpoint | Phương thức |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **PRD-01** | Xem danh sách sản phẩm phân trang & lọc | Quản trị viên | `/admin/products` | `/api/manager/products` | `GET` |
| **PRD-02** | Thêm mới & Chỉnh sửa sản phẩm cha | Quản trị viên | `/admin/products` | `/api/manager/products` | `POST/PUT/DELETE` |
| **PRD-03** | Quản lý Biến thể cấu hình (Variants) | Quản trị viên | `/admin/products/:id` | `/api/manager/product-variants` | `GET/POST/PUT/DELETE` |
| **PRD-04** | Tải & Cắt ảnh đẩy lên Cloudinary CDN | Quản trị viên | Các Modal ảnh trong Admin | `/api/manager/media/upload` | `POST` |
| **PRD-05** | Phân loại ảnh sản phẩm theo màu sắc | Quản trị viên | `/admin/products/:id` | `/api/manager/product-images` | `GET/POST/PUT/DELETE` |

### 3.2. Mô tả Chi tiết Nghiệp vụ & Kỹ thuật

#### 1. Mô hình Phân cấp Sản phẩm Cha - Biến thể Con (PRD-02 & PRD-03)
- **Sản phẩm Cha (`Products`):** Đại diện cho dòng sản phẩm (ví dụ: *iPhone 16 Pro Max*). Quản lý thông tin chung: danh mục, tên chip Apple Silicon (A18 Pro), huy hiệu (BÁN CHẠY, HÀNG MỚI), mô tả tóm tắt và bài viết đánh giá chi tiết.
- **Biến thể Con (`ProductVariants`):** Đại diện cho cấu hình cụ thể người dùng mua (ví dụ: *Titan Tự Nhiên - 256GB*).
  - Quản lý mã SKU duy nhất, đơn giá bán (`Price`), đơn giá niêm yết cũ (`CompareAtPrice`), giá vốn (`CostPrice`) và số lượng tồn kho khả dụng (`QuantityInStock`).
  - Tích hợp trường `RowVersion` kiểm soát khóa lạc quan (Optimistic Concurrency).

#### 2. Quy trình Xử lý Ảnh Tối ưu với Cloudinary CDN (PRD-04 & PRD-05)
- **Tối ưu hóa phía Client:**
  - Tích hợp công cụ cắt ảnh (`react-easy-crop`) chuẩn tỷ lệ vàng.
  - Tích hợp thư viện nén ảnh trực tiếp trong trình duyệt (`browser-image-compression`) giảm 70-80% dung lượng tệp trước khi gửi lên server.
- **Xử lý phía Backend:** Tiếp nhận file dưới dạng `IFormFile`, đẩy trực tiếp lên Cloudinary CDN bằng `CloudinaryDotNet`, tiếp nhận URL ảnh an toàn (HTTPS) và lưu vào bảng `catalog.ProductImages`.
- **Gắn ảnh theo Màu sắc (`ColorId`):** Mỗi hình ảnh được liên kết với một màu sắc cụ thể của sản phẩm. Khi khách hàng bấm chọn màu trên giao diện Storefront, toàn bộ slide ảnh chính tự động lọc và chuyển sang bộ ảnh tương ứng của màu đó.

---

## 4. Phân hệ Trải nghiệm Mua sắm Khách hàng (Storefront Experience)

### 4.1. Bảng Tổng hợp Màn hình & Tương tác Storefront

| Mã tính năng | Màn hình / Tính năng | Đối tượng áp dụng | URL Giao diện | API Sử dụng |
| :--- | :--- | :--- | :--- | :--- |
| **STF-01** | Trang chủ Apple cao cấp (Hero Banner & Showcase) | Công khai | `/` | `/api/products/showcase`, `/api/categories` |
| **STF-02** | Danh mục & Bộ lọc sản phẩm đa tiêu chí | Công khai | `/products` | `/api/products/cards` |
| **STF-03** | Xem chi tiết sản phẩm toàn diện (Product Detail) | Công khai | `/products/:slug` | `/api/products/{slug}` |
| **STF-04** | Bộ chuyển đổi Biến thể Động (Dynamic Variant Switcher) | Công khai | `/products/:slug` | Xử lý Client State + React Query |
| **STF-05** | Bảng Thông số kỹ thuật phân cấp (Grouped Specs) | Công khai | `/products/:slug` | Thuộc DTO chi tiết sản phẩm |

### 4.2. Mô tả Chi tiết Tương tác Người dùng

#### 1. Bộ chuyển đổi Biến thể Tức thời (STF-04)
- Khi khách hàng truy cập trang chi tiết sản phẩm (ví dụ: `/products/iphone-16-pro-max`):
  - Hệ thống tải toàn bộ danh sách biến thể khả dụng trong một API call duy nhất.
  - Khách hàng bấm chọn mẫu màu (Color Swatches) $\rightarrow$ Bộ sưu tập ảnh tự động chuyển sang ảnh của màu đó; danh sách dung lượng khả dụng của màu đó được làm nổi bật.
  - Khách hàng bấm chọn dung lượng (Storage Buttons) $\rightarrow$ Đơn giá bán, giá so sánh, % tiết kiệm và trạng thái tồn kho (Còn hàng / Tạm hết hàng) cập nhật tức thì trên giao diện mà không cần tải lại trang.

#### 2. Hiển thị Thông số Kỹ thuật Phân cấp (STF-05)
- Thông số kỹ thuật không hiển thị dưới dạng văn bản thô mà được chia thành các nhóm chuyên biệt (Màn hình, Camera sau, Camera trước, Vi xử lý & Đồ họa, Pin & Sạc, Thiết kế & Trọng lượng).
- Giao diện thiết kế dạng Accordion đóng mở mượt mà, hỗ trợ khách hàng tra cứu cấu hình chi tiết chuẩn xác như trên trang chủ Apple.

---

## 5. Phân hệ Giỏ hàng Trực tuyến & Tự phục hồi Tồn kho (Smart Cart)

### 5.1. Bảng Tổng hợp Tính năng Giỏ hàng

| Mã tính năng | Tên tính năng | Đối tượng áp dụng | Giao diện URL | API Endpoint | Phương thức |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **CART-01** | Lấy thông tin giỏ hàng hiện tại | Khách vãng lai & Thành viên | `/cart`, Header Cart | `/api/cart` | `GET` |
| **CART-02** | Thêm sản phẩm biến thể vào giỏ hàng | Khách vãng lai & Thành viên | `/products/:slug` | `/api/cart/items` | `POST` |
| **CART-03** | Cập nhật số lượng mua của từng món | Khách vãng lai & Thành viên | `/cart` | `/api/cart/items/quantity` | `PUT` |
| **CART-04** | Chọn / Bỏ chọn mua hàng (Selective Checkout) | Khách vãng lai & Thành viên | `/cart` | `/api/cart/items/selection` | `PUT` |
| **CART-05** | Đổi phân loại biến thể ngay trong giỏ hàng | Khách vãng lai & Thành viên | `/cart` (Modal Đổi phân loại) | `/api/cart/items/variant` | `PUT` |
| **CART-06** | Xóa sản phẩm khỏi giỏ hàng | Khách vãng lai & Thành viên | `/cart` | `/api/cart/items/{id}` | `DELETE` |
| **CART-07** | Tự động gộp giỏ hàng khách vãng lai khi đăng nhập | Khách vãng lai chuyển thành viên | Kích hoạt tự động khi Login | `/api/cart/merge` | `POST` |
| **CART-08** | Cơ chế Tự phục hồi Số lượng Tồn kho (Self-Healing) | Nền tảng Backend | Kích hoạt khi gọi `/api/cart` | Logic xử lý trong `CartService` |

### 5.2. Mô tả Chi tiết Nghiệp vụ & Cơ chế Tự phục hồi (Self-Healing Cart)

#### 1. Hỗ trợ Song song Khách vãng lai & Thành viên (CART-01 & CART-07)
- **Khách vãng lai:** Hệ thống sinh mã UUID ngẫu nhiên lưu tại `localStorage` với khóa `guest_cart_id`. Mọi thao tác thêm giỏ hàng được liên kết với `sales.Carts.GuestId`.
- **Tự động gộp giỏ hàng (Auto-Merge):** Ngay khi khách vãng lai đăng nhập tài khoản thành viên thành công, frontend tự động kích hoạt API `/api/cart/merge`. Backend tìm toàn bộ mặt hàng trong giỏ khách vãng lai, chuyển sang giỏ thành viên (`UserId`), cộng dồn số lượng nếu trùng biến thể và xóa bỏ giỏ tạm thời.

#### 2. Cơ chế Tự phục hồi Tồn kho (Self-Healing Cart Safeguard - CART-08)
- **Vấn đề thực tế:** Khách hàng thêm 10 chiếc iPhone vào giỏ nhưng nhiều ngày sau mới quay lại mua. Trong thời gian đó, tồn kho thực tế của cửa hàng chỉ còn 2 chiếc.
- **Giải pháp xử lý:** Khi khách truy cập lại giỏ hàng:
  - Backend tự động so sánh `CartItem.Quantity` với `ProductVariant.QuantityInStock`.
  - Nếu phát hiện số lượng trong giỏ vượt quá tồn kho thực tế, hệ thống **tự động ép số lượng về `1`** (hoặc mức tồn khả dụng lớn nhất) và gọi `SaveChangesAsync()` để cập nhật vĩnh viễn vào cơ sở dữ liệu.
  - Frontend hiển thị thông báo màu vàng cảnh báo số lượng đã được điều chỉnh theo tồn kho thực tế và vô hiệu hóa nút tăng số lượng vượt quá tồn kho.
  - Tổng tiền `Subtotal`, `TotalItems`, `SelectedItemsCount` chỉ tính toán dựa trên các mặt hàng khả dụng (`IsAvailable && QuantityInStock > 0`).

#### 3. Đổi phân loại Biến thể trong Giỏ (CART-05)
- Khách hàng có thể nhấn nút "Đổi phân loại" ngay tại dòng sản phẩm trong giỏ hàng.
- Modal mở ra ma trận màu sắc và dung lượng còn hàng. Khi chọn sang cấu hình mới:
  - Nếu cấu hình mới chưa có trong giỏ: cập nhật `ProductVariantId` cho dòng đó.
  - Nếu cấu hình mới đã tồn tại trong giỏ: tự động cộng dồn số lượng vào dòng đã có và xóa dòng cũ, tránh phát sinh 2 dòng trùng lặp cùng một biến thể.

---

## 6. Phân hệ Khuyến mãi Đa đối tượng & Ví Voucher Cá nhân hóa (Vouchers)

### 6.1. Bảng Tổng hợp Tính năng Khuyến mãi

| Mã tính năng | Tên tính năng | Đối tượng áp dụng | Giao diện URL | API Endpoint | Phương thức |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **VOUCH-01** | Lấy danh sách Voucher công khai khả dụng | Khách vãng lai & Thành viên | `/checkout` | `/api/vouchers/available` | `GET` |
| **VOUCH-02** | Xem ví voucher cá nhân của người dùng | Thành viên đăng nhập | `/profile` (Tab Ví Voucher) | `/api/vouchers/my-wallet` | `GET` |
| **VOUCH-03** | Áp dụng & Kiểm tra tính hợp lệ của mã Voucher | Khách vãng lai & Thành viên | `/checkout` | `/api/vouchers/apply` | `POST` |
| **VOUCH-04** | Quản lý Chiến dịch Khuyến mãi (CRUD Voucher) | Quản trị viên | `/admin/vouchers` | `/api/manager/vouchers` | `GET/POST/PUT/DELETE` |
| **VOUCH-05** | Cấp phát Voucher cá nhân hóa cho từng User | Quản trị viên | `/admin/vouchers/assign` | `/api/manager/vouchers/assign` | `POST` |

### 6.2. Mô tả Chi tiết Phân loại & Ràng buộc Nghiệp vụ

#### 1. Hệ thống Phân loại Đối tượng Khuyến mãi (`TargetType`)
Hệ thống hỗ trợ 3 nhóm đối tượng voucher chuyên biệt:
- **`Public` (Công khai):** Hiển thị công khai trên giao diện Checkout cho mọi khách hàng (kể cả khách vãng lai chưa đăng nhập).
- **`RegisteredOnly` (Bắt buộc đăng nhập):** Chỉ tài khoản thành viên đã đăng nhập mới có quyền sử dụng mã.
- **`AssignedOnly` (Cấp phát riêng cá nhân hóa):** Mã không hiển thị công khai, chỉ xuất hiện trong Ví voucher cá nhân của tài khoản được Quản trị viên hoặc hệ thống chủ động cấp tặng (ví dụ: *Voucher sinh nhật, Voucher bồi thường dịch vụ, Voucher tri ân khách VIP*).

#### 2. Ràng buộc Xác thực Zero-Trust tại Backend
Khi khách hàng gửi mã giảm giá tại bước thanh toán:
- Kiểm tra khoảng thời gian hiệu lực (`StartDate <= UtcNow <= EndDate`).
- Kiểm tra giá trị đơn hàng tối thiểu (`Subtotal >= MinOrderAmount`).
- Kiểm tra tổng ngân sách / lượt dùng toàn hệ thống (`UsageCount < UsageLimit`).
- Kiểm tra giới hạn lượt dùng của từng người dùng (`PerUserLimit` hoặc `AssignedUsageLimit` trong bảng `UserVouchers`).
- Tính toán số tiền chiết khấu thực tế: Nếu voucher theo tỷ lệ `%` (`Percentage`), số tiền giảm được chặn trần bởi `MaxDiscountAmount`.

---

## 7. Phân hệ Đặt hàng, Vòng đời Đơn hàng & Tra cứu Bảo mật (Checkout & Lifecycle)

### 7.1. Bảng Tổng hợp Tính năng Đơn hàng

| Mã tính năng | Tên tính năng | Đối tượng áp dụng | Giao diện URL | API Endpoint | Phương thức |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **ORD-01** | Tiến hành Đặt hàng (Checkout) | Khách vãng lai & Thành viên | `/checkout` | `/api/orders/checkout` | `POST` |
| **ORD-02** | Xem danh sách đơn hàng cá nhân phân trang | Thành viên đăng nhập | `/orders` | `/api/orders/my-orders` | `GET` |
| **ORD-03** | Xem chi tiết đơn hàng cá nhân | Thành viên đăng nhập | `/orders` (Modal chi tiết) | `/api/orders/my-orders/{id}` | `GET` |
| **ORD-04** | Hủy đơn hàng an toàn (Chỉ đơn Chưa thanh toán) | Thành viên sở hữu đơn | `/orders` | `/api/orders/my-orders/{id}/cancel` | `POST` |
| **ORD-05** | Chỉnh sửa địa chỉ giao hàng 1 lần duy nhất | Thành viên sở hữu đơn | `/orders` (Modal chi tiết) | `/api/orders/my-orders/{id}/shipping-address` | `PUT` |
| **ORD-06** | Xác nhận đã nhận hàng (Confirm Received) | Thành viên sở hữu đơn | `/orders` | `/api/orders/my-orders/{id}/confirm-received` | `POST` |
| **ORD-07** | Tra cứu đơn hàng bảo mật cho Khách vãng lai | Khách chưa đăng nhập | `/order-lookup` | `/api/orders/lookup` | `POST` |
| **ORD-08** | Gộp đơn hàng vãng lai vào tài khoản thành viên | Thành viên đăng nhập | Banner gộp đơn trên Web | `/api/orders/merge-guest` | `POST` |

### 7.2. Mô tả Chi tiết Nghiệp vụ & Vòng đời Đơn hàng

#### 1. Quy trình Đặt hàng Zero-Trust (ORD-01)
- Khách hàng gửi thông tin giao nhận và danh sách các sản phẩm chọn mua.
- Backend hoàn toàn không tin tưởng đơn giá từ phía client gửi lên:
  - Tự động truy vấn giá bán hiện hành (`UnitPrice`) và giá vốn (`CostPrice`) từ bảng `ProductVariants`.
  - Tính toán lại toàn bộ `Subtotal`, `ShippingFee`, `DiscountAmount` và `TotalAmount`.
  - Đóng băng toàn bộ thông tin tại thời điểm mua vào bảng `sales.OrderItems` (Snapshot bất biến: tên sản phẩm, tên biến thể, SKU, ảnh thumbnail, Dynamic Attributes JSON, đơn giá bán, giá vốn).

#### 2. Vòng đời Trạng thái Đơn hàng (Order Lifecycle)
Chu trình chuyển trạng thái tuần tự của đơn hàng:
- **`Pending` (Chờ xử lý):** Đơn hàng vừa được khởi tạo thành công. Tồn kho đã được trừ ngay lập tức. Khách hàng có quyền chỉnh sửa địa chỉ (tối đa 1 lần) hoặc hủy đơn (nếu chưa thanh toán).
- **`Confirmed` (Đã xác nhận):** Quản trị viên duyệt đơn hàng, chuẩn bị xuất kho.
- **`Processing` (Đang đóng gói):** Bộ phận kho tiến hành đóng kiện thiết bị.
- **`Shipping` (Đang giao hàng):** Đơn hàng được bàn giao cho đối tác vận chuyển.
- **`Delivered` (Đã giao hàng):** Nhân viên giao vận đã phát kiện hàng tới người nhận.
- **`Completed` (Đã nhận hàng):** Khách hàng nhấn xác nhận "Đã nhận hàng" hoặc đơn hàng tự động hoàn tất sau thời hạn quy định. Trạng thái thanh toán của đơn COD tự động chuyển sang `Paid`.
- **`Cancelled` (Đã hủy):** Đơn hàng bị hủy. Hệ thống tự động kích hoạt tiến trình hoàn trả toàn bộ số lượng tồn kho của các biến thể về lại kho hàng và phục hồi voucher.

#### 3. Chỉnh sửa Địa chỉ Giao nhận 1 Lần Duy Nhất (ORD-05)
- Nhằm hỗ trợ khách hàng lỡ nhập sai số nhà hoặc số điện thoại mà không phải hủy đơn đặt lại:
  - Khi đơn hàng đang ở trạng thái `Pending`, thành viên được quyền bấm nút "Đổi địa chỉ nhận hàng".
  - Trường `ShippingAddressUpdateCount` trên bảng `sales.Orders` ghi nhận số lần sửa đổi.
  - Giới hạn: **Tối đa đúng 1 lần duy nhất**. Sau khi cập nhật thành công, nút sửa địa chỉ biến mất và hiển thị badge "Đã cập nhật địa chỉ (1/1 lần)". Nếu cố tình can thiệp API để sửa lần 2, Backend sẽ lập tức từ chối với mã lỗi 400.

#### 4. Bảo mật Toàn diện Trang Tra cứu Đơn hàng (ORD-07)
- **Ẩn nút tra cứu khi đã đăng nhập:** Người dùng đăng nhập quản lý toàn bộ đơn hàng tại `/orders`. Trang `/order-lookup` chỉ phục vụ khách vãng lai chưa có tài khoản.
- **Chỉ cho phép tra cứu đơn khách vãng lai (`UserId == null`):** Ngăn chặn tuyệt đối việc kẻ xấu lợi dụng số điện thoại của người khác để dò xem các đơn hàng của thành viên. Nếu mã đơn thuộc về thành viên, Backend trả về 404 Not Found.
- **Chế độ Chỉ đọc (Read-only):** Không cung cấp nút hủy đơn công khai trên trang tra cứu để chống việc phá hoại hủy bậy đơn hàng của người khác.

---

## 8. Phân hệ Thanh toán Trực tuyến VNPay & Kiểm soát Tương tranh Đa tầng

### 8.1. Bảng Tổng hợp Tính năng Thanh toán VNPay

| Mã tính năng | Tên tính năng | Đối tượng áp dụng | Giao diện URL | API Endpoint | Phương thức |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **PAY-01** | Tạo URL thanh toán VNPay khi Checkout | Khách vãng lai & Thành viên | `/checkout` | `/api/orders/checkout` | `POST` |
| **PAY-02** | Xử lý phản hồi Return URL từ Trình duyệt | Khách hàng chuyển hướng về | `/checkout/success` | Nhận Query Params từ VNPay | `GET` |
| **PAY-03** | Tiếp nhận Webhook IPN từ Server VNPay | Server VNPay gọi ngầm | Nền tảng Backend | `/api/orders/vnpay-ipn` | `GET` |
| **PAY-04** | Thanh toán lại qua VNPay không giới hạn thời gian | Thành viên sở hữu đơn | `/orders` (Nút Thanh toán qua VNPay) | `/api/orders/{id}/repay-vnpay` | `POST` |
| **PAY-05** | Kiểm soát tương tranh đa lớp chống Bán vượt kho | Nền tảng Backend | Mọi giao dịch tạo đơn | Bộ ba Lock 3 lớp | Xử lý ngầm |
| **PAY-06** | Chặn tuyệt đối Hủy đơn khi đã Thanh toán thành công | Nền tảng Backend & Frontend | Mọi giao diện hủy đơn | Logic kiểm tra `PaymentStatus` | Chặn API & UI |

### 8.2. Mô tả Chi tiết Cơ chế Kỹ thuật Phân hệ Thanh toán

#### 1. Cơ chế Kiểm soát Tương tranh Đa Lớp (3-Tier Concurrency Defense - PAY-05)
Bảo đảm tính toàn vẹn tuyệt đối cho kho hàng trong các đợt mở bán cao điểm:
- **Lớp 1: In-Memory Lock với SemaphoreSlim & Lock Ordering:**
  - Sử dụng `ConcurrentDictionary<int, SemaphoreSlim>` quản lý khóa theo từng mã biến thể `ProductVariantId`.
  - **Nguyên tắc Lock Ordering chống Deadlock:** Sắp xếp danh sách biến thể trong đơn hàng theo ID tăng dần (`OrderBy(x => x.VariantId)`) trước khi xin khóa. Cơ chế này loại bỏ hoàn toàn nguy cơ deadlock chéo giữa các đơn hàng mua cùng lúc nhiều sản phẩm.
- **Lớp 2: Giao dịch Cơ sở Dữ liệu Toàn vẹn (ACID Transaction):**
  - Toàn bộ thao tác: Đọc tồn kho $\rightarrow$ Kiểm tra đủ hàng $\rightarrow$ Trừ tồn kho $\rightarrow$ Tạo đơn `Orders` $\rightarrow$ Lưu chi tiết `OrderItems` $\rightarrow$ Xóa giỏ hàng được đóng gói trong một `IDatabaseTransaction` duy nhất. Nếu có lỗi, toàn bộ thao tác tự động Rollback nguyên trạng.
- **Lớp 3: Khóa lạc quan Cơ sở Dữ liệu (`RowVersion`):**
  - Cột `RowVersion` trên bảng `catalog.ProductVariants` phát hiện và ném `DbUpdateConcurrencyException` nếu có bất kỳ tiến trình nào sửa đổi dữ liệu đồng thời.

#### 2. Quy tắc Nghiệp vụ Tồn kho & Chặn Hủy đơn Thanh toán (PAY-06)
- **Trừ kho tức thì:** Ngay khi tạo đơn hàng thành công ở trạng thái `Pending`, số lượng tồn kho được trừ ngay cho dù phương thức là COD hay VNPay. Điều này giúp giữ hàng công bằng cho khách hàng, tránh việc khách hàng đã thanh toán xong qua cổng VNPay nhưng sau đó bị báo hết hàng.
- **Chặn tuyệt đối Hủy đơn khi `PaymentStatus = Paid`:**
  - Khi khách hàng đã thanh toán thành công (qua Return URL hoặc IPN Webhook), trường `PaymentStatus` chuyển sang `Paid`.
  - Backend kiểm tra điều kiện `if (order.PaymentStatus == PaymentStatus.Paid) throw new DomainException(...)`, từ chối 100% mọi yêu cầu hủy đơn qua API.
  - Thuộc tính DTO `CanCancel => Status == "Pending" && PaymentStatus != "Paid"`.
  - Frontend ẩn hoàn toàn nút "Hủy đơn hàng" trên trang "Đơn hàng của tôi" và vô hiệu hóa tùy chọn "Hủy đơn" trên giao diện Admin.

#### 3. Thanh toán lại Linh hoạt Không Giới Hạn Thời Gian (PAY-04)
- Gỡ bỏ hoàn toàn giới hạn 15 phút.
- Khách hàng sở hữu đơn hàng `VNPAY` ở trạng thái `Pending` và chưa thanh toán (`PaymentStatus != Paid`) có thể quay lại mục "Đơn hàng của tôi" bất cứ lúc nào và bấm nút **"Thanh toán qua VNPay"**.
- API `/api/orders/{id}/repay-vnpay` sinh ra URL thanh toán VNPay mới toanh với mã tham chiếu giao dịch độc nhất và mốc thời gian UTC+7 hiện tại, giúp khách hàng thanh toán thành công ngay cả khi đổi thẻ hoặc nạp thêm tiền sau đó.

#### 4. Quy trình Xác thực Kép: Return URL & IPN Webhook (PAY-02 & PAY-03)
- **Mã hóa băm HMAC-SHA512:** Cả 2 kênh đều kiểm tra chữ ký số bí mật bằng `HashSecret`. Nếu tham số trên URL bị kẻ xấu can thiệp sửa đổi, mã băm sẽ không khớp và giao dịch lập tức bị từ chối.
- **Tính Idempotent chống ghi nhận lặp:** Khi máy chủ VNPay gọi IPN Webhook nhiều lần cho cùng một giao dịch, hệ thống kiểm tra trạng thái đơn: nếu đã là `Paid`, hệ thống bỏ qua việc cập nhật và phản hồi ngay mã chuẩn `{"RspCode":"02","Message":"Order already confirmed"}` cho VNPay.

---

## 9. Phân hệ Cổng Quản trị & Vận hành Đơn hàng (Admin Portal)

### 9.1. Bảng Tổng hợp Màn hình Quản trị

| Mã tính năng | Tên màn hình / Chức năng | Phân quyền | URL Giao diện |
| :--- | :--- | :--- | :--- |
| **ADM-01** | Bảng điều khiển tổng quan (Dashboard thống kê) | Quản trị viên | `/admin/dashboard` |
| **ADM-02** | Quản trị Danh mục sản phẩm (Categories) | Quản trị viên | `/admin/categories` |
| **ADM-03** | Quản trị Thuộc tính Cấu hình (Màu sắc & Dung lượng) | Quản trị viên | `/admin/colors`, `/admin/storage-options` |
| **ADM-04** | Quản trị Sản phẩm & Biến thể chuyên sâu | Quản trị viên | `/admin/products` |
| **ADM-05** | Quản trị Đơn hàng & Ngăn kéo Chi tiết (Order Drawer) | Quản trị viên | `/admin/orders` |
| **ADM-06** | Chuyển trạng thái Đơn hàng tuần tự & Ghi chú | Quản trị viên | `/admin/orders` (Modal trạng thái) |
| **ADM-07** | Quản trị Người dùng & Phân quyền vai trò (RBAC) | Quản trị viên cấp cao | `/admin/users`, `/admin/roles` |
| **ADM-08** | Cài đặt hệ thống & Hồ sơ quản trị viên | Quản trị viên | `/admin/settings`, `/admin/profile` |

### 9.2. Mô tả Chi tiết Nghiệp vụ Quản trị Đơn hàng (ADM-05 & ADM-06)
- **Bộ lọc & Tìm kiếm:** Phân trang danh sách đơn hàng, tìm kiếm tức thì theo mã đơn hàng, tên người nhận, số điện thoại hoặc email; lọc theo trạng thái đơn hàng (`Chờ xử lý`, `Đã xác nhận`, `Đang giao`, `Đã giao`, `Đã nhận hàng`, `Đã hủy`) và phương thức thanh toán.
- **Ngăn kéo (Drawer) Chi tiết Đơn hàng:**
  - Hiển thị thông tin người nhận, địa chỉ giao hàng và huy hiệu số lần cập nhật địa chỉ.
  - Hiển thị danh sách snapshot các mặt hàng đã mua kèm hình ảnh, tên biến thể, đơn giá, số lượng và thành tiền.
  - Hiển thị timeline nhật ký tiến trình (`StatusHistoryJson`) ghi nhận từng mốc thời gian, trạng thái chuyển đổi, người thực hiện và lý do/ghi chú.
- **Kiểm soát Chuyển trạng thái Tuần tự:** Quản trị viên chỉ được phép chuyển trạng thái theo quy trình hợp lệ (`Pending` $\rightarrow$ `Confirmed` $\rightarrow$ `Shipping` $\rightarrow$ `Delivered` $\rightarrow$ `Completed`). Không được phép nhảy cóc trạng thái trái quy luật.
- **Vô hiệu hóa Hủy đơn đã Thanh toán:** Khi đơn hàng đã có `PaymentStatus == 'Paid'`, giao diện quản trị tự động vô hiệu hóa lựa chọn "Hủy đơn", kèm chú thích hướng dẫn thực hiện theo quy trình Hoàn tiền (Refund) có biên bản đối soát.

---

## 10. Phân hệ Tự động hóa Hạ tầng, Container Docker & Môi trường Triển khai

### 10.1. Bảng Tổng hợp Tính năng Tự động hóa Hạ tầng

| Mã tính năng | Thành phần / Module | Công nghệ sử dụng | Mục đích & Trách nhiệm kỹ thuật |
| :--- | :--- | :--- | :--- |
| **OPS-01** | Khởi chạy Toàn diện với 1 Lệnh duy nhất | Docker & Docker Compose | Đóng gói toàn bộ 4 dịch vụ (`sqlserver`, `backend`, `frontend`, `ngrok`), cấu hình hoàn chỉnh thông qua file `.env` duy nhất. |
| **OPS-02** | Khởi động Tuần tự có Kiểm tra Sức khỏe | Docker Compose Healthchecks | `backend` chỉ khởi chạy khi `sqlserver` đã sẵn sàng nhận kết nối mạng (port 1433); `frontend` chỉ khởi chạy khi `backend` đã phản hồi HTTP 200 tại endpoint `/api/health`. |
| **OPS-03** | Tự động hóa Migration & Nạp Seed Data An Toàn | ASP.NET Core EF Core Migration | Tự động áp dụng Migration mới nhất khi khởi động; tự động nạp dữ liệu mẫu ban đầu (`data-test.sql`) đúng **1 lần duy nhất** khi tạo DB mới, chống ghi đè dữ liệu đang có. |
| **OPS-04** | Đường hầm Webhook Public cho VNPay Sandbox | Ngrok Container | Tự động lấy Public URL từ container Ngrok để làm cấu hình `PaymentUrl` và `VnpIpnUrl`, cho phép nhận Webhook từ cổng VNPay Sandbox về môi trường phát triển local. |

---

### 10.2. Chi tiết Kiến trúc Đóng gói & Phối hợp 4 Container

| Tên Container | Hình ảnh cơ sở (Base Image) | Cổng lắng nghe (Ports) | Trách nhiệm trong hệ sinh thái Urban Stitch |
| :--- | :--- | :---: | :--- |
| **`apple-store-sqlserver`** | `mcr.microsoft.com/mssql/server:2022-latest` | `14333:1433` | Lưu trữ toàn bộ dữ liệu quan hệ của hệ thống, quản lý 3 schemas độc lập (`catalog`, `sales`, `identity`), đảm bảo các ràng buộc toàn vẹn, giao dịch ACID và khóa lạc quan `rowversion`. |
| **`apple-store-backend`** | Multi-stage: SDK `.NET 8` $\rightarrow$ ASP.NET Runtime | `8088:8080` | Tiếp nhận và xử lý toàn bộ logic Web API, xác thực JWT, kết nối SQL Server, tích hợp thanh toán VNPay, upload ảnh Cloudinary CDN và chuẩn hóa `ApiResponse`. Tích hợp endpoint Healthcheck tại `/api/health`. |
| **`apple-store-frontend`** | Multi-stage: `Node 20 Alpine` $\rightarrow$ `Nginx Alpine` | `3088:80` | Phục vụ mã tĩnh Single Page Application (React 19 + TypeScript). Cấu hình Nginx điều hướng `try_files $uri $uri/ /index.html` hỗ trợ HTML5 History Mode cho React Router, tối ưu nén Gzip và bảo mật HTTP headers. |
| **`apple-store-ngrok`** | `ngrok/ngrok:latest` | `4040:4040` | Mở đường hầm bảo mật (Secure Tunnel) từ Internet tới container `apple-store-backend`, cung cấp tên miền HTTPS công khai cho Webhook IPN của VNPay Sandbox gọi callback về môi trường local mà không cần mở port modem. |

---

### 10.3. Quy trình Tự động hóa Vận hành & Bảo vệ Dữ liệu

| Quy trình | Cơ chế kỹ thuật | Lợi ích thực tiễn |
| :--- | :--- | :--- |
| **Đóng gói Multi-stage Build** | Tách biệt môi trường Build (nặng) và Runtime (nhẹ) cho cả Backend (.NET) và Frontend (Vite + Nginx). | Giảm dung lượng Image từ hàng Gigabyte xuống còn vài chục Megabyte, tối ưu hóa tốc độ tải và giảm thiểu bề mặt tấn công bảo mật. |
| **Kiểm tra Sức khỏe Tuần tự (Healthchecks)** | Docker Compose giám sát trạng thái `service_healthy`. Container sau chỉ khởi động khi container phụ thuộc trước đó đã thực sự sẵn sàng phục vụ. | Triệt tiêu hoàn toàn lỗi crash khi khởi chạy do Backend cố gắng kết nối tới Database khi SQL Server chưa khởi tạo xong. |
| **Nạp Dữ liệu Mẫu An Toàn 1 Lần Duy Nhất** | Kiểm tra cờ bảng dữ liệu trước khi nạp tập lệnh `data-test.sql`. | Đảm bảo khi khởi chạy hệ thống trên máy mới chỉ cần gõ đúng 1 lệnh là có ngay cơ sở dữ liệu mẫu đầy đủ sản phẩm Apple, đồng thời bảo vệ an toàn không ghi đè mất dữ liệu khi khởi động lại các lần tiếp theo. |
| **Quản trị Cấu hình Tập trung qua `.env`** | Toàn bộ chuỗi kết nối, khóa bí mật JWT, API Key Cloudinary, tham số VNPay (`TmnCode`, `HashSecret`) và Ngrok Auth Token được định nghĩa tại file `.env` duy nhất ở thư mục gốc. | Giúp việc triển khai lên máy mới hoặc chuyển đổi giữa các môi trường (Development, Staging, Production) diễn ra tức thì mà không cần sửa đổi bất kỳ dòng mã nguồn nào. |
