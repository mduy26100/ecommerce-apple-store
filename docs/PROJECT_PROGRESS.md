# Báo Cáo Tiến Độ Dự Án (Project Progress)

> Bảng theo dõi tiến độ thực tế của nhóm khi phát triển hệ thống thương mại điện tử Urban Stitch, phản ánh đúng tình trạng mã nguồn hiện tại và những gì nhóm đã làm xong, đang làm dở và dự kiến làm tiếp theo.

---

## 1. Tổng Hợp Trạng Thái Công Việc

Nhóm phân loại các đầu việc theo 3 trạng thái cụ thể:
- **`[x] Đã hoàn thành`**: Các chức năng nhóm đã code xong cả API backend lẫn màn hình frontend, đã kiểm tra hoạt động ổn định.
- **`[-] Đang xử lý`**: Các module nhóm đang làm dở hoặc đang ghép nối giữa backend và frontend.
- **`[ ] Kế hoạch dự kiến`**: Các tính năng dự kiến làm tiếp theo (ghi chú: *"Dự kiến điều chỉnh theo phản hồi thực tế khi ghép nối hệ thống"*).

---

## 2. Chi Tiết Tiến Độ Theo Từng Phân Hệ

### [x] Đã hoàn thành

#### Backend (.NET 8 Web API & Database)
- [x] **Kiến trúc & Cơ sở dữ liệu nền tảng:**
  - Hoàn thiện mô hình **Onion Architecture** phân tầng độc lập (`Domain`, `Application`, `Infrastructure`, `Host`).
  - Thiết kế và triển khai 16 bảng dữ liệu trên **SQL Server** thuộc 3 Schemas (`catalog`, `sales`, `identity`).
  - Tích hợp cơ chế tự động Auditing (`CreatedOn`, `CreatedBy`, `LastModifiedOn`...) và Soft Delete (`IsDeleted`, `DeletedOn`) qua Global Query Filter của EF Core.
  - Tích hợp khóa lạc quan (Optimistic Concurrency Control) với `RowVersion` trên biến thể sản phẩm.
- [x] **Xác thực & Bảo mật (Identity & Security):**
  - Hoàn thiện trọn bộ API Xác thực: `/api/auth/login`, `/api/auth/register`, `/api/auth/refresh-token`, `/api/auth/profile`, `/api/auth/change-password`, `/api/auth/revoke-token`.
  - Phân quyền theo vai trò (Role-based Access Control - RBAC) với các vai trò `Administrator`, `Customer`.
  - Cơ chế cấp phát Access Token (JWT) trong RAM và Refresh Token trong HTTP-Only Cookie.
- [x] **Quản lý Danh mục (Categories):**
  - Public API: `/api/categories` lấy danh sách danh mục active cho Storefront.
  - Manager API: `/api/manager/categories` đầy đủ CRUD (`GetPaged`, `GetById`, `Create`, `Update`, `Delete`), kiểm tra trùng tên/slug.
- [x] **Quản lý Thuộc tính Biến thể (Colors & Storage Options):**
  - Manager API Màu sắc: `/api/manager/colors` đầy đủ CRUD, chuẩn hóa mã màu HEX và tên thương mại Apple.
  - Manager API Dung lượng: `/api/manager/storage-options` đầy đủ CRUD, quy đổi tự động `CapacityInGB` phục vụ sắp xếp.
- [x] **Quản lý Sản phẩm & Biến thể đa chiều (Products & Variants):**
  - Manager API Sản phẩm: `/api/manager/products` đầy đủ CRUD, quản lý sản phẩm cha.
  - Quản lý Biến thể (`ProductVariants`): Thêm, sửa biến thể gắn với SKU, giá bán, giá so sánh và số lượng tồn kho.
  - Quản lý Tùy chọn động (`ProductOptions` & `ProductOptionValues`): Hỗ trợ mở rộng cấu hình không giới hạn cho Apple Watch, MacBook, iPad.
  - Quản lý Thư viện ảnh (`ProductImages`): Hỗ trợ đánh dấu ảnh đại diện và liên kết ảnh theo màu sắc (`ColorId`).
  - Quản lý Nhóm thông số kỹ thuật (`ProductSpecificationGroups` & `ProductSpecifications`): Phân cấp nhóm thông số (Màn hình, Camera, Vi xử lý...) chi tiết cho từng dòng máy.
- [x] **Public Storefront API (Khách hàng mua sắm):**
  - `/api/products/cards`: Danh sách thẻ sản phẩm phân trang, tìm kiếm từ khóa, lọc theo danh mục.
  - `/api/products/showcase`: Danh sách sản phẩm trưng bày trang chủ theo từng ngành hàng.
  - `/api/products/random`: Danh sách sản phẩm ngẫu nhiên phục vụ gợi ý mua sắm.
  - `/api/products/{slug}`: Chi tiết sản phẩm toàn diện (trả về danh mục, bộ sưu tập ảnh, toàn bộ biến thể, tùy chọn động và thông số kỹ thuật phân cấp).
- [x] **Đóng gói & Triển khai Docker (DevOps):**
  - Docker hóa toàn bộ hệ thống với multi-stage build tối ưu cho Backend và Frontend.
  - Thiết lập kịch bản Docker Compose khởi chạy tuần tự có Healthcheck (`sqlserver` $\rightarrow$ `backend` $\rightarrow$ `frontend`).
  - Cơ chế tự động chạy EF Core Migration và tự động nạp dữ liệu mẫu ban đầu [data-test.sql](file:///c:/Users/Admin/Documents/ecommerce-apple-store/data-test.sql) **chỉ 1 lần duy nhất** khi khởi tạo database mới, chống ghi đè an toàn.

#### Frontend (ReactJS & TypeScript)
- [x] **Hạ tầng cốt lõi (Core Infrastructure):**
  - Cấu hình Axios Client Interceptor với cơ chế tự động **Silent Refresh Token** khi gặp mã lỗi 401.
  - Cấu hình TanStack React Query quản lý Server State và caching phân cấp theo thời gian sống (`staleTime`).
  - Cấu hình Zustand quản lý Client State cho phiên xác thực và thông tin người dùng.
  - Khung định tuyến phân cấp với React Router: Phân định `StorefrontLayout`, `AdminLayout` và `AuthLayout`.
  - Chuẩn hóa 100% văn bản giao diện hiển thị sang Tiếng Việt.
- [x] **Giao diện Khách hàng (Storefront Screens):**
  - **Trang chủ (`/`):** Banner hero Apple cao cấp, danh mục sản phẩm, khối hiển thị các dòng máy nổi bật (iPhone, MacBook, iPad, AirPods...), thanh header và footer chuẩn phong cách Apple.
  - **Trang danh mục sản phẩm (`/products`):** Hiển thị danh sách sản phẩm dạng lưới, thanh tìm kiếm từ khóa, phân trang và bộ lọc danh mục.
  - **Trang chi tiết sản phẩm (`/products/:slug`):** Xem chi tiết sản phẩm toàn diện; tương tác chọn màu sắc qua vòng màu trực quan; chọn dung lượng; chọn cấu hình tùy chọn động; giá tiền và trạng thái tồn kho cập nhật tức thì theo biến thể; bộ ảnh sản phẩm tự động chuyển theo màu sắc; bảng thông số kỹ thuật phân cấp theo nhóm chuyên nghiệp.
  - **Trang hồ sơ cá nhân (`/profile`):** Xem thông tin cá nhân của người dùng đã đăng nhập.
- [x] **Giao diện Xác thực (Auth Screens):**
  - **Trang Đăng nhập (`/login` & `/admin/auth/login`):** Biểu mẫu đăng nhập xác thực tài khoản có kiểm tra dữ liệu đầu vào.
  - **Trang Đăng ký (`/register`):** Biểu mẫu tạo tài khoản khách hàng mới.
- [x] **Giao diện Quản trị (Admin Screens):**
  - **Bảng điều khiển (`/admin/dashboard`):** Tổng quan số liệu thống kê cơ bản, các thẻ chỉ số hiệu suất.
  - **Quản lý Danh mục (`/admin/categories`):** Bảng danh mục sản phẩm, modal tạo mới/chỉnh sửa, chuyển đổi trạng thái hiển thị.
  - **Quản lý Màu sắc (`/admin/colors`):** Bảng danh sách màu sắc, hiển thị mẫu màu trực quan, thêm/sửa/xóa màu sắc.
  - **Quản lý Dung lượng (`/admin/storage-options`):** Bảng các mức bộ nhớ, thêm/sửa/xóa dung lượng.
  - **Quản lý Sản phẩm (`/admin/products`):** Bảng sản phẩm, phân trang, tìm kiếm, modal cập nhật thông tin sản phẩm và liên kết biến thể.
  - **Tải & Xử lý ảnh trực tiếp lên Cloudinary CDN:** Tích hợp sẵn modal cắt ảnh (`image-cropper`) và tiện ích nén ảnh (`browser-image-compression`) phía client khi tải ảnh danh mục (`CategoryFormModal`), ảnh sản phẩm theo màu (`ProductImagesByColorManager`) và ảnh biến thể (`VariantImageGallery`). Backend nhận tệp `multipart/form-data`, tự động đẩy lên Cloudinary CDN và lưu URL ảnh an toàn, người dùng hoàn toàn không phải dán link thủ công.
  - **Quản trị Người dùng (`/admin/users`) & Vai trò (`/admin/roles`):** Quản lý danh sách tài khoản và phân quyền người dùng.
  - **Cài đặt (`/admin/settings`) & Hồ sơ (`/admin/profile`):** Tùy chỉnh thông tin hệ thống và tài khoản quản trị.

---

- [x] **Nghiệp vụ Giỏ hàng Trực tuyến Toàn diện (Shopping Cart Feature):**
  - [x] **Cơ sở dữ liệu & Entity tối ưu:** Thiết kế lại `sales.Carts` & `sales.CartItems`, hỗ trợ song song Khách vãng lai (`GuestId` lưu tại LocalStorage) và Thành viên đăng nhập (`UserId`), loại bỏ cột `Status` dư thừa, Filtered Unique Index chống trùng lặp dòng sản phẩm và chống xung đột Soft Delete, lưu `UnitPrice` snapshot, cờ chọn mua `IsSelected`, hạn giỏ hàng `ExpiresOn` và Check Constraint `Quantity > 0`.
  - [x] **Bộ API Giỏ hàng:** `GET /api/cart`, `POST /api/cart/items`, `PUT /api/cart/items/quantity`, `PUT /api/cart/items/selection`, `PUT /api/cart/items/variant`, `DELETE /api/cart/items/{id}`, `DELETE /api/cart`, `POST /api/cart/merge`, `GET /api/products/{id}/options-matrix`.
  - [x] **Cơ chế Tự phục hồi Số lượng Tồn kho (Self-Healing Cart):** Xử lý tận gốc tại Backend (`CartService.cs`). Khi tồn kho biến động nhỏ hơn số lượng trong giỏ (ví dụ giỏ lưu 14 máy nhưng cửa hàng chỉ còn 5 máy, hoặc hết hàng rồi nhập lại 5 máy), hệ thống tự động ép số lượng về `1`, tính lại đơn giá dòng, tổng tiền, cập nhật vĩnh viễn xuống Database; phía Frontend hiển thị cảnh báo tồn kho và khóa nút tăng vượt quá tồn kho thực tế.
  - [x] **Đổi phân loại sản phẩm trong giỏ hàng (`ChangeVariantModal`):** Cho phép người dùng chuyển đổi màu sắc, dung lượng ngay tại trang giỏ hàng bằng ma trận phân loại nhẹ; tự động cộng dồn số lượng nếu phiên bản mới đã có trong giỏ hàng.
  - [x] **Tự động gộp giỏ hàng (Guest Cart Auto-Merge):** Tự động phát hiện và gộp toàn bộ sản phẩm từ giỏ khách vãng lai sang tài khoản thành viên ngay khi đăng nhập thành công.
  - [x] **Giao diện Storefront Giỏ hàng (`/cart`):** Thiết kế Responsive chuẩn chỉ cho Mobile/Tablet/Desktop; Header Badge và số lượng tiêu đề chỉ đếm sản phẩm khả dụng; phân tách khu vực sản phẩm tạm hết hàng/ngừng kinh doanh với cảnh báo trực quan; hỗ trợ chọn mua toàn bộ hoặc từng phần (Selective Checkout).
  - [x] **Kiểm thử tự động E2E Headless Playwright:** 5 kịch bản kiểm thử toàn diện tại `test-playwright/e2e/cart-flow.spec.ts` đều vượt qua 100%.

---

### [-] Đang xử lý

- [-] **Quy trình Đặt hàng & Tạo hóa đơn (Checkout Flow):**
  - Xây dựng màn hình nhập thông tin người nhận (Họ tên, Số điện thoại, Tỉnh/Thành, Địa chỉ nhận hàng chi tiết).
  - Hoàn thiện API ghi nhận đơn hàng vào bảng `sales.Orders` và snapshot sản phẩm vào `sales.OrderItems`.
  - Trừ số lượng tồn kho tự động trong `catalog.ProductVariants` với cơ chế kiểm soát khóa lạc quan `RowVersion`.
- [-] **Quản lý Đơn hàng cho Admin (`/admin/orders`):**
  - Hoàn thiện giao diện hiển thị danh sách đơn hàng đã đặt, bộ lọc theo trạng thái (`Chờ xử lý`, `Đang vận chuyển`, `Đã giao`, `Đã hủy`).
  - Màn hình chi tiết đơn hàng: Xem danh sách mặt hàng, thông tin khách hàng và nút cập nhật trạng thái đơn hàng.

---

### [ ] Kế hoạch dự kiến

> **Ghi chú:** Dự kiến điều chỉnh theo phản hồi thực tế khi ghép nối hệ thống.

- [ ] **Tích hợp Cổng thanh toán trực tuyến:**
  - Tích hợp cổng thanh toán trực tuyến qua VNPay, MoMo, ZaloPay.
  - Xử lý xác thực chữ ký số an toàn và tiếp nhận phản hồi tức thời qua Webhook IPN.
- [ ] **Tích hợp Đơn vị Vận chuyển tự động:**
  - Kết nối API đơn vị giao vận (Giao Hàng Nhanh - GHN / Viettel Post).
  - Tự động tính cước vận chuyển theo vị trí địa lý và tạo mã vận đơn tự động ngay khi duyệt đơn.
  - Tra cứu hành trình đơn hàng thời gian thực cho người mua.
- [ ] **Hệ thống Khuyến mãi & Mã giảm giá (Coupons & Discounts):**
  - Bảng dữ liệu quản lý mã voucher giảm giá (theo % hoặc số tiền cố định, điều kiện đơn hàng tối thiểu).
  - Áp dụng mã giảm giá trực tiếp tại bước thanh toán giỏ hàng.
- [ ] **Đánh giá & Nhận xét sản phẩm (Reviews & Ratings):**
  - Cho phép khách hàng đã mua sản phẩm gửi đánh giá sao (1 - 5 sao), nhận xét và đính kèm hình ảnh thực tế.
  - Phân hệ duyệt bình luận dành cho quản trị viên nhằm kiểm soát nội dung trước khi hiển thị công khai.
- [ ] **Báo cáo Thống kê & Phân tích chuyên sâu (Advanced Analytics):**
  - Biểu đồ biến động doanh thu theo tuần/tháng/quý.
  - Thống kê tỷ lệ chuyển đổi, top sản phẩm bán chạy nhất theo ngành hàng.
  - Cảnh báo sản phẩm sắp hết hàng trong kho.
