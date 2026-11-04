# Kiến Trúc Hệ Thống (System Architecture)

> **Tài liệu đặc tả kiến trúc kỹ thuật tổng thể của nền tảng thương mại điện tử Urban Stitch.**  
> Tập trung vào mô hình phân tầng hướng tâm **Onion Architecture** cho Backend .NET 8, kiến trúc **Feature-based Architecture** cho Frontend React 19, chuyên đề **Kiến trúc Thanh toán Trực tuyến VNPay với Webhook IPN Thực & Khả năng Retry Thanh toán Vô hạn**, và **Cơ chế Kiểm soát Tương tranh Đa tầng (3-Tier Concurrency Defense)** xử lý hàng nghìn đơn hàng đồng thời mà không bị bán vượt tồn kho.

---

## 1. Danh Sách Công Nghệ Sử Dụng Cốt Lõi (Tech Stack)

Hệ thống được xây dựng tinh gọn dựa trên 3 trụ cột công nghệ cấp doanh nghiệp:

| Nền tảng | Công nghệ cốt lõi | Vai trò & Đặc điểm kiến trúc |
| :--- | :--- | :--- |
| **Cơ sở dữ liệu** | **Microsoft SQL Server 2022** | Hệ quản trị cơ sở dữ liệu quan hệ mạnh mẽ, lưu trữ toàn bộ dữ liệu nghiệp vụ, hỗ trợ transaction ACID, khóa lạc quan (`rowversion`), chỉ mục lọc (Filtered Indexes) và phân tách 3 Schemas độc lập (`catalog`, `sales`, `identity`). |
| **Backend** | **.NET 8 (ASP.NET Core Web API)** | Nền tảng phát triển ứng dụng Web API hiệu năng cao của Microsoft, xây dựng theo nguyên lý Clean Architecture / Onion Architecture với cơ chế Dependency Injection nguyên bản, middleware xử lý lỗi tập trung và bộ lọc chuẩn hóa phản hồi `ApiResponse<T>`. |
| **Frontend** | **React 19 + TypeScript + Vite** | Thư viện xây dựng giao diện người dùng theo mô hình Single Page Application (SPA), tổ chức mã nguồn theo kiến trúc Feature-based; phân định rạch ròi giữa Server State (TanStack React Query) và Client State (Zustand); tối ưu giao diện với TailwindCSS v4 và Ant Design 6. |

---

## 2. Kiến Trúc Backend: Mô Hình Phân Tầng Onion Architecture

Backend của dự án được triển khai dựa trên nguyên lý **Clean Architecture**, cụ thể hóa qua mô hình **Onion Architecture** (Kiến trúc củ hành). Đặc điểm cốt lõi của mô hình này là **chiều phụ thuộc một chiều nghiêm ngặt hướng vào tâm** (Dependency Inversion Principle).

### Bảng Mô Hình Phân Tầng Onion Architecture (Từ Ngoài Vào Trong)

| Vị trí tầng | Tên tầng (Layer) | Dự án (Project) | Thành phần chính bên trong | Chiều phụ thuộc (Dependency) |
| :---: | :--- | :--- | :--- | :--- |
| **Lớp 4 (Cổng ngoài)** | **Host** | `Host.csproj` | ASP.NET Core Web API, Controllers (`Manager` và `Public`), Middleware xử lý ngoại lệ tập trung (`ExceptionHandlingMiddleware`), Action Filters chuẩn hóa `ApiResponseFilterAttribute`, Cấu hình Swagger OpenAPI, Healthchecks, Cấu hình Dependency Injection. | Phụ thuộc vào `Application`, `Infrastructure` và `Domain`. |
| **Lớp 3 (Hạ tầng)** | **Infrastructure** | `Infrastructure.csproj` | Entity Framework Core `AppDbContext`, Fluent API Entity Type Configurations, SQL Server Provider, ASP.NET Core Identity (`UserManager`, `RoleManager`), Dịch vụ thanh toán VNPay (`VnPayService`), Dịch vụ tải ảnh Cloudinary (`CloudinaryService`), Quản lý phiên Refresh Token. | Triển khai các Interface của tầng `Application`, phụ thuộc vào `Domain`. |
| **Lớp 2 (Ứng dụng)** | **Application** | `Application.csproj` | Use Cases nghiệp vụ, Features phân hệ (`Catalog`, `Cart`, `Ordering`, `Identity`, `Vouchers`), DTOs (Request / Response), Specifications truy vấn phân trang, Service Interfaces (`IVnPayService`, `IRepository<T>`, `IDatabaseTransaction`). | **Chỉ phụ thuộc duy nhất vào Domain**. Tuyệt đối không phụ thuộc Infrastructure hay Host. |
| **Lớp 1 (Tâm lõi)** | **Domain** | `Domain.csproj` | Các thực thể nghiệp vụ cốt lõi (`Category`, `Product`, `ProductVariant`, `Order`, `Voucher`...), Value Objects, Domain Exceptions, Hằng số phân quyền `RoleConstants`, Lớp cơ sở `BaseEntity<int>`. | **Độc lập tuyệt đối**. Không phụ thuộc vào bất kỳ framework hoặc thư viện bên ngoài nào. |

---

### 2.1. Ưu Điểm Quyết Định Của Kiến Trúc Onion

1. **Cô lập Nghiệp vụ Cốt lõi khỏi Biến động Công nghệ (Domain Isolation):**
   - Quy tắc tính giá biến thể, điều kiện voucher, trừ tồn kho và quy chuẩn sản phẩm Apple là tài sản vô giá của doanh nghiệp. Tầng `Domain` nằm ở trung tâm và độc lập hoàn toàn, không chứa bất kỳ dòng code nào của EF Core, SQL Server hay Web framework.
2. **Khả năng Cắm Rút Hạ tầng Linh hoạt (Pluggable Infrastructure):**
   - Cơ sở dữ liệu, ORM, thư viện gửi mail hay cổng thanh toán chỉ là các "chi tiết kỹ thuật bên ngoài" (External Plugins) được kết nối qua các Interface trừu tượng. Nếu sau này hệ thống chuyển từ SQL Server sang PostgreSQL hay bổ sung thêm cổng Stripe/Momo, toàn bộ 100% mã nguồn nghiệp vụ tại tầng Domain và Application được giữ nguyên vẹn.
3. **Khả năng Kiểm thử Tự động Cực Cao (High Testability):**
   - Tầng Application chỉ tương tác với cơ sở dữ liệu thông qua interface `IRepository<T>`. Khi viết Unit Test cho luồng tính tiền hay trừ kho, lập trình viên có thể mock dữ liệu trong bộ nhớ mà không cần bật cơ sở dữ liệu SQL Server thật.

---

## 3. Kiến Trúc Frontend: Feature-based Architecture & Phân Định State

Giao diện người dùng sử dụng **React 19 + TypeScript** được tổ chức theo kiến trúc **Feature-based Architecture** (Kiến trúc theo tính năng) kết hợp phân tầng trách nhiệm nội bộ.

### 3.1. Phân Tách Phân Hệ Rõ Ràng

| Phân hệ Frontend | Đường dẫn thư mục | Layout đảm nhiệm | Trách nhiệm giao diện |
| :--- | :--- | :--- | :--- |
| **Storefront (Bán lẻ)** | `src/features/storefront/`<br>`src/pages/storefront/` | `StorefrontLayout.tsx` | Trải nghiệm mua sắm đẳng cấp Apple: duyệt sản phẩm, xem thông số kỹ thuật phân cấp, đổi biến thể màu/dung lượng tức thì, tìm kiếm nhanh Realtime trên Header, giỏ hàng trực tuyến thông minh, thanh toán đơn hàng và tra cứu đơn bảo mật. |
| **Admin Portal (Quản trị)** | `src/features/admin/`<br>`src/pages/admin/` | `AdminLayout.tsx` | Cổng quản trị tập trung: Dashboard số liệu thời gian thực, Báo cáo thống kê đơn hàng đa chiều và xuất Excel, quản lý sản phẩm chuyên sâu toàn trang (`/admin/products/:id`), quản lý danh mục, màu sắc, dung lượng, người dùng và phân quyền. |
| **Auth Module (Xác thực)** | `src/features/auth/`<br>`src/pages/auth/` | `AuthLayout.tsx` | Biểu mẫu đăng nhập, đăng ký tài khoản khách hàng, đổi mật khẩu và quản lý phiên làm việc bảo mật cho cả hai phân hệ. |

### 3.2. Cấu Trúc Đóng Gói Bên Trong Mỗi Feature

Mỗi module nghiệp vụ (ví dụ: `catalog`, `cart`, `orders`, `vouchers`) được tổ chức thành 6 lớp khép kín:

- `types/`: Định nghĩa kiểu tĩnh TypeScript cho DTOs, request payloads và models.
- `constants/`: Hằng số nội bộ và React Query Keys phục vụ định danh bộ nhớ đệm cache.
- `api/`: Các hàm gọi HTTP thô tới backend thông qua Axios instance dùng chung.
- `hooks/`: **Nơi duy nhất chứa business logic** của tính năng. Sử dụng React Query (`useQuery` cho thao tác đọc và `useMutation` cho thao tác ghi/cập nhật).
- `components/`: Các Pure UI Components nhận dữ liệu qua props, hoàn toàn không gọi API trực tiếp.
- `pages/`: Đóng vai trò **Orchestrator** (Điều phối viên), kết nối dữ liệu từ custom hooks và truyền xuống các components hiển thị.

### 3.3. Phân Định Ranh Giới Quản Lý Trạng Thái (State Management)

| Loại trạng thái | Công nghệ quản lý | Phạm vi lưu trữ | Nguyên tắc vận hành |
| :--- | :--- | :--- | :--- |
| **Server State (Dữ liệu máy chủ)** | **TanStack React Query** | Cache trong bộ nhớ theo query keys | Phụ trách fetch dữ liệu, lưu cache theo thời gian sống (`staleTime`), tự động làm mới ngầm (Refetch on window focus), và cập nhật giao diện lạc quan (Optimistic Updates). |
| **Client State (Trạng thái nội bộ)** | **Zustand** | Bộ nhớ RAM trình duyệt | Chỉ lưu trữ các dữ liệu thuần túy phía client như phiên đăng nhập (thông tin user hiện tại), Access Token, trạng thái đóng/mở sidebar. **Tuyệt đối không lưu cache danh sách API vào Zustand**. |

### 3.4. Kỹ Thuật React Portal Tách Lớp Giao Diện Di Động (Mobile Fullscreen Overlay Pattern)

- **Vấn đề W3C Containing Block:** Khi thanh `<header>` sở hữu thuộc tính `backdrop-filter` (class `backdrop-blur-sm`), theo tiêu chuẩn W3C trình duyệt coi header là containing block cho toàn bộ các phần tử con có `position: fixed`. Hệ quả là overlay tìm kiếm toàn màn hình `fixed inset-0` đặt bên trong header sẽ bị giới hạn chiều cao nghiêm trọng (chỉ bằng đúng 64px của header).
- **Giải pháp Kiến trúc:** Tách lớp hiển thị bằng React Portal (`createPortal(children, document.body)`). Giao diện tìm kiếm trên thiết bị di động được kết xuất trực tiếp vào nút gốc của DOM (`document.body`), giải phóng hoàn toàn khỏi context CSS của header, cho phép overlay mở rộng 100% toàn màn hình thiết bị với top bar chuẩn 64px và danh sách kết quả cuộn mượt mà.

---

## 4. Kiến Trúc Thanh Toán Trực Tuyến VNPay & Webhook IPN Thực Tế

### 4.1. Điểm Khác Biệt Cốt Lõi: Webhook IPN Thật vs Cập Nhật Ảo

Đa số các dự án thương mại điện tử sinh viên hoặc ứng dụng kém hoàn thiện thường mắc lỗi bảo mật chết người: **vừa nhảy sang trang cổng thanh toán hoặc mới bấm nút thanh toán chưa nhập gì thì website đã vội vàng báo đơn hàng "Thanh toán thành công"**.

Hệ thống Urban Stitch giải quyết triệt để bài toán này bằng kiến trúc **Xác thực Kép Phân Ly (Dual-Channel Verification)**:

| Tiêu chí so sánh | Thanh toán thông thường (Kém chất lượng) | Hệ thống Thanh toán Urban Stitch (Chuẩn Doanh Nghiệp) |
| :--- | :--- | :--- |
| **Cơ chế xác nhận thanh toán** | Dựa vào việc người dùng chuyển hướng về trình duyệt (Client-side Redirect). | **Dựa vào Webhook IPN ngầm từ Server VNPay sang Server Backend** kết hợp kiểm tra mã phản hồi `vnp_ResponseCode == "00"`. |
| **Hành vi khi người dùng tắt trình duyệt** | Gặp lỗi mất dấu giao dịch hoặc đơn hàng bị treo vĩnh viễn. | **Bảo toàn dữ liệu 100%**: Server VNPay tự động gọi ngầm webhook IPN tới backend Urban Stitch để cập nhật đơn hàng thành `Paid`, dù khách đã đóng trình duyệt. |
| **Bảo mật chữ ký số** | Không kiểm tra mã băm hoặc chỉ kiểm tra sơ sài. | Kiểm tra mã băm bảo mật **HMAC-SHA512** bằng bí mật `HashSecret` trên cả kênh Return URL và kênh Webhook IPN. Nếu tham số bị can thiệp, giao dịch bị hủy ngay lập tức. |
| **Khả năng thanh toán lại (Retry)** | Nếu lỡ tắt tab hoặc thẻ hết tiền: đơn hàng bị hủy bỏ, khách phải chọn lại sản phẩm từ đầu. | **Khả năng Retry vô hạn**: Khách hàng chỉ cần vào mục "Đơn hàng của tôi", bấm **"Thanh toán qua VNPay"**, hệ thống sinh ngay URL thanh toán mới toanh để thanh toán tiếp. |

---

### 4.2. Bảng Chu Trình Xử Lý Giao Dịch Thanh Toán VNPay Chi Tiết

| Bước | Thực thể thực hiện | Thao tác chi tiết | Trạng thái Đơn hàng | Trạng thái Thanh toán |
| :---: | :--- | :--- | :---: | :---: |
| **1** | Khách hàng (Frontend) | Chọn phương thức thanh toán VNPay và bấm nút **"Đặt hàng"** tại `/checkout`. | Chưa lưu | Chưa lưu |
| **2** | Backend API | Khởi tạo đơn hàng trong cơ sở dữ liệu: tính toán lại tiền, áp dụng voucher, đóng băng snapshot chi tiết mặt hàng, trừ tồn kho tức thì. | `Pending` | `Pending` |
| **3** | Backend (`VnPayService`) | Tạo chuỗi tham số ký số HMAC-SHA512 (`vnp_TxnRef`, `vnp_Amount`, `vnp_CreateDate`...), trả về `paymentUrl` của cổng VNPay Sandbox/Production. | `Pending` | `Pending` |
| **4** | Khách hàng | Được chuyển hướng sang cổng thanh toán VNPay để nhập thông tin thẻ ATM / Quét mã QR VNPay-QR. | `Pending` | `Pending` |
| **5a** | **Kịch bản Khách đóng tab / Hủy ngang** | Khách hàng tắt trình duyệt, thoát ứng dụng hoặc hủy giao dịch tại cổng VNPay. | **Vẫn giữ nguyên `Pending`** | **Vẫn giữ nguyên `Pending`** |
| **5b** | **Kịch bản Khách thanh toán thành công** | Khách hàng nhập mã OTP ngân hàng thành công. Server VNPay ghi nhận trừ tiền thành công. | `Pending` | Đang chờ xác thực |
| **6** | Server VNPay $\rightarrow$ Backend | VNPay gọi ngầm qua kênh Webhook IPN (`GET /api/payment/vnpay-return`) từ máy chủ sang máy chủ. | `Pending` | Chuyển sang `Paid` |
| **7** | Backend (`OrderService`) | Kiểm tra chữ ký số HMAC-SHA512. Kiểm tra số tiền khớp 100%. Ghi nhận thanh toán thành công, ghi chú vào `StatusHistoryJson`. | `Confirmed` | **`Paid`** |
| **8** | Frontend | Trình duyệt chuyển hướng về trang thông báo `/payment/vnpay-return`. Giao diện hiển thị trạng thái đã thanh toán thành công và mã đơn. | `Confirmed` | **`Paid`** |

---

### 4.3. Tính Năng "Ăn Tiền": Retry Thanh Toán Vô Hạn Không Giới Hạn Thời Gian

#### 1. Bài toán Thực tế của Khách hàng Mua sắm

Trong thực tế mua sắm các thiết bị giá trị cao như iPhone 16 Pro Max hay MacBook Pro:

- Khách hàng bấm thanh toán VNPay nhưng tài khoản ngân hàng tạm thời không đủ số dư.
- Khách hàng làm rơi điện thoại, mất kết nối mạng 4G/Wi-Fi hoặc vô tình bấm tắt trình duyệt.
- Khách hàng muốn mở ứng dụng ngân hàng khác để nạp thêm tiền rồi mới thanh toán tiếp.

#### 2. Cơ chế Kỹ thuật Độc quyền của Urban Stitch

- Khi một đơn hàng VNPay được tạo, đơn hàng được lưu trữ an toàn trong Database với trạng thái `Status = Pending` và `PaymentStatus = Pending`.
- Khách hàng có thể truy cập lại trang **"Đơn hàng của tôi" (`/orders`)** hoặc trang **"Tra cứu đơn hàng" (`/order-lookup`)** bất cứ lúc nào (sau 10 phút, 1 giờ hay vài ngày).
- Giao diện hiển thị nút bấm nổi bật **"Thanh toán qua VNPay"**.
- Khi khách hàng nhấn nút:
  - Frontend gọi API `/api/orders/{id}/repay-vnpay` (hoặc tạo lại payment URL).
  - Backend sinh ra một mã giao dịch mới (`vnp_TxnRef` mới gắn với mã đơn gốc), mốc thời gian UTC+7 hiện hành và chữ ký số HMAC-SHA512 mới toanh.
  - Khách hàng được chuyển hướng mượt mà sang cổng VNPay và thanh toán thành công ngay lập tức.
  - **Khách hàng không bao giờ phải chọn lại sản phẩm, không lo bị người khác cướp mất cấu hình đã giữ trong kho.**

#### 3. Chặn Tuyệt Đối Hủy Đơn Sau Khi Đã Thanh Toán Thành Công

- Ngay khi nhận được xác thực `PaymentStatus = Paid` từ VNPay:
  - Backend kiểm tra điều kiện cứng: `if (order.PaymentStatus == PaymentStatus.Paid) throw new DomainException("Đơn hàng đã được thanh toán trực tuyến thành công, không thể hủy bỏ.")`.
  - DTO trả về cho giao diện có cờ `CanCancel => Status == "Pending" && PaymentStatus != "Paid"`.
  - Frontend ẩn hoàn toàn nút "Hủy đơn hàng" trên màn hình của khách và vô hiệu hóa nút hủy đơn trên Admin, bảo vệ toàn vẹn dòng tiền của doanh nghiệp.

---

## 5. Cơ Chế Kiểm Soát Tương Tranh Đa Tầng (3-Tier Concurrency Defense)

Xử lý triệt để bài toán **"Nhiều người cùng đặt mà hàng sắp hết" (Overselling / Race Condition)** trong các đợt mở bán cao điểm:

| Tầng kiểm soát | Công nghệ triển khai | Cơ chế bảo vệ chi tiết |
| :---: | :--- | :--- |
| **Tầng 1: Khóa Bộ nhớ RAM** | `SemaphoreSlim` & Lock Ordering theo `VariantId` | - Sử dụng `ConcurrentDictionary<int, SemaphoreSlim>` cấp phát một khóa độc quyền cho từng biến thể sản phẩm.<br>- **Nguyên tắc Lock Ordering chống Deadlock:** Khi một đơn hàng chứa nhiều sản phẩm (ví dụ vừa mua iPhone vừa mua AirPods), hệ thống **bắt buộc sắp xếp danh sách mã biến thể theo thứ tự ID tăng dần (`OrderBy(x => x.VariantId)`) trước khi xin khóa**. Quy tắc này triệt tiêu hoàn toàn khả năng xảy ra Deadlock chéo giữa các luồng giao dịch song song. |
| **Tầng 2: Giao dịch CSDL Toàn vẹn** | SQL Server ACID Database Transaction | - Toàn bộ chuỗi thao tác: Đọc tồn kho $\rightarrow$ Kiểm tra đủ hàng $\rightarrow$ Trừ tồn kho $\rightarrow$ Tạo đơn $\rightarrow$ Lưu chi tiết mặt hàng $\rightarrow$ Xóa giỏ hàng được bọc trong một `IDatabaseTransaction` duy nhất.<br>- Bất kỳ lỗi phát sinh nào ở giữa chu trình đều kích hoạt lệnh `ROLLBACK` tự động, bảo đảm cơ sở dữ liệu không bao giờ bị rơi vào trạng thái rác hoặc sai lệch số dư tồn kho. |
| **Tầng 3: Khóa Lạc quan Database** | SQL Server `RowVersion` (Timestamp) | - Cột `RowVersion` trên bảng `catalog.ProductVariants` tự động sinh chuỗi nhị phân mới mỗi khi có bản ghi bị thay đổi.<br>- Entity Framework Core cập nhật với điều kiện `WHERE Id = @Id AND RowVersion = @OriginalRowVersion`.<br>- Nếu có luồng khác đã trừ kho trước đó một phần nghìn giây, câu lệnh trả về 0 dòng và hệ thống ném ngoại lệ `DbUpdateConcurrencyException`, giao dịch tự động dừng lại an toàn và thông báo cho khách hàng sản phẩm đã hết hàng. |

---

## 6. Động Cơ Báo Cáo Thống Kê & Phân Tích Kinh Doanh (Business Intelligence Engine)

Hệ thống cung cấp trung tâm báo cáo điều hành toàn diện tại `/admin/reports` và `/admin/dashboard`:

### 6.1. Kiến Trúc Thu Thập Dữ Liệu & Bộ Chỉ Số Hiệu Suất (KPI Cards)

| Thẻ đo lường KPI | Công thức tính toán từ CSDL | Ý nghĩa điều hành doanh nghiệp |
| :--- | :--- | :--- |
| **Doanh thu thực thu** | `SUM(TotalAmount)` của các đơn có `Status IN ('Completed', 'Delivered') AND PaymentStatus = 'Paid'` | Số tiền thực tế đã về tài khoản doanh nghiệp (loại bỏ hoàn toàn đơn ảo, đơn hủy). |
| **Doanh số gộp ước tính** | `SUM(Subtotal)` của các đơn phát sinh trừ đi các đơn hủy (`Cancelled`) | Thước đo quy mô giao dịch phát sinh trên toàn hệ thống trong kỳ. |
| **Tổng số đơn hàng** | `COUNT(Id)` của toàn bộ đơn hàng phát sinh trong khoảng thời gian đã chọn | Đo lường lưu lượng mua sắm và tải vận hành của bộ phận xử lý đơn. |
| **Tỷ lệ hoàn tất đơn** | `(Số đơn Completed + Delivered) / Tổng số đơn * 100%` | Chỉ số đánh giá chất lượng giao vận và mức độ hài lòng của khách hàng. |
| **Giá trị đơn trung bình (AOV)** | `Doanh thu thực thu / Số đơn hàng thành công` | Thước đo giỏ hàng trung bình để ra quyết định chiến lược up-sell / cross-sell. |
| **Tiền voucher đã ưu đãi** | `SUM(DiscountAmount)` của các đơn hàng đã áp dụng mã khuyến mãi | Đo lường chi phí ngân sách khuyến mãi đã chi trả để thu hút khách hàng. |

### 6.2. Phân Tích Đa Chiều & Xuất Báo Cáo Excel OpenXML Chuẩn Doanh Nghiệp

- **Biểu đồ Xu hướng Doanh thu Kép:** Truy vấn nhóm theo chu kỳ thời gian thực (Hôm nay, Hôm qua, 7 ngày, 30 ngày, Tháng này, Tháng trước, Năm nay).
- **Phân bổ Trạng thái Đơn hàng:** 6 trạng thái trực quan (*Chờ xử lý*, *Đã xác nhận*, *Đang giao*, *Đã giao*, *Hoàn tất*, *Đã hủy*).
- **Cơ cấu Kênh Thanh toán:** Tỷ lệ phân bổ giữa Cổng thanh toán trực tuyến VNPay và Tiền mặt khi nhận hàng (COD).
- **Cơ cấu Tồn kho Danh mục:** Thống kê trực quan số lượng tồn kho theo 7 ngành hàng Apple.
- **Xuất Báo cáo Excel Chuẩn OpenXML:** Hệ thống phát sinh trực tiếp tệp bảng tính `.xlsx` từ luồng stream dữ liệu bộ nhớ, bao gồm tiêu đề doanh nghiệp, ngày xuất, định dạng số tiền VND chuẩn mực, và danh sách chi tiết toàn bộ đơn hàng thỏa mãn tiêu chí lọc.

---

## 7. Hạ Tầng Khởi Chạy Container Docker Tuần Tự (Deterministic Docker Orchestration)

Quy trình khởi chạy Docker Compose tuân thủ nghiêm ngặt 3 giai đoạn không sai lệch:

| Giai đoạn | Dịch vụ đảm nhiệm | Trạng thái kiểm tra | Điều kiện tiên quyết để kích hoạt bước kế tiếp |
| :---: | :--- | :--- | :--- |
| **Giai đoạn 1** | `sqlserver` | Microsoft SQL Server 2022 | Healthcheck chạy câu lệnh `sqlcmd SELECT 1`. Khi trả về 1, container chuyển sang trạng thái `Healthy`. |
| **Giai đoạn 2** | `db-init` | Trình nạp khởi tạo Idempotent | - Nhận diện biến môi trường `${DB_NAME:-AppleStoreDb}` từ `.env`.<br>- Kiểm tra nếu chưa có cơ sở dữ liệu: tự động tạo `CREATE DATABASE`.<br>- Kiểm tra số lượng sản phẩm trong bảng `[catalog].[Products]`. Nếu = 0: tự động chạy script `seed-data.sql` nạp toàn bộ cấu hình Apple 2022-2026, thông số, voucher và đơn hàng.<br>- Nếu đã có dữ liệu: lập tức bỏ qua để bảo toàn dữ liệu giao dịch thực tế.<br>- Khi hoàn tất thành công, container thoát với exit code 0 (`service_completed_successfully`). |
| **Giai đoạn 3** | `backend` | ASP.NET Core 8 Web API | Khởi động sau khi `sqlserver` đã Healthy và `db-init` đã hoàn thành thành công. Chạy kiểm tra kết nối, đồng bộ EF Core Migrations, thực thi `ApplicationDbSeeder`. Healthcheck `curl http://localhost:8080/health` đạt 200 OK chuyển sang `Healthy`. |
| **Giai đoạn 4** | `frontend` & `ngrok` | Nginx React SPA & Ngrok Tunnel | Khởi động sau khi `backend` đã Healthy. Frontend lắng nghe cổng 3088, Ngrok mở tunnel kết nối cổng 8088. Toàn bộ hệ thống sẵn sàng phục vụ 100%. |
