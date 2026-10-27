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
  - `/api/products/search`: API tìm kiếm gần đúng Realtime (`query`, `limit`), truy vấn đa trường (Tên, Slug, ModelCode, Danh mục, Mô tả ngắn) qua Specification Pattern `ProductQuickSearchSpec`, chặn tìm kiếm nếu dưới 3 ký tự.
- [x] **Đóng gói & Triển khai Docker (DevOps):**
  - Docker hóa toàn bộ hệ thống với multi-stage build tối ưu cho Backend và Frontend.
  - Thiết lập kịch bản Docker Compose khởi chạy tuần tự có Healthcheck (`sqlserver` $\rightarrow$ `backend` $\rightarrow$ `frontend`).
  - Cơ chế tự động chạy EF Core Migration và tự động nạp dữ liệu mẫu ban đầu `data-test.sql` **chỉ 1 lần duy nhất** khi khởi tạo database mới, chống ghi đè an toàn.

#### Frontend (ReactJS & TypeScript)
- [x] **Hạ tầng cốt lõi (Core Infrastructure):**
  - Cấu hình Axios Client Interceptor với cơ chế tự động **Silent Refresh Token** khi gặp mã lỗi 401.
  - Cấu hình TanStack React Query quản lý Server State và caching phân cấp theo thời gian sống (`staleTime`).
  - Cấu hình Zustand quản lý Client State cho phiên xác thực và thông tin người dùng.
  - Khung định tuyến phân cấp với React Router: Phân định `StorefrontLayout`, `AdminLayout` và `AuthLayout`.
  - Chuẩn hóa 100% văn bản giao diện hiển thị sang Tiếng Việt.
- [x] **Giao diện Khách hàng (Storefront Screens):**
  - **Trang chủ (`/`):** Banner hero Apple cao cấp, danh mục sản phẩm, khối hiển thị các dòng máy nổi bật (iPhone, MacBook, iPad, AirPods...), thanh header và footer chuẩn phong cách Apple.
  - **Tìm kiếm gần đúng Realtime trên Storefront Header (`StorefrontHeader.tsx`):**
    - Kích hoạt tìm kiếm tự động khi nhập từ 3 ký tự trở lên (`useProductSearch`), hiển thị dropdown danh sách sản phẩm nhanh (ảnh, tên, dòng chip, giá bán, giá niêm yết).
    - Cơ chế Fallback an toàn: Tự động hiển thị biểu tượng Apple Logo (`<AppleLogo />`) khi ảnh null hoặc lỗi tải.
    - **Desktop Experience:** Mở rộng thanh tìm kiếm toàn bộ chiều ngang giữa header (`h-16`, `max-w-4xl`), ẩn thanh category navigation; đóng linh hoạt khi click ra ngoài, click lại icon search hoặc bấm phím `Escape`.
    - **Mobile Fullscreen Portal:** Sử dụng React Portal (`createPortal(..., document.body)`) đưa giao diện tìm kiếm ra ngoài DOM body dưới dạng Fullscreen Overlay, giải quyết triệt để lỗi bị giới hạn chiều cao do `backdrop-blur-sm` trên header; top bar cao chuẩn `h-16` bằng header, nút quay lại, nút hủy, hiển thị giá bán và giá niêm yết thành 2 dòng riêng biệt chống chồng chéo, nút xem tất cả kết quả cố định ở đáy màn hình.
    - Chuẩn hóa điều hướng sang trang danh mục: `/products?q={query}&page=1`.
  - **Trang danh mục sản phẩm (`/products`):** Hiển thị danh sách sản phẩm dạng lưới, thanh tìm kiếm từ khóa, phân trang và bộ lọc danh mục.
  - **Trang chi tiết sản phẩm (`/products/:slug`):** Xem chi tiết sản phẩm toàn diện; tương tác chọn màu sắc qua vòng màu trực quan; chọn dung lượng; chọn cấu hình tùy chọn động; giá tiền và trạng thái tồn kho cập nhật tức thì theo biến thể; bộ ảnh sản phẩm tự động chuyển theo màu sắc; bảng thông số kỹ thuật phân cấp theo nhóm chuyên nghiệp.
  - **Trang hồ sơ cá nhân (`/profile`):** Xem thông tin cá nhân của người dùng đã đăng nhập.
- [x] **Giao diện Xác thực (Auth Screens):**
  - **Trang Đăng nhập (`/login` & `/admin/auth/login`):** Biểu mẫu đăng nhập xác thực tài khoản có kiểm tra dữ liệu đầu vào.
  - **Trang Đăng ký (`/register`):** Biểu mẫu tạo tài khoản khách hàng mới.
- [x] **Giao diện Quản trị (Admin Screens):**
  - **Bảng điều khiển (`/admin/dashboard`):** Tổng quan số liệu thống kê cơ bản, các thẻ chỉ số hiệu suất.
  - **Thanh Header Quản trị (`AdminHeader.tsx`):** Chuyển đổi avatar mặc định người dùng sang icon `UserOutlined` của Ant Design, tinh gọn và chuyên nghiệp.
  - **Quản lý Danh mục (`/admin/categories`):** Bảng danh mục sản phẩm, modal tạo mới/chỉnh sửa, chuyển đổi trạng thái hiển thị.
  - **Quản lý Màu sắc (`/admin/colors`):** Bảng danh sách màu sắc, hiển thị mẫu màu trực quan, thêm/sửa/xóa màu sắc.
  - **Quản lý Dung lượng (`/admin/storage-options`):** Bảng các mức bộ nhớ, thêm/sửa/xóa dung lượng.
  - **Quản lý Sản phẩm (`/admin/products`):** Bảng sản phẩm, phân trang, tìm kiếm, modal cập nhật thông tin sản phẩm và liên kết biến thể.
  - **Tải & Xử lý ảnh trực tiếp lên Cloudinary CDN:** Tích hợp sẵn modal cắt ảnh (`image-cropper`) và tiện ích nén ảnh (`browser-image-compression`) phía client khi tải ảnh danh mục (`CategoryFormModal`), ảnh sản phẩm theo màu (`ProductImagesByColorManager`) và ảnh biến thể (`VariantImageGallery`). Backend nhận tệp `multipart/form-data`, tự động đẩy lên Cloudinary CDN và lưu URL ảnh an toàn, người dùng hoàn toàn không phải dán link thủ công.
  - **Quản trị Người dùng (`/admin/users`) & Vai trò (`/admin/roles`):** Quản lý danh sách tài khoản và phân quyền người dùng.
  - **Cài đặt (`/admin/settings`) & Hồ sơ (`/admin/profile`):** Tùy chỉnh thông tin hệ thống và tài khoản quản trị.

---

- [x] **Nghiệp vụ Giỏ hàng Trực tuyến Toàn diện (Shopping Cart Feature):**
  - [x] **Bộ API Giỏ hàng:** `GET /api/cart`, `POST /api/cart/items`, `PUT /api/cart/items/quantity`, `PUT /api/cart/items/selection`, `PUT /api/cart/items/variant`, `DELETE /api/cart/items/{id}`, `DELETE /api/cart`, `POST /api/cart/merge`, `GET /api/products/{id}/options-matrix`.
  - [x] **Cơ chế Tự phục hồi Số lượng Tồn kho (Self-Healing Cart):** Xử lý tận gốc tại Backend (`CartService.cs`). Khi tồn kho biến động nhỏ hơn số lượng trong giỏ, hệ thống tự động ép số lượng về `1`, tính lại tổng tiền, cập nhật xuống Database; Frontend hiển thị cảnh báo tồn kho và khóa nút tăng vượt quá tồn kho thực tế.
  - [x] **Đổi phân loại sản phẩm trong giỏ hàng (`ChangeVariantModal`):** Cho phép người dùng chuyển đổi màu sắc, dung lượng ngay tại trang giỏ hàng; tự động cộng dồn số lượng nếu phiên bản mới đã có trong giỏ hàng.
  - [x] **Tự động gộp giỏ hàng (Guest Cart Auto-Merge):** Tự động phát hiện và gộp toàn bộ sản phẩm từ giỏ khách vãng lai sang tài khoản thành viên ngay khi đăng nhập thành công.
  - [x] **Giao diện Storefront Giỏ hàng (`/cart`):** Thiết kế Responsive chuẩn Apple; Header Badge và số lượng tiêu đề chỉ đếm sản phẩm khả dụng; phân tách khu vực sản phẩm tạm hết hàng với cảnh báo trực quan; hỗ trợ chọn mua toàn bộ hoặc từng phần (Selective Checkout); tích hợp cơ chế fallback ảnh sản phẩm (`CartItemRow.tsx`) về biểu tượng `<AppleLogo />` khi đường dẫn ảnh bị null hoặc gặp sự cố tải.

- [x] **Quy trình Đặt hàng & Quản lý Vòng đời Đơn hàng Toàn diện (Checkout Flow & Order Lifecycle):**
  - [x] **Cơ sở dữ liệu & Entity Đơn hàng & Voucher:** Nâng cấp toàn diện `sales.Orders` và `sales.OrderItems` (chuyển sang Enums `OrderStatus`, `PaymentMethod`, `PaymentStatus`; hỗ trợ Guest Checkout `UserId?` + `GuestId`; snapshot Dynamic Options `SelectedAttributesJson`, `VariantName`, `ThumbnailUrl`; bổ sung giá vốn `CostPrice` trên cả `ProductVariant` và `OrderItem` để tính lợi nhuận gộp; bổ sung `RowVersion` khóa lạc quan và Check Constraints toàn vẹn).
  - [x] **Hệ thống Khuyến mãi Đa đối tượng & Ví Voucher (`sales.Vouchers`, `sales.UserVouchers`, `sales.VoucherUsages`):** Xây dựng hệ thống voucher hỗ trợ 3 nhóm đối tượng (`Public`, `RegisteredOnly`, `AssignedOnly`); tạo bảng trung gian `UserVouchers` (Ví voucher) cho phép Admin/Hệ thống cấp riêng voucher cá nhân hóa cho từng User kèm giới hạn lượt dùng riêng `AssignedUsageLimit`, số lượt đã dùng `UsedCount` và hạn dùng riêng `ExpiresAt`; liên kết lịch sử sử dụng vào `VoucherUsages`.
  - [x] **Bảo mật Backend Zero-Trust (Không tin cậy dữ liệu Frontend gửi lên):**
    - Đơn giá sản phẩm và giá vốn được truy xuất và kiểm tra trực tiếp từ `ProductVariant` trong cơ sở dữ liệu, không tin tưởng đơn giá từ client gửi lên.
    - Kiểm tra tồn kho thời gian thực tại thời điểm đặt hàng để chống overselling.
    - Xác thực tính hợp lệ của mã Voucher tại Backend: Kiểm tra điều kiện đơn hàng tối thiểu `MinOrderAmount`, hạn sử dụng `StartDate`/`EndDate`, tổng lượt dùng còn lại của hệ thống và giới hạn lượt dùng riêng của từng tài khoản.
  - [x] **Chu trình Trạng thái Đơn hàng Hoàn chỉnh (Order Lifecycle & Activity Tracking):**
    - Trạng thái đơn hàng: `Chờ xử lý` (Pending) $\rightarrow$ `Đã xác nhận` (Confirmed) $\rightarrow$ `Đang giao` (Shipping) $\rightarrow$ `Đã giao` (Delivered) $\rightarrow$ `Đã nhận hàng` (Completed) & `Đã hủy` (Cancelled).
    - **Hủy đơn hàng an toàn (`CancelOrderAsync`):** Chỉ người dùng đăng nhập sở hữu đơn hàng mới có quyền hủy đơn khi đơn ở trạng thái `Chờ xử lý` (Pending) và **chưa thanh toán** (`PaymentStatus != Paid`); chặn 100% mọi hành vi hủy đơn chéo tài khoản hoặc không xác thực (trả về 401/403); hệ thống tự động hoàn lại số lượng tồn kho `QuantityInStock` cho các biến thể và phục hồi lượt sử dụng voucher.
    - **Chặn tuyệt đối Hủy đơn khi đã Thanh toán thành công (`PaymentStatus: Paid`):** Kiểm tra chặt chẽ tại Backend (`DomainException` nếu cố tình hủy) và ẩn hoàn toàn nút hủy trên Frontend ("Đơn hàng của tôi"), đồng thời vô hiệu hóa nút hủy trên Admin Drawer/Modal.
    - **Chỉnh sửa thông tin giao nhận / địa chỉ 1 lần duy nhất (`UpdateShippingAddressAsync`):** Khi đơn hàng vẫn đang ở trạng thái `Chờ xử lý` (Pending), thành viên sở hữu đơn được phép nhấn vào nút "Đổi địa chỉ nhận hàng" ngay trong Modal Chi tiết đơn hàng để cập nhật lại thông tin giao vận. Giới hạn tối đa 1 lần duy nhất (`ShippingAddressUpdateCount`), tự động ẩn nút và hiển thị badge "Đã cập nhật địa chỉ (1/1 lần)".
    - **Xác nhận đã nhận hàng an toàn (`ConfirmReceivedAsync` cho Thành viên):** Khi cửa hàng chuyển trạng thái `Đã giao` (Delivered), thành viên sở hữu đơn có nút xác nhận "Đã nhận hàng", đơn chuyển sang `Completed` (Đã nhận hàng) và trạng thái thanh toán COD tự động chuyển sang `Paid`.
    - **Nhật ký tiến trình chi tiết (`StatusHistoryJson`):** Cột JSON trên `sales.Orders` ghi lại từng mốc lịch sử gồm trạng thái, tên hiển thị, thời điểm thay đổi, đối tượng thực hiện (`Customer` / `Manager`) và ghi chú/lý do.
  - [x] **Phân trang Đơn hàng của tôi (`GetMyOrders`):**
    - Phân trang `PagedList<OrderSummaryDto>` kèm metadata (`totalCount`, `pageNumber`, `pageSize`, `totalPages`).
    - DTO `UserOrderPagedRequest` kết hợp Specification `UserOrdersFilterSpec`.
    - Bộ lọc trạng thái đa dạng: `Tất cả`, `Chờ xử lý`, `Đã xác nhận`, `Đang giao`, `Đã giao`, `Đã nhận hàng`, `Đã hủy`.
    - Tìm kiếm nhanh theo mã đơn, người nhận, số điện thoại hoặc email.
    - Hiển thị badge phương thức thanh toán (`COD`, `VNPAY`) và trạng thái thanh toán trực quan (`PaymentStatusBadge`: `Chưa thanh toán`, `Đã thanh toán`, `Thanh toán thất bại`, `Đã hoàn tiền`).
  - [x] **Trang Xác nhận & Thanh toán (`/checkout`):** Giao diện chuẩn Apple Store thẩm mỹ cao; hỗ trợ voucher công khai và voucher cá nhân hóa; tự động điền hồ sơ thành viên.
  - [x] **Trang Đặt hàng thành công (`/checkout/success`):** Hiển thị mã đơn hàng, hướng dẫn kiểm tra email, thông tin giao nhận và nút chuyển tiếp.
  - [x] **Bảo mật Toàn diện Trang Tra cứu Đơn hàng (`/order-lookup`):** Chỉ hiển thị cho khách chưa đăng nhập; chỉ cho phép tra cứu đơn khách vãng lai (`UserId == null`); chế độ chỉ đọc chống sửa đổi; fallback ảnh logo Apple khi ảnh lỗi.
  - [x] **Cơ chế Tự động Quy nạp Đơn hàng qua Email & Gộp đơn trên Thiết bị:** Tự động gộp đơn vãng lai vào tài khoản thành viên khi đăng ký/đăng nhập cùng email hoặc bấm gộp từ banner thiết bị.
  - [x] **Quản lý Đơn hàng cho Admin (`/admin/orders`):** Danh sách đơn hàng phân trang, lọc theo trạng thái, tìm kiếm từ khóa; Drawer chi tiết đơn hàng xem snapshot mặt hàng, người nhận, lịch sử trạng thái và chuyển trạng thái tuần tự có kiểm soát.

- [x] **Tích hợp Cổng Thanh toán Trực tuyến VNPay Sandbox & Kiểm soát Tương tranh (Online Payment & Concurrency Control):**
  - [x] **Kiến trúc Clean Architecture phân tầng:** Phân tách rõ ràng giữa tầng `Application` (giao diện `IVnPayService`, DTOs `VnPayRequestDto`, `VnPayResponseDto`, `VnPayIpnResponseDto`) và tầng `Infrastructure` (triển khai thuật toán băm HMAC-SHA512, thư viện VNPAY.NET).
  - [x] **Cơ chế Kiểm soát Tương tranh 3 lớp chống Bán vượt tồn kho (Overselling):**
    - **Lớp 1 (Ứng dụng):** Quản lý khóa đồng thời `ConcurrentDictionary<int, SemaphoreSlim>` kết hợp nguyên tắc **Lock Ordering** (luôn sắp xếp danh sách `VariantId` tăng dần trước khi lấy khóa để triệt tiêu hoàn toàn nguy cơ Deadlock).
    - **Lớp 2 (Giao dịch):** Bao bọc toàn bộ chu trình kiểm tra tồn kho, trừ tồn kho, tạo đơn hàng và chi tiết đơn hàng trong một `IDatabaseTransaction` ACID duy nhất.
    - **Lớp 3 (Cơ sở dữ liệu):** Cột `RowVersion` khóa lạc quan trên `catalog.ProductVariants` phát hiện và ngăn chặn mọi sự can thiệp sửa đổi đồng thời.
  - [x] **Quy tắc Trừ tồn kho tức thì & Hoàn kho:**
    - Trừ tồn kho `QuantityInStock` ngay tại thời điểm tạo đơn hàng thành công ở trạng thái `Pending` cho mọi phương thức thanh toán (COD lẫn VNPay) để giữ hàng công bằng cho khách hàng.
    - Tự động hoàn trả tồn kho khi đơn hàng bị hủy (`Cancelled`).
  - [x] **Chặn tuyệt đối Hủy đơn khi đã Thanh toán thành công (`PaymentStatus: Paid`):**
    - Backend kiểm tra và ném `DomainException` chặn đứng mọi request hủy đơn qua API đối với các đơn đã thanh toán.
    - Thuộc tính DTO `CanCancel => Status == "Pending" && PaymentStatus != "Paid"`.
    - Frontend ẩn nút "Hủy đơn hàng" trên giao diện khách hàng và vô hiệu hóa tùy chọn "Hủy đơn" trên giao diện Quản trị viên.
  - [x] **Gỡ bỏ Giới hạn Thời gian Thanh toán lại (Flexible Repayment):**
    - Loại bỏ hoàn toàn giới hạn 15 phút. Khách hàng có thể quay lại đơn hàng `Pending` chưa thanh toán và bấm nút "Thanh toán qua VNPay" bất cứ lúc nào.
    - API `/api/orders/{id}/repay-vnpay` sinh ra URL thanh toán VNPay mới với mã tham chiếu giao dịch độc nhất và mốc thời gian UTC+7 mới.
  - [x] **Xác thực Kép Return URL & Webhook IPN:**
    - Kiểm tra chữ ký bí mật HMAC-SHA512 với `HashSecret`.
    - Xử lý Idempotent chống ghi nhận lặp khi VNPay gửi nhiều callback cho cùng một giao dịch.
    - Chuẩn hóa múi giờ Việt Nam (UTC+7) trên môi trường Docker Linux container.
  - [x] **Tự động hóa toàn diện qua Docker & Ngrok:** Tự động nạp cấu hình từ file `.env` duy nhất, khởi chạy hoàn chỉnh chỉ với 1 lệnh `docker compose up -d`.

---

### [-] Đang xử lý

- [-] **Tích hợp thêm các phương thức thanh toán bổ sung:**
  - Nghiên cứu tích hợp cổng Ví MoMo, ZaloPay và Apple Pay.
- [-] **Tích hợp API Đơn vị Vận chuyển Tự động:**
  - Chuẩn bị kết nối API Giao Hàng Nhanh (GHN) / Viettel Post để tự động tính phí vận chuyển theo vị trí địa lý và phát hành mã vận đơn tự động.

---

### [ ] Kế hoạch dự kiến

> **Ghi chú:** Dự kiến điều chỉnh theo phản hồi thực tế khi ghép nối hệ thống.

- [ ] **Mở rộng các Cổng thanh toán khác:**
  - Bổ sung MoMo, ZaloPay, Apple Pay.
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
