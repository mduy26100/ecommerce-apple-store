# Đặc Tả Tính Năng Hệ Thống (System Features Specification)

> **Tài liệu đặc tả toàn diện toàn bộ tính năng của nền tảng thương mại điện tử Urban Stitch (Apple Store Ecosystem).**  
> Đóng vai trò là tài liệu chức năng chuẩn mực (Functional Specification Document - FSD) cho toàn hệ thống, mô tả chi tiết hành vi, đầu vào, đầu ra, quy tắc nghiệp vụ (Business Rules), cơ chế bảo mật Zero-Trust, kiến trúc xử lý tương tranh 3 tầng, quy trình thanh toán có Webhook IPN thật sự kèm khả năng Retry vô hạn, và trung tâm báo cáo thống kê kinh doanh chuyên sâu.

---

## Mục Lục Các Phân Hệ Nghiệp Vụ

1. [Phân hệ 1: Xác thực, Định danh & Phân quyền (Identity & RBAC)](#1-phân-hệ-xác-thực-định-danh--phân-quyền-identity--rbac)
2. [Phân hệ 2: Danh mục, Thuộc tính Động & Cấu hình Kỹ thuật (Catalog & Specs)](#2-phân-hệ-danh-mục-thuộc-tính-động--cấu-hình-kỹ-thuật-catalog--specs)
3. [Phân hệ 3: Quản lý Sản phẩm, Biến thể & Xử lý Ảnh Cloudinary CDN](#3-phân-hệ-quản-lý-sản-phẩm-biến-thể--xử-lý-ảnh-cloudinary-cdn)
4. [Phân hệ 4: Trải nghiệm Mua sắm Khách hàng (Storefront Experience)](#4-phân-hệ-trải-nghiệm-mua-sắm-khách-hàng-storefront-experience)
5. [Phân hệ 5: Giỏ hàng Trực tuyến & Tự phục hồi Tồn kho (Smart Cart)](#5-phân-hệ-giỏ-hàng-trực-tuyến--tự-phục-hồi-tồn-kho-smart-cart)
6. [Phân hệ 6: Khuyến mãi Đa đối tượng & Ví Voucher Cá nhân hóa (Vouchers)](#6-phân-hệ-khuyến-mãi-đa-đối-tượng--ví-voucher-cá-nhân-hóa-vouchers)
7. [Phân hệ 7: Đặt hàng, Vòng đời Đơn hàng & Tra cứu Bảo mật (Checkout & Lifecycle)](#7-phân-hệ-đặt-hàng-vòng-đời-đơn-hàng--tra-cứu-bảo-mật-checkout--lifecycle)
8. [Phân hệ 8: Thanh toán Trực tuyến VNPay, Webhook IPN Thực & Khả năng Retry Thanh toán Vô hạn](#8-phân-hệ-thanh-toán-trực-tuyến-vnpay-webhook-ipn-thực--khả-năng-retry-thanh-toán-vô-hạn)
9. [Phân hệ 9: Cổng Quản trị Vận hành & Quản lý Người dùng (Admin Portal)](#9-phân-hệ-cổng-quản-trị-vận-hành--quản-lý-người-dùng-admin-portal)
10. [Phân hệ 10: Động cơ Báo cáo Thống kê & Xuất Excel Doanh nghiệp (Business Intelligence)](#10-phân-hệ-động-cơ-báo-cáo-thống-kê--xuất-excel-doanh-nghiệp-business-intelligence)
11. [Phân hệ 11: Tự động hóa Hạ tầng & Container Docker Tuần tự (Docker Orchestration)](#11-phân-hệ-tự-động-hóa-hạ-tầng--container-docker-tuần-tự-docker-orchestration)

---

## 1. Phân hệ Xác thực, Định danh & Phân quyền (Identity & RBAC)

### 1.1. Bảng Tổng hợp Tính năng Xác thực

| Mã tính năng | Tên tính năng | Đối tượng áp dụng | Giao diện URL | API Endpoint | Phương thức HTTP |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **AUTH-01** | Đăng ký tài khoản khách hàng | Khách vãng lai | `/register` | `/api/auth/register` | `POST` |
| **AUTH-02** | Đăng nhập hệ thống (Storefront & Admin) | Toàn bộ người dùng | `/login`, `/admin/auth/login` | `/api/auth/login` | `POST` |
| **AUTH-03** | Làm mới Access Token ngầm (Silent Refresh) | Người dùng đã đăng nhập | Nền tảng (Axios Interceptor) | `/api/auth/refresh-token` | `POST` |
| **AUTH-04** | Xem thông tin hồ sơ cá nhân | Người dùng đăng nhập | `/profile`, `/admin/profile` | `/api/auth/profile` | `GET` |
| **AUTH-05** | Đổi mật khẩu tài khoản | Người dùng đăng nhập | `/profile` | `/api/auth/change-password` | `POST` |
| **AUTH-06** | Đăng xuất & Thu hồi phiên làm việc | Người dùng đăng nhập | Header Actions | `/api/auth/revoke-token` | `POST` |

### 1.2. Mô tả Chi tiết Nghiệp vụ & Ràng buộc Bảo mật

1. **Cơ chế Xác thực Kép Token Bảo Vệ Zero-Trust (AUTH-02 & AUTH-03):**
   - **Access Token:** Định dạng JWT có thời gian sống ngắn (15-60 phút), được lưu trữ hoàn toàn trong bộ nhớ RAM của ứng dụng React (Zustand store). **Tuyệt đối không lưu Access Token trong `localStorage` hay `sessionStorage`** để loại bỏ 100% rủi ro bị đánh cắp qua lỗ hổng Cross-Site Scripting (XSS).
   - **Refresh Token:** Chuỗi ký tự ngẫu nhiên 256-bit được băm và lưu trong bảng `identity.RefreshTokens`. Khi phản hồi đăng nhập, Refresh Token được đóng gói trong **HTTP-Only, Secure, SameSite=Strict Cookie**, ngăn chặn hoàn toàn việc mã độc JavaScript truy cập từ xa.
   - **Silent Refresh Token:** Khi Access Token hết hạn, Axios Interceptor tự động phát hiện mã phản hồi 401, tạm dừng các request đang chờ, gửi lệnh ngầm tới `/api/auth/refresh-token` để đổi lấy Access Token mới rồi tiếp tục thực thi các request dở dang mà người dùng không hề bị gián đoạn thao tác.
2. **Phân quyền Theo Vai trò (Role-Based Access Control - RBAC):**
   - Phân cấp nghiêm ngặt giữa `SuperAdmin` (Toàn quyền quản trị cổng Admin) và `User` (Khách hàng mua sắm).
   - Bảo vệ tuyến đường kép (Dual Route Guards): Cả Frontend React Router lẫn Backend Authorization Middleware đều kiểm tra quyền hạn. Nếu tài khoản `User` cố tình truy cập các đường dẫn `/admin/*`, hệ thống lập tức từ chối và chuyển hướng về trang chủ Storefront.

---

## 2. Phân hệ Danh mục, Thuộc tính Động & Cấu hình Kỹ thuật (Catalog & Specs)

### 2.1. Bảng Tổng hợp Tính năng Danh mục & Thuộc tính

| Mã tính năng | Tên tính năng | Đối tượng áp dụng | Giao diện URL | API Endpoint | Phương thức HTTP |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **CAT-01** | Lấy danh sách danh mục khả dụng | Công khai | Navigation Bar | `/api/categories` | `GET` |
| **CAT-02** | Quản lý Danh mục (CRUD, Slug, Thứ tự) | Quản trị viên | `/admin/categories` | `/api/manager/categories` | `GET/POST/PUT/DELETE` |
| **CAT-03** | Quản lý Bảng màu thương mại Apple | Quản trị viên | `/admin/colors` | `/api/manager/colors` | `GET/POST/PUT/DELETE` |
| **CAT-04** | Quản lý Dung lượng bộ nhớ lưu trữ | Quản trị viên | `/admin/storage-options` | `/api/manager/storage-options` | `GET/POST/PUT/DELETE` |
| **CAT-05** | Quản lý Ma trận Tùy chọn Động (Hybrid EAV) | Quản trị viên | `/admin/products/:id?tab=options` | `/api/manager/product-options` | `GET/POST/PUT/DELETE` |
| **CAT-06** | Quản lý Nhóm thông số kỹ thuật phân cấp | Quản trị viên | `/admin/products/:id?tab=specs` | `/api/manager/spec-groups` | `GET/POST/PUT/DELETE` |

### 2.2. Mô tả Chi tiết Nghiệp vụ Thuộc Tính Đa Năng

1. **Chuẩn hóa Thuộc tính Cố định Tối ưu Tốc độ (CAT-03 & CAT-04):**
   - **Bảng màu Apple (`Colors`):** Lưu trữ tên thương mại chuẩn mực (ví dụ: *Titan Sa Mạc, Titan Tự Nhiên, Titan Đen, Titan Trắng, Midnight, Starlight, Jet Black*) kèm mã màu HEX (`#C4A482`, `#9E9A95`, `#0A0A0A`). Frontend sử dụng mã HEX này để kết xuất ngay các nút swatch màu trực quan.
   - **Dung lượng lưu trữ (`StorageOptions`):** Lưu trữ tên nhãn hiển thị (`128GB`, `256GB`, `512GB`, `1TB`, `2TB`) cùng trường số học `CapacityValue` (`128`, `256`, `512`, `1024`, `2048`). Cho phép Backend sắp xếp danh sách dung lượng theo đúng trật tự dung lượng tăng dần bằng toán tử số học, không bị lỗi sắp xếp chuỗi ký tự (tránh lỗi `1TB` đứng trước `256GB`).
2. **Ma trận Thuộc tính Động Hybrid EAV Đa năng (CAT-05):**
   - Hỗ trợ mọi cấu hình sản phẩm phức tạp của Apple:
     - MacBook: Tùy biến RAM Unified (16GB, 24GB, 36GB, 48GB, 64GB, 128GB).
     - iPad: Tùy biến Kết nối (Wi-Fi tiêu chuẩn vs Wi-Fi + 5G Cellular), Tùy biến Mặt kính (Kính tiêu chuẩn vs Kính phủ cấu trúc Nano-texture).
     - Apple Watch: Tùy biến Kích thước mặt (42mm, 46mm, 49mm Ultra), Chất liệu vỏ (Nhôm vs Titanium).
   - Biến thể thương mại thực tế (`ProductVariants`) liên kết với các giá trị tùy chọn qua bảng nối `ProductVariantValues`. **Cho phép cửa hàng mở rộng ngành hàng mới trong tương lai mà không phải can thiệp sửa đổi cấu trúc bảng cơ sở dữ liệu**.
3. **Nhóm Thông Số Kỹ Thuật Đa Tầng (CAT-06):**
   - Phân cấp thông số thành 2 tầng rõ rệt: Tầng nhóm (`ProductSpecificationGroups`) đại diện cho các chủ đề (*Hiệu năng & Vi xử lý*, *Màn hình & Hiển thị*, *Camera & Quay phim*, *Pin & Sạc*, *Tiện ích & Kết nối*); Tầng chi tiết (`ProductSpecifications`) chứa cặp tiêu chí - giá trị thực tế kèm đơn vị đo lường (ví dụ: *Độ sáng đỉnh: 3000 nits*, *Chuẩn kháng bụi nước: IP68*).

---

## 3. Phân hệ Quản lý Sản phẩm, Biến thể & Xử lý Ảnh Cloudinary CDN

### 3.1. Bảng Tổng hợp Tính năng Sản phẩm & Media

| Mã tính năng | Tên tính năng | Đối tượng áp dụng | Giao diện URL | API Endpoint | Phương thức HTTP |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **PRD-01** | Xem danh sách sản phẩm phân trang & bộ lọc | Quản trị viên | `/admin/products` | `/api/manager/products` | `GET` |
| **PRD-02** | Thêm mới & Chỉnh sửa sản phẩm cha | Quản trị viên | `/admin/products/:id?tab=general` | `/api/manager/products` | `POST/PUT/DELETE` |
| **PRD-03** | Quản lý Biến thể kho (Variants & Stock) | Quản trị viên | `/admin/products/:id?tab=variants` | `/api/manager/product-variants` | `GET/POST/PUT/DELETE` |
| **PRD-04** | Tải & Cắt ảnh đẩy lên Cloudinary CDN | Quản trị viên | Các Modal ảnh trong Admin | `/api/manager/media/upload` | `POST` |
| **PRD-05** | Quản lý thư viện ảnh đồng bộ theo màu sắc | Quản trị viên | `/admin/products/:id?tab=images` | `/api/manager/product-images` | `GET/POST/PUT/DELETE` |

### 3.2. Mô tả Chi tiết Nghiệp vụ

1. **Kiến trúc Quản lý Sản phẩm Toàn Trang (Dedicated Product Page):**
   - Thay vì nhồi nhét vào các Drawer hay Modal chật hẹp, hệ thống nâng cấp giao diện quản lý chi tiết sản phẩm thành một trang riêng biệt `/admin/products/:id` với 5 tab chức năng độc lập:
     - **Tab 1 - Thông tin chung (`general`):** Tên dòng máy, slug, danh mục, thời gian bảo hành, mô tả tóm tắt và bài viết chi tiết.
     - **Tab 2 - Biến thể & Tồn kho (`variants`):** Bảng danh sách cấu hình, SKU, giá bán, giá niêm yết, tồn kho và giá vốn.
     - **Tab 3 - Hình ảnh theo màu (`images`):** Quản lý bộ sưu tập ảnh liên kết chặt chẽ với từng màu sắc, gắn cờ ảnh chính (`IsPrimary`).
     - **Tab 4 - Tùy chọn cấu hình (`options`):** Ma trận thuộc tính động mở rộng.
     - **Tab 5 - Thông số kỹ thuật (`specs`):** Nhóm thông số và tiêu chuẩn kỹ thuật phân cấp.
2. **Quy tắc Kiểm soát Biến thể Duy nhất (Conflict Prevention):**
   - Mỗi tổ hợp cấu hình (Màu sắc + Dung lượng + Thuộc tính động) chỉ được phép tồn tại duy nhất một biến thể tương ứng cho mỗi dòng máy.
   - Nếu quản trị viên cố tình tạo trùng tổ hợp đã có, Backend từ chối với mã lỗi `409 Conflict` kèm thông báo giải thích rõ ràng.
3. **Tải & Xử lý Ảnh Tự động lên Cloudinary CDN (PRD-04):**
   - Tích hợp công cụ cắt ảnh tỷ lệ chuẩn (`image-cropper`) và nén ảnh phía client trước khi gửi lên máy chủ.
   - Backend tiếp nhận file stream và đẩy trực tiếp lên Cloudinary CDN, nhận về URL ảnh bảo mật tối ưu hóa tự động theo định dạng WebP/AVIF.
   - Cơ chế Fallback an toàn: Toàn bộ bảng `ProductImages` chấp nhận giá trị `NULL`. Khi đường dẫn ảnh là `NULL` hoặc gặp sự cố tải, Frontend tự động hiển thị biểu tượng Apple Logo `<AppleLogo />` cao cấp, tuyệt đối không văng lỗi màn hình trắng.

---

## 4. Phân hệ Trải nghiệm Mua sắm Khách hàng (Storefront Experience)

### 4.1. Bảng Tổng hợp Tính năng Mua sắm

| Mã tính năng | Tên tính năng | Đối tượng áp dụng | Giao diện URL | API Endpoint | Phương thức HTTP |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **ST-01** | Trang chủ Banner Hero & Cam kết Apple | Công khai | `/` | `/api/products/showcase` | `GET` |
| **ST-02** | Danh mục sản phẩm & Lọc đa tiêu chí | Công khai | `/products` | `/api/products/cards` | `GET` |
| **ST-03** | Tìm kiếm nhanh Realtime trên Header | Công khai | Header Component | `/api/products/search` | `GET` |
| **ST-04** | Trang chi tiết sản phẩm toàn diện | Công khai | `/products/:slug` | `/api/products/{slug}` | `GET` |
| **ST-05** | Bộ chuyển đổi Biến thể & Đồng bộ Ảnh tức thì | Công khai | `/products/:slug` | Xử lý nội bộ React State | Tức thì |

### 4.2. Mô tả Chi tiết Nghiệp vụ

1. **Tìm kiếm Realtime Header Phân Tách Thiết Bị (ST-03):**
   - Tự động kích hoạt khi người dùng gõ từ 3 ký tự trở lên (`useProductSearch`), áp dụng cơ chế Debounce 300ms chống spam request.
   - Specification Pattern `ProductQuickSearchSpec` tại Backend thực hiện tìm kiếm đa trường: Tên sản phẩm, Slug, ModelCode, Danh mục và Mô tả ngắn.
   - **Giao diện Desktop:** Mở rộng thanh tìm kiếm toàn bộ chiều ngang thanh Header (`max-w-4xl`), ẩn thanh category bar, tự động đóng khi click ra ngoài hoặc bấm phím `Escape`.
   - **Giao diện Di động (Mobile Fullscreen Portal):** Sử dụng React Portal kết xuất giao diện tìm kiếm thẳng vào `document.body` dưới dạng Fullscreen Overlay, giải phóng hoàn toàn khỏi giới hạn chiều cao của header có hiệu ứng `backdrop-blur`.
2. **Bộ Chuyển Đổi Biến Thể & Đồng Bộ Thư Viện Ảnh (ST-05):**
   - Người dùng bấm chọn các nút swatch màu sắc và nút dung lượng trên trang chi tiết sản phẩm.
   - Hệ thống tự động tính toán và đối chiếu với ma trận biến thể:
     - Giá bán thực tế và giá niêm yết cũ cập nhật tức thì.
     - Huy hiệu tồn kho thời gian thực thay đổi: *Còn hàng* (kèm số lượng cụ thể), *Sắp hết hàng* (< 10 sản phẩm) hoặc *Tạm hết hàng* (khóa nút Mua ngay và Thêm vào giỏ).
     - Bộ sưu tập ảnh chính và carousel ảnh nhỏ tự động chuyển sang tập ảnh tương ứng với màu sắc vừa chọn.

---

## 5. Phân hệ Giỏ hàng Trực tuyến & Tự phục hồi Tồn kho (Smart Cart)

### 5.1. Bảng Tổng hợp Tính năng Giỏ hàng

| Mã tính năng | Tên tính năng | Đối tượng áp dụng | Giao diện URL | API Endpoint | Phương thức HTTP |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **CART-01** | Lấy dữ liệu giỏ hàng (Khách & Thành viên) | Toàn bộ khách hàng | `/cart`, Header Cart Drawer | `/api/cart` | `GET` |
| **CART-02** | Thêm sản phẩm biến thể vào giỏ hàng | Toàn bộ khách hàng | `/products/:slug`, `/cart` | `/api/cart/items` | `POST` |
| **CART-03** | Cập nhật số lượng mặt hàng trong giỏ | Toàn bộ khách hàng | `/cart` | `/api/cart/items/quantity` | `PUT` |
| **CART-04** | Đổi cấu hình biến thể trực tiếp trong giỏ | Toàn bộ khách hàng | `/cart` (`ChangeVariantModal`) | `/api/cart/items/variant` | `PUT` |
| **CART-05** | Tích chọn mặt hàng thanh toán (Selective) | Toàn bộ khách hàng | `/cart` | `/api/cart/items/selection` | `PUT` |
| **CART-06** | Xóa mặt hàng hoặc làm trống toàn bộ giỏ | Toàn bộ khách hàng | `/cart` | `/api/cart/items/{id}`, `/api/cart` | `DELETE` |
| **CART-07** | Tự động gộp giỏ hàng khách khi đăng nhập | Khách vừa đăng nhập | Hệ thống kích hoạt ngầm | `/api/cart/merge` | `POST` |

### 5.2. Mô tả Chi tiết Cơ chế Tự Phục Hồi Tồn Kho (Self-Healing Cart)

1. **Cơ chế Tự Phục Hồi Tồn Kho (Self-Healing Cart):**
   - Nếu một khách hàng để sản phẩm trong giỏ hàng qua đêm và số lượng tồn kho trong kho bị khách khác mua bớt:
   - Khi khách mở lại giỏ hàng, API `/api/cart` tự động phát hiện số lượng tồn kho khả dụng hiện tại nhỏ hơn số lượng trong giỏ.
   - Backend tự động điều chỉnh số lượng mặt hàng đó về bằng với tồn kho tối đa (hoặc về `1`), tính lại tổng tiền giỏ hàng và lưu ngay xuống Database.
   - Frontend hiển thị cảnh báo tồn kho và khóa nút tăng số lượng vượt quá tồn kho thực tế.
2. **Đổi Cấu Hình Biến Thể Ngay Trong Giỏ (`ChangeVariantModal`):**
   - Khách hàng không cần phải xóa sản phẩm ra khỏi giỏ rồi quay lại trang chi tiết để chọn lại màu hoặc dung lượng.
   - Chỉ cần nhấn nút "Đổi phân loại", modal hiển thị các tùy chọn màu và dung lượng còn hàng. Nếu phiên bản mới đã có trong giỏ hàng, hệ thống tự động cộng dồn số lượng thông minh.
3. **Tự Động Gộp Giỏ Hàng (Guest Cart Auto-Merge):**
   - Khi một khách hàng chưa đăng nhập duyệt web và thêm hàng vào giỏ (gắn với `GuestId` lưu trong trình duyệt), sau đó bấm Đăng nhập:
   - Hệ thống tự động phát hiện giỏ khách vãng lai, chuyển toàn bộ mặt hàng sang giỏ hàng chính thức của tài khoản thành viên (`UserId`), làm sạch giỏ tạm và bảo toàn trải nghiệm mua sắm liền mạch.

---

## 6. Phân hệ Khuyến mãi Đa đối tượng & Ví Voucher Cá nhân hóa (Vouchers)

### 6.1. Bảng Tổng hợp Tính năng Khuyến mãi

| Mã tính năng | Tên tính năng | Đối tượng áp dụng | Giao diện URL | API Endpoint | Phương thức HTTP |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **VOUCH-01** | Lấy danh sách voucher công khai khả dụng | Khách vãng lai & Thành viên | `/checkout` | `/api/vouchers/available` | `GET` |
| **VOUCH-02** | Xem ví voucher cá nhân của người dùng | Thành viên đăng nhập | `/profile` (Tab Ví voucher) | `/api/vouchers/my-wallet` | `GET` |
| **VOUCH-03** | Áp dụng & Kiểm tra tính hợp lệ của mã Voucher | Khách vãng lai & Thành viên | `/checkout` | `/api/vouchers/apply` | `POST` |
| **VOUCH-04** | Quản lý Chiến dịch Khuyến mãi (CRUD) | Quản trị viên | `/admin/vouchers` | `/api/manager/vouchers` | `GET/POST/PUT/DELETE` |
| **VOUCH-05** | Cấp phát Voucher cá nhân hóa cho từng User | Quản trị viên | `/admin/vouchers/assign` | `/api/manager/vouchers/assign` | `POST` |

### 6.2. Mô tả Chi tiết Phân loại & Ràng buộc Nghiệp vụ

1. **Phân loại 3 Nhóm Đối tượng Khuyến mãi (`TargetType`):**
   - **`Public` (Công khai):** Hiển thị công khai trên giao diện Checkout cho mọi khách hàng (kể cả khách vãng lai chưa đăng nhập).
   - **`RegisteredOnly` (Bắt buộc đăng nhập):** Chỉ tài khoản thành viên đã đăng nhập mới có quyền sử dụng mã.
   - **`AssignedOnly` (Cấp phát riêng cá nhân hóa):** Mã không hiển thị công khai, chỉ xuất hiện trong Ví voucher cá nhân của tài khoản được Quản trị viên hoặc hệ thống chủ động cấp tặng (ví dụ: *Voucher sinh nhật, Voucher bồi thường dịch vụ, Voucher tri ân khách VIP*).
2. **Kiểm tra Zero-Trust tại Backend khi Áp dụng Voucher:**
   - Kiểm tra khoảng thời gian hiệu lực (`StartDate <= UtcNow <= EndDate`).
   - Kiểm tra giá trị đơn hàng tối thiểu (`Subtotal >= MinOrderAmount`).
   - Kiểm tra tổng ngân sách / lượt dùng toàn hệ thống (`UsageCount < UsageLimit`).
   - Kiểm tra giới hạn lượt dùng của từng người dùng (`PerUserLimit` hoặc `AssignedUsageLimit` trong bảng `UserVouchers`).
   - Tính toán số tiền chiết khấu thực tế: Nếu voucher theo tỷ lệ `%` (`Percentage`), số tiền giảm được chặn trần bởi `MaxDiscountAmount`.

---

## 7. Phân hệ Đặt hàng, Vòng đời Đơn hàng & Tra cứu Bảo mật (Checkout & Lifecycle)

### 7.1. Bảng Tổng hợp Tính năng Đơn hàng

| Mã tính năng | Tên tính năng | Đối tượng áp dụng | Giao diện URL | API Endpoint | Phương thức HTTP |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **ORD-01** | Tiến hành Đặt hàng (Checkout) | Khách vãng lai & Thành viên | `/checkout` | `/api/orders/checkout` | `POST` |
| **ORD-02** | Xem danh sách đơn hàng cá nhân phân trang | Thành viên đăng nhập | `/orders` | `/api/orders/my-orders` | `GET` |
| **ORD-03** | Xem chi tiết đơn hàng cá nhân | Thành viên đăng nhập | `/orders` (Drawer chi tiết) | `/api/orders/my-orders/{id}` | `GET` |
| **ORD-04** | Hủy đơn hàng an toàn (Chỉ đơn Chưa thanh toán) | Thành viên sở hữu đơn | `/orders` | `/api/orders/my-orders/{id}/cancel` | `POST` |
| **ORD-05** | Chỉnh sửa địa chỉ giao hàng 1 lần duy nhất | Thành viên sở hữu đơn | `/orders` (Modal địa chỉ) | `/api/orders/my-orders/{id}/shipping-address` | `PUT` |
| **ORD-06** | Xác nhận đã nhận hàng (Confirm Received) | Thành viên sở hữu đơn | `/orders` | `/api/orders/my-orders/{id}/confirm-received` | `POST` |
| **ORD-07** | Tra cứu đơn hàng bảo mật cho Khách vãng lai | Khách chưa đăng nhập | `/order-lookup` | `/api/orders/lookup` | `POST` |
| **ORD-08** | Gộp đơn hàng vãng lai vào tài khoản thành viên | Thành viên đăng nhập | Banner gộp đơn trên Web | `/api/orders/merge-guest` | `POST` |

### 7.2. Mô tả Chi tiết Nghiệp vụ & Vòng đời Đơn hàng

1. **Quy trình Đặt hàng Zero-Trust (ORD-01):**
   - Khách hàng gửi thông tin giao nhận và danh sách các sản phẩm chọn mua.
   - Backend hoàn toàn không tin tưởng đơn giá từ phía client gửi lên:
     - Tự động truy vấn giá bán hiện hành (`UnitPrice`) và giá vốn (`CostPrice`) từ bảng `ProductVariants`.
     - Tính toán lại toàn bộ `Subtotal`, `ShippingFee`, `DiscountAmount` và `TotalAmount`.
     - Đóng băng toàn bộ thông tin tại thời điểm mua vào bảng `sales.OrderItems` (Snapshot bất biến: tên sản phẩm, tên biến thể, SKU, ảnh thumbnail, Dynamic Attributes JSON, đơn giá bán, giá vốn).
2. **Vòng đời 6 Trạng thái Đơn hàng (Order Lifecycle):**
   - **`Pending` (Chờ xử lý):** Đơn hàng vừa được khởi tạo thành công. Tồn kho đã được trừ ngay lập tức. Khách hàng có quyền chỉnh sửa địa chỉ (tối đa 1 lần) hoặc hủy đơn (nếu chưa thanh toán).
   - **`Confirmed` (Đã xác nhận):** Quản trị viên duyệt đơn hàng, chuẩn bị xuất kho.
   - **`Shipping` (Đang giao hàng):** Đơn hàng được bàn giao cho đối tác vận chuyển hỏa tốc.
   - **`Delivered` (Đã giao hàng):** Nhân viên giao vận đã phát kiện hàng nguyên seal tới người nhận.
   - **`Completed` (Hoàn tất đơn hàng):** Khách hàng nhấn xác nhận "Đã nhận hàng" hoặc đơn hàng tự động hoàn tất sau thời hạn quy định. Trạng thái thanh toán của đơn COD tự động chuyển sang `Paid`.
   - **`Cancelled` (Đã hủy):** Đơn hàng bị hủy. Hệ thống tự động kích hoạt tiến trình hoàn trả toàn bộ số lượng tồn kho của các biến thể về lại kho hàng và phục hồi voucher.
3. **Chỉnh sửa Địa chỉ Giao nhận 1 Lần Duy Nhất (ORD-05):**
   - Khi đơn hàng đang ở trạng thái `Pending`, thành viên được quyền bấm nút "Đổi địa chỉ nhận hàng".
   - Trường `ShippingAddressUpdateCount` trên bảng `sales.Orders` ghi nhận số lần sửa đổi.
   - **Khóa cứng tối đa đúng 1 lần duy nhất**: Sau khi cập nhật thành công, nút sửa địa chỉ biến mất và hiển thị badge "Đã cập nhật địa chỉ (1/1 lần)". Nếu can thiệp API để sửa lần 2, Backend lập tức từ chối với mã lỗi 400.
4. **Bảo Mật Tuyệt Đối Trang Tra Cứu Đơn Hàng (ORD-07):**
   - **Ẩn nút tra cứu khi đã đăng nhập:** Người dùng đăng nhập quản lý toàn bộ đơn hàng tại `/orders`. Trang `/order-lookup` chỉ phục vụ khách vãng lai chưa có tài khoản.
   - **Chỉ cho phép tra cứu đơn khách vãng lai (`UserId == null`):** Ngăn chặn tuyệt đối việc kẻ xấu lợi dụng số điện thoại của người khác để dò xem các đơn hàng của thành viên. Nếu mã đơn thuộc về thành viên, Backend trả về 404 Not Found.
   - **Chế độ Chỉ đọc (Read-only):** Không cung cấp nút hủy đơn công khai trên trang tra cứu để chống việc phá hoại hủy bậy đơn hàng của người khác.

---

## 8. Phân hệ Thanh toán Trực tuyến VNPay, Webhook IPN Thực & Khả năng Retry Thanh toán Vô hạn

### 8.1. Bảng Tổng hợp Tính năng Thanh toán VNPay

| Mã tính năng | Tên tính năng | Đối tượng áp dụng | Giao diện URL | API Endpoint | Phương thức HTTP |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **PAY-01** | Tạo URL thanh toán VNPay khi Checkout | Khách vãng lai & Thành viên | `/checkout` | `/api/orders/checkout` | `POST` |
| **PAY-02** | Xử lý phản hồi Return URL từ Trình duyệt | Khách hàng chuyển hướng về | `/payment/vnpay-return` | Nhận Query Params từ VNPay | `GET` |
| **PAY-03** | Tiếp nhận Webhook IPN ngầm từ Server VNPay | Server VNPay gọi ngầm | Nền tảng Backend | `/api/payment/vnpay-return` | `GET` |
| **PAY-04** | Thanh toán lại qua VNPay không giới hạn thời gian | Thành viên sở hữu đơn | `/orders` (Nút Thanh toán qua VNPay) | `/api/orders/{id}/repay-vnpay` | `POST` |
| **PAY-05** | Kiểm soát tương tranh đa tầng chống bán vượt kho | Toàn bộ giao dịch tạo đơn | Nền tảng Backend | Bộ ba Lock 3 lớp | Xử lý ngầm |
| **PAY-06** | Chặn tuyệt đối Hủy đơn khi đã Thanh toán thành công | Toàn bộ giao diện hủy đơn | Backend & Frontend | Logic kiểm tra `PaymentStatus` | Chặn API & UI |

### 8.2. Mô tả Chi tiết Cơ chế Kỹ thuật Phân hệ Thanh toán

1. **Khác Biệt Quyết Định: Webhook IPN Thực vs Báo Thanh Toán Ảo:**
   - Không bao giờ cập nhật trạng thái đơn hàng chỉ dựa trên hành động bấm nút của người dùng hay việc chuyển hướng URL trình duyệt thông thường.
   - **Chỉ khi nhận được phản hồi chính thức từ VNPay qua kênh Webhook IPN kèm mã `vnp_ResponseCode == "00"` và chữ ký số HMAC-SHA512 khớp 100%**, đơn hàng mới được chuyển trạng thái thanh toán sang `Paid` và trạng thái đơn sang `Confirmed`.
   - Nếu khách hàng đóng trình duyệt, mất mạng hoặc hủy ngang tại cổng VNPay: Đơn hàng vẫn giữ nguyên trạng thái `Pending` và `PaymentStatus = Pending`.
2. **Khả Năng Retry Thanh Toán Vô Hạn (PAY-04):**
   - Loại bỏ hoàn toàn sự ức chế khi thanh toán thất bại: Khách hàng chỉ cần truy cập vào mục "Đơn hàng của tôi" (`/orders`), tìm đơn hàng VNPay đang ở trạng thái `Pending`, bấm nút **"Thanh toán qua VNPay"**.
   - Hệ thống sinh ngay URL thanh toán mới với mã giao dịch độc nhất và thời gian thực hiện tại. Khách hàng nạp tiền vào thẻ xong là có thể thanh toán tiếp ngay, không phải tạo lại đơn hàng, không lo bị mất voucher hay mất cấu hình máy đã chọn.
3. **Chặn Tuyệt Đối Hủy Đơn Sau Khi Đã Thanh Toán Thành Công (PAY-06):**
   - Khi đơn hàng có `PaymentStatus == Paid`, Backend ném ngoại lệ cấm hủy đơn: `throw new DomainException("Đơn hàng đã được thanh toán trực tuyến thành công, không thể hủy bỏ.")`.
   - Frontend ẩn hoàn toàn nút "Hủy đơn hàng" trên trang chi tiết đơn và vô hiệu hóa nút hủy đơn trên Admin Portal.
4. **Cơ Chế Kiểm Soát Tương Tranh Đa Lớp (3-Tier Concurrency Defense - PAY-05):**
   - **Tầng 1 (In-Memory Lock với SemaphoreSlim):** Cấp phát khóa độc quyền theo `VariantId`. Bắt buộc sắp xếp danh sách mã biến thể theo thứ tự tăng dần (`OrderBy(x => x.VariantId)`) trước khi xin khóa để triệt tiêu hoàn toàn nguy cơ Deadlock chéo giữa các luồng.
   - **Tầng 2 (ACID Database Transaction):** Đóng gói toàn bộ thao tác kiểm tra tồn kho, trừ tồn kho, tạo đơn hàng và xóa giỏ hàng trong một `IDatabaseTransaction`. Bất kỳ lỗi nào phát sinh đều kích hoạt `ROLLBACK` nguyên trạng.
   - **Tầng 3 (Khóa Lạc Quan RowVersion):** Cột `RowVersion` trên bảng `catalog.ProductVariants` phát hiện mọi cập nhật song song và ném `DbUpdateConcurrencyException`, ngăn chặn bán vượt quá số lượng hàng có trong kho.
5. **Thông Tin Thẻ Thử Nghiệm VNPay Sandbox Chuẩn:**
   - Dùng để kiểm thử luồng thanh toán trực tuyến mô phỏng khi đặt hàng (Checkout) hoặc Thanh toán lại (Repay VNPay):
     - **Ngân hàng chấp nhận:** `NCB` (Ngân hàng Quốc Dân)
     - **Số thẻ:** `9704198526191432198`
     - **Tên chủ thẻ:** `NGUYEN VAN A`
     - **Ngày phát hành:** `07/15`
     - **Mã OTP:** `123456`

---

## 9. Phân hệ Cổng Quản trị Vận hành & Quản lý Người dùng (Admin Portal)

### 9.1. Bảng Tổng hợp Màn hình Quản trị

| Mã tính năng | Tên màn hình / Chức năng | Phân quyền | Giao diện URL |
| :--- | :--- | :--- | :--- |
| **ADM-01** | Bảng điều khiển tổng quan (Dashboard thời gian thực) | Quản trị viên | `/admin/dashboard` |
| **ADM-02** | Quản trị Danh mục sản phẩm (Categories CRUD) | Quản trị viên | `/admin/categories` |
| **ADM-03** | Quản trị Thuộc tính Cấu hình (Màu sắc & Dung lượng) | Quản trị viên | `/admin/colors`, `/admin/storage-options` |
| **ADM-04** | Quản trị Sản phẩm & Biến thể toàn trang chuyên sâu | Quản trị viên | `/admin/products`, `/admin/products/:id` |
| **ADM-05** | Quản trị Đơn hàng & Drawer xem chi tiết | Quản trị viên | `/admin/orders` |
| **ADM-06** | Cập nhật Trạng thái Đơn hàng tuần tự & Ghi chú | Quản trị viên | `/admin/orders` (Modal trạng thái) |
| **ADM-07** | Quản trị Người dùng & Khóa/Mở tài khoản | Quản trị viên cấp cao | `/admin/users` |
| **ADM-08** | Quản trị Vai trò & Phân quyền hệ thống (RBAC) | Quản trị viên cấp cao | `/admin/roles` |
| **ADM-09** | Cài đặt hệ thống & Hồ sơ cá nhân Quản trị | Quản trị viên | `/admin/settings`, `/admin/profile` |

### 9.2. Mô tả Chi tiết Nghiệp vụ Quản trị

1. **Quản trị Đơn hàng & Nhật Ký Kiểm Toán (ADM-05 & ADM-06):**
   - Phân trang danh sách đơn hàng, tìm kiếm tức thì theo mã đơn hàng, tên người nhận, số điện thoại hoặc email.
   - Lọc nhanh theo 6 trạng thái đơn hàng và phương thức thanh toán.
   - **Cập nhật trạng thái tuần tự:** Ngăn chặn việc nhảy cóc trạng thái (ví dụ từ *Chờ xử lý* không được nhảy ngay lên *Hoàn tất* mà phải qua *Đã xác nhận* $\rightarrow$ *Đang giao*).
   - Mọi lần chuyển đổi trạng thái đều được lưu vết chi tiết vào trường `StatusHistoryJson` kèm mốc thời gian UTC và ghi chú kiểm toán.
2. **Quản trị Người Dùng & Khóa Tài Khoản (ADM-07):**
   - Danh sách người dùng hệ thống kèm thông tin vai trò, trạng thái kích hoạt và ngày đăng ký.
   - Tính năng Khóa/Mở khóa tài khoản an toàn (`ToggleActive`): Tài khoản bị khóa lập tức bị vô hiệu hóa Refresh Token và không thể đăng nhập vào hệ thống.

---

## 10. Động cơ Báo cáo Thống kê & Xuất Excel Doanh nghiệp (Business Intelligence)

### 10.1. Bảng Tổng hợp Tính năng Báo cáo

| Mã tính năng | Tên tính năng | Đối tượng áp dụng | Giao diện URL | API Endpoint | Phương thức HTTP |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **REP-01** | Báo cáo 6 Thẻ đo lường KPI Hiệu suất | Quản trị viên | `/admin/reports` | `/api/manager/reports/kpi` | `GET` |
| **REP-02** | Biểu đồ Xu hướng Doanh thu Kép đa kỳ | Quản trị viên | `/admin/reports` | `/api/manager/reports/revenue-chart` | `GET` |
| **REP-03** | Khối Phân bổ 6 Trạng thái Đơn hàng | Quản trị viên | `/admin/reports` | `/api/manager/reports/status-distribution` | `GET` |
| **REP-04** | Biểu đồ Cơ cấu Kênh Thanh toán (VNPAY vs COD) | Quản trị viên | `/admin/reports` | `/api/manager/reports/payment-methods` | `GET` |
| **REP-05** | Biểu đồ Cơ cấu Tồn kho theo 7 Ngành hàng Apple | Quản trị viên | `/admin/reports` | `/api/manager/reports/inventory-category` | `GET` |
| **REP-06** | Xuất Báo cáo Đơn hàng ra Excel OpenXML chuẩn | Quản trị viên | `/admin/reports` | `/api/manager/reports/export-excel` | `GET` |

### 10.2. Mô tả Chi tiết Bộ Chỉ Số & Định Dạng Báo Cáo

1. **Bộ Chỉ Số Hiệu Suất Cốt Lõi (Core Metrics Cards):**
   - *Doanh thu thực thu:* Tổng tiền từ các đơn hàng thành công (`Completed`, `Delivered`) và không bị hoàn tiền (`PaymentStatus != Refunded`).
   - *Doanh số gộp ước tính:* Tổng giá trị đơn hàng phát sinh trong kỳ trừ đi đơn hủy/hoàn, kèm số tiền voucher ưu đãi đã áp dụng.
   - *Tổng số đơn hàng:* Số lượng đơn phát sinh trong kỳ.
   - *Tỷ lệ đơn thành công:* Tỷ lệ đơn giao thành công trên tổng số đơn.
   - *Giá trị đơn hàng trung bình (AOV):* Doanh thu thực thu chia cho tổng số đơn thành công.
   - *Tiền voucher ưu đãi:* Tổng ngân sách chiết khấu khuyến mãi đã áp dụng.
2. **Bộ Lọc Thời Gian Nhanh Toàn Diện:**
   - 8 mốc thời gian định sẵn: *Hôm nay, Hôm qua, 7 ngày qua, 30 ngày qua, Tháng này, Tháng trước, Năm nay, Tùy chỉnh khoảng ngày*.
3. **Xuất Tệp Báo Cáo Excel OpenXML Chuẩn Doanh Nghiệp (REP-06):**
   - Sử dụng thư viện `ClosedXML` sinh ra tệp bảng tính `.xlsx` từ luồng stream dữ liệu bộ nhớ, không ghi tệp rác lên ổ cứng.
   - Bảng tính được định dạng chuyên nghiệp: Header tiêu đề doanh nghiệp thương hiệu Urban Stitch, ngày xuất, độ rộng cột tự động điều chỉnh (`AdjustToContents`), định dạng tiền tệ VND chuẩn mực (`#,##0 đ`), và danh sách chi tiết toàn bộ đơn hàng thỏa mãn bộ lọc.

---

## 11. Tự động hóa Hạ tầng & Container Docker Tuần tự (Docker Orchestration)

### 11.1. Bảng Dịch vụ Docker Compose

| Dịch vụ Container | Image cơ sở | Cổng Host:Container | Cơ chế Kiểm tra Sức khỏe (Healthcheck) | Phụ thuộc khởi động (Depends On) |
| :--- | :--- | :---: | :--- | :--- |
| **`sqlserver`** | `mcr.microsoft.com/mssql/server:2022-latest` | `14333:1433` | Lệnh `sqlcmd -S localhost -Q 'SELECT 1'` mỗi 5 giây | Không phụ thuộc |
| **`db-init`** | `mcr.microsoft.com/mssql/server:2022-latest` | Không mở cổng | Khởi chạy script bash kiểm tra và nạp database idempotent | Phụ thuộc `sqlserver` (Healthy) |
| **`backend`** | Multi-stage build .NET 8 SDK & Runtime | `8088:8080` | Lệnh `curl -f http://localhost:8080/health` mỗi 5 giây | Phụ thuộc `sqlserver` (Healthy) & `db-init` (Completed Successfully) |
| **`frontend`** | Multi-stage build Node.js & Nginx Alpine | `3088:80` | Nginx web server lắng nghe yêu cầu | Phụ thuộc `backend` (Healthy) |
| **`ngrok`** | `ngrok/ngrok:latest` | `4040:4040` | Tunnel kết nối cổng 8080 của backend | Phụ thuộc `backend` (Healthy) |

### 11.2. Trình Tự Khởi Chạy Deterministic Tuyệt Đối An Toàn

1. **Bước 1 (Pull & Build):** Docker tiến hành pull và build images cho toàn bộ dịch vụ. Backend và Frontend **tuyệt đối chưa được kích hoạt**.
2. **Bước 2 (SQL Server & Idempotent Database Seeding):**
   - Container `sqlserver` khởi động. Khi lệnh `SELECT 1` thành công, container chuyển sang `Healthy`.
   - Container `db-init` khởi động: đọc biến môi trường `${DB_NAME:-AppleStoreDb}` từ file `.env`. Nếu chưa có database, tự động tạo mới `CREATE DATABASE`.
   - Kiểm tra số lượng sản phẩm trong bảng `[catalog].[Products]`. Nếu chưa có dữ liệu: tự động nạp `seed-data.sql` tạo 27 bảng, 48 dòng máy Apple (2022-2026), 298 biến thể, voucher và 45 đơn hàng mẫu. Nếu đã có dữ liệu: lập tức bỏ qua để bảo toàn dữ liệu.
   - `db-init` hoàn thành và thoát với mã 0 (`service_completed_successfully`).
3. **Bước 3 (Backend Initialization):**
   - Container `backend` khởi động: kết nối tới cơ sở dữ liệu đã chuẩn bị sẵn sàng, đồng bộ EF Core Migrations, thực thi `ApplicationDbSeeder`. Khi endpoint `/health` trả về 200 OK, `backend` chuyển sang `Healthy`.
4. **Bước 4 (Frontend & Ngrok Startup):**
   - Container `frontend` và `ngrok` khởi động. Khách hàng truy cập ngay tại `http://localhost:3088` với đầy đủ dữ liệu hoàn mỹ sẵn sàng.
