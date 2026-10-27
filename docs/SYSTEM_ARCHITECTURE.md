# Kiến Trúc Hệ Thống (System Architecture)

> Tài liệu mô tả nguyên lý thiết kế kiến trúc tổng thể của hệ thống thương mại điện tử Urban Stitch, tập trung vào mô hình phân tầng hướng tâm **Onion Architecture** cho Backend, mô hình **Feature-based Architecture** cho Frontend và luồng xử lý dữ liệu khép kín xuyên suốt hệ thống.

---

## 1. Danh sách Công nghệ Sử dụng Cốt lõi

Hệ thống được xây dựng tinh gọn dựa trên 3 công nghệ trụ cột:

| Nền tảng | Công nghệ | Vai trò & Đặc điểm |
| :--- | :--- | :--- |
| **Cơ sở dữ liệu** | **SQL Server** | Hệ quản trị cơ sở dữ liệu quan hệ mạnh mẽ, lưu trữ toàn bộ dữ liệu nghiệp vụ, hỗ trợ transaction ACID, khóa lạc quan (`rowversion`) và phân tách schema độc lập. |
| **Backend** | **.NET 8** | Nền tảng phát triển ứng dụng Web API hiệu năng cao của Microsoft, xây dựng theo nguyên lý Clean Architecture / Onion Architecture với cơ chế Dependency Injection nguyên bản. |
| **Frontend** | **ReactJS** | Thư viện xây dựng giao diện người dùng theo mô hình Single Page Application (SPA), tổ chức mã nguồn theo kiến trúc Feature-based hỗ trợ mở rộng quy mô linh hoạt. |

---

## 2. Kiến trúc Backend: Mô hình Onion Architecture

Backend của dự án được triển khai dựa trên nguyên lý **Clean Architecture**, cụ thể hóa qua mô hình **Onion Architecture** (Kiến trúc củ hành). Đặc điểm cốt lõi của mô hình này là **chiều phụ thuộc một chiều nghiêm ngặt hướng vào tâm** (Dependency Inversion Principle).

### Bảng Mô Hình Phân Tầng Onion Architecture (Từ Ngoài Vào Trong)

| Vị trí tầng | Tên tầng (Layer) | Thành phần chính bên trong | Chiều phụ thuộc (Dependency) |
| :---: | :--- | :--- | :--- |
| **Lớp 4 (Cổng ngoài)** | **Host** | ASP.NET Core Web API, Controllers (Public & Manager), Middleware xử lý lỗi, Action Filters chuẩn hóa ApiResponse, Cấu hình Dependency Injection. | Phụ thuộc vào Application, Infrastructure và Domain. |
| **Lớp 3 (Hạ tầng)** | **Infrastructure** | Entity Framework Core, DbContext, Fluent API configurations, SQL Server Provider, ASP.NET Core Identity, Dịch vụ VNPay, Cloudinary Media. | Triển khai các Interface của tầng Application, phụ thuộc vào Domain. |
| **Lớp 2 (Ứng dụng)** | **Application** | Use Cases, Features nghiệp vụ, DTOs (Request / Response), Specifications truy vấn, Service Interfaces (IVnPayService, IRepository, IDatabaseTransaction). | Chỉ phụ thuộc duy nhất vào Domain. Tuyệt đối không phụ thuộc Infrastructure hay Host. |
| **Lớp 1 (Tâm lõi)** | **Domain** | Các thực thể cốt lõi (Entities: Category, Product, ProductVariant, Order...), Value Objects, Domain Exceptions, BaseEntity. | Độc lập tuyệt đối. Không phụ thuộc vào bất kỳ thư viện hay framework bên ngoài nào. |

---

### 2.1. Vì sao chọn Kiến trúc Onion trên nguyên lý Clean Architecture?

Kiến trúc Onion được lựa chọn để giải quyết triệt để các bài toán sống còn của một hệ thống thương mại điện tử quy mô lớn:

#### 1. Cô lập Nghiệp vụ Cốt lõi khỏi Công nghệ (Domain Isolation)
- **Bản chất:** Quy tắc nghiệp vụ (Business Rules - cách tính giá biến thể, điều kiện giảm giá, trừ tồn kho, quy chuẩn danh mục Apple) là tài sản quan trọng nhất của doanh nghiệp, không bao giờ được phép phụ thuộc vào công cụ bên ngoài.
- **Thực thi:** Tầng `Domain` nằm ở trung tâm và độc lập hoàn toàn. Mã nguồn trong Domain là C# thuần túy (POCO), **không chứa bất kỳ dòng code nào của EF Core, SQL Server, Web framework hay thư viện bên thứ ba**. Công nghệ có thể lỗi thời hoặc thay đổi, nhưng nghiệp vụ kinh doanh thì bất biến.

#### 2. Dễ dàng Thay đổi & Mở rộng Công nghệ (Pluggable Infrastructure)
- **Tính linh hoạt cao:** Hạ tầng công nghệ (Cơ sở dữ liệu, ORM, dịch vụ lưu trữ file, mailer) chỉ được xem là các "chi tiết kỹ thuật bên ngoài" (External Details / Plugins) và phải cắm vào hệ thống thông qua các giao diện trừu tượng (`Interfaces`) do tầng `Application` định nghĩa.
- **Ví dụ thực tế:** Hôm nay dự án đang dùng **SQL Server** làm database lưu trữ thông qua `Infrastructure`. Nếu trong tương lai doanh nghiệp quyết định chuyển sang **MySQL**, **PostgreSQL** để tiết kiệm chi phí bản quyền, hoặc bổ sung **MongoDB** để lưu log sự kiện:
  - Lập trình viên chỉ cần tạo một project hạ tầng mới (ví dụ `Infrastructure.MySql`), triển khai lại các interface `IAppDbContext` và `IRepository<T>`.
  - Sau đó, chỉ cần đổi **duy nhất một dòng đăng ký Dependency Injection (DI)** trong file khởi tạo `Program.cs`.
  - **Toàn bộ 100% mã nguồn nghiệp vụ tại tầng Domain và Application được giữ nguyên vẹn**, không phải sửa đổi, viết lại hay kiểm thử lại từ đầu.

#### 3. Dễ dàng Mở rộng Quy mô (Scalability & Maintainability)
- Việc phân tách ranh giới rõ ràng ngăn chặn tình trạng "code spaghetti" (phụ thuộc vòng chằng chịt).
- Khi có thành viên mới tham gia dự án, họ có thể phát triển thêm tính năng mới trong `Application/Features` theo đúng khuôn mẫu (DTOs $\rightarrow$ Specifications $\rightarrow$ Service) mà không lo làm ảnh hưởng hay phá vỡ các tính năng khác đã hoàn thiện.

#### 4. Khả năng Kiểm thử Độc lập Cực cao (High Testability)
- Tầng Application chỉ tương tác với cơ sở dữ liệu thông qua interface `IRepository<T>`. 
- Khi viết Unit Test cho luồng tạo đơn hàng, tính tiền hay trừ tồn kho, lập trình viên có thể dễ dàng giả lập (Mock) dữ liệu bộ nhớ mà **không cần phải khởi động database SQL Server thật, không cần mở kết nối mạng**. Nhờ đó, kịch bản test chạy siêu tốc và ổn định tuyệt đối.

---

### 2.2. Trách nhiệm của từng Phân tầng

| Phân tầng | Vị trí | Trách nhiệm chính | Chiều phụ thuộc (References) |
| :--- | :--- | :--- | :--- |
| **Domain** | Tâm điểm | Lưu trữ các thực thể nghiệp vụ (`Category`, `Product`, `ProductVariant`, `Order`...), các exception nghiệp vụ, hằng số và base entity. | **Độc lập tuyệt đối**. Không reference bất kỳ project nào. |
| **Application** | Lớp giữa | Định nghĩa các ca sử dụng (Use Cases), DTOs request/response, Specifications truy vấn phân trang, Services xử lý luồng logic và Interfaces trừu tượng (`IRepository`, `IAppDbContext`). | **Chỉ reference Domain**. Cấm reference Infrastructure hay Host. |
| **Infrastructure** | Lớp ngoài | Hiện thực hóa kỹ thuật các interface: EF Core DbContext, cấu hình bảng Fluent API, kết nối SQL Server, ASP.NET Core Identity, Refresh Token, Cloudinary. | **Reference Application và Domain**. |
| **Host** | Cổng vào | Khởi chạy Web API, cấu hình Dependency Injection, Controllers (`Manager` và `Public`), Filters chuẩn hóa `ApiResponse`, Middleware xử lý lỗi toàn cục. | **Reference cả 3 tầng** để lắp ráp thành ứng dụng hoàn chỉnh. |

---

## 3. Kiến trúc Frontend: Feature-based Architecture

Giao diện người dùng sử dụng **ReactJS** được tổ chức theo kiến trúc **Feature-based Architecture** (Kiến trúc theo tính năng) kết hợp phân tầng trách nhiệm nội bộ.

### 3.1. Phân tách Phân hệ Độc lập
Hệ thống chia tách độc lập 2 phân hệ lớn:
1. **Storefront (`src/features/storefront`, `src/pages/storefront`):** Giao diện bán hàng cao cấp cho người tiêu dùng (`StorefrontLayout`), phục vụ xem sản phẩm, đổi biến thể màu/dung lượng tức thì, tìm kiếm gần đúng Realtime trên thanh Header đa nền tảng (`StorefrontHeader.tsx`), giỏ hàng trực tuyến (`src/features/storefront/cart`) hỗ trợ khách vãng lai, tự động gộp giỏ hàng khi đăng nhập, đổi phân loại trong giỏ và tự phục hồi số lượng tồn kho.
2. **Admin Portal (`src/features/admin`, `src/pages/admin`):** Cổng quản trị tập trung (`AdminLayout`), sidebar điều hướng đa cấp, dashboard số liệu, quản lý danh mục, sản phẩm, biến thể, màu sắc, cấu hình hệ thống.
3. **Module Xác thực dùng chung (`src/features/auth`):** Cung cấp các biểu mẫu đăng nhập, đăng ký và cơ chế lưu trữ phiên làm việc an toàn cho cả hai phân hệ.

### 3.2. Cấu trúc Phân tầng Nội bộ Feature
Mỗi module nghiệp vụ (ví dụ: `catalog`, `cart`, `auth`) được đóng gói khép kín thành các tầng:
- `types/`: Định nghĩa kiểu tĩnh TypeScript cho DTOs, payload và models.
- `constants/`: Hằng số nội bộ và query keys phục vụ việc định danh bộ nhớ đệm cache.
- `api/`: Các hàm gọi HTTP thô tới backend, sử dụng cấu hình Axios instance dùng chung.
- `hooks/`: **Nơi duy nhất chứa business logic** của tính năng. Sử dụng React Query (`useQuery` cho thao tác đọc và `useMutation` cho thao tác ghi/cập nhật).
- `components/`: Các Pure UI Components nhận dữ liệu qua props, hoàn toàn không gọi API trực tiếp.
- `pages/`: Đóng vai trò **Orchestrator** (Điều phối viên), kết nối dữ liệu từ custom hooks và truyền xuống các components hiển thị.

### 3.3. Phân định Ranh giới Quản lý Trạng thái (State Management)
Hệ thống phân tách rạch ròi 2 dạng trạng thái:
- **Server State (Dữ liệu máy chủ):** Được quản lý toàn diện bởi React Query. Phụ trách tự động fetch, lưu cache theo thời gian sống (`staleTime`), đồng bộ hóa dữ liệu ngầm và cập nhật giao diện lạc quan (Optimistic Update).
- **Client State (Trạng thái nội bộ ứng dụng):** Được quản lý bởi Zustand. Chỉ lưu trữ các dữ liệu thuần túy phía client như phiên đăng nhập (thông tin user hiện tại), trạng thái đóng/mở sidebar. **Tuyệt đối không lưu cache danh sách API vào Zustand**.

### 3.4. Kỹ thuật React Portal Tách Lớp Giao diện Di động (Mobile Fullscreen Overlay Pattern)
- **Vấn đề W3C Containing Block:** Khi một phần tử cha (cụ thể là thẻ `<header>`) sở hữu thuộc tính `backdrop-filter` (ví dụ class Tailwind `backdrop-blur-sm`), theo tiêu chuẩn W3C trình duyệt sẽ coi phần tử đó là containing block cho toàn bộ các phần tử con có `position: fixed`. Hệ quả là một overlay toàn màn hình `fixed inset-0` đặt bên trong header sẽ bị giới hạn chiều cao nghiêm trọng (chỉ bằng đúng chiều cao 64px của header).
- **Giải pháp Kiến trúc:** Tách lớp hiển thị bằng React Portal (`createPortal(children, document.body)`). Giao diện tìm kiếm trên thiết bị di động được kết xuất trực tiếp vào nút gốc của DOM (`document.body`), giải phóng hoàn toàn khỏi context CSS của header, cho phép overlay mở rộng 100% toàn màn hình thiết bị với thanh điều hướng top bar chuẩn mực và danh sách kết quả cuộn mượt mà.

---

## 4. Luồng Xử lý Dữ liệu Toàn diện (End-to-End Data Flow)

Thay vì biểu đồ sequence đồ họa dễ lỗi định dạng trên markdown, quy trình xử lý dữ liệu khép kín được thể hiện chi tiết theo từng bước dưới đây:

| Bước | Thành phần | Hành vi & Xử lý | Dữ liệu đầu vào / đầu ra |
| :---: | :--- | :--- | :--- |
| **1** | **Người dùng (Client)** | Tương tác trên giao diện Storefront / Admin (nhấn xem sản phẩm, gửi form thêm biến thể, đặt hàng). | Sự kiện click, input form. |
| **2** | **React Page (Orchestrator)** | Tiếp nhận sự kiện, điều phối và kích hoạt Custom Hook tương ứng trong thư mục `hooks/`. | Gọi hook nghiệp vụ (ví dụ `useCatalog`). |
| **3** | **Custom Hook (React Query)** | Kích hoạt `useQuery` hoặc `useMutation`, gọi hàm API trong thư mục `api/`. | Payload request. |
| **4** | **Axios Client Interceptor** | Tự động đính kèm Bearer Token (nếu có trong RAM), thiết lập header JSON và gửi HTTP Request. | Gửi HTTP POST/GET/PUT/DELETE qua mạng. |
| **5** | **ASP.NET Core Web API (Host)** | Middleware kiểm tra JWT xác thực phiên làm việc; Controller tiếp nhận Request DTO. | Giải mã Token, kiểm tra quyền hạn (Role). |
| **6** | **Application Service** | Thực thi quy tắc nghiệp vụ, kiểm tra ràng buộc duy nhất (Name/Slug), đóng gói Specification. | Chuyển Request DTO thành Specification. |
| **7** | **Repository & DbContext (Infra)** | Áp dụng Global Query Filter (`IsDeleted = 0`), biên dịch Specification thành câu lệnh T-SQL. | Tạo truy vấn SQL thông qua EF Core. |
| **8** | **SQL Server (Database)** | Thực thi câu lệnh SQL trên schema tương ứng, xử lý transaction và kiểm tra khóa lạc quan (`RowVersion`). | Đọc/Ghi dữ liệu vật lý trên ổ đĩa. |
| **9** | **Application Service** | Nhận thực thể Domain từ EF Core, thực hiện ánh xạ (Mapping) dữ liệu sang Response DTO. | Chuyển Entity thành Response DTO. |
| **10** | **ApiResponseFilter (Host)** | Tự động bọc kết quả vào khuôn mẫu chuẩn: `{ data, meta: { statusCode, timestamp, traceId }, error: null }`. | HTTP Response 200 OK kèm JSON chuẩn. |
| **11** | **Axios Interceptor & Hook** | Axios unwrap response; React Query tự động cập nhật cache, làm mới query liên quan (`invalidateQueries`). | Dữ liệu mới được đồng bộ vào cache. |
| **12** | **React UI Component** | Giao diện tự động re-render mượt mà hiển thị kết quả mới tới người dùng mà không cần tải lại toàn bộ trang. | UI cập nhật tức thì. |

---

## 5. Kiến trúc Thanh toán Trực tuyến & Kiểm soát Tương tranh (Online Payment & Concurrency Control)

> Phân hệ thanh toán trực tuyến và kiểm soát tồn kho là trọng tâm kỹ thuật quan trọng nhất của hệ thống thương mại điện tử Urban Stitch, bảo đảm tính toàn vẹn dữ liệu tài chính, chống bán vượt tồn kho (overselling) và duy trì trải nghiệm người dùng liền mạch ngay cả trong điều kiện chịu tải cao.

---

### 5.1. Thiết kế Phân tầng theo Clean Architecture

Dịch vụ tích hợp cổng thanh toán VNPay được thiết kế tuân thủ nghiêm ngặt nguyên lý đảo ngược phụ thuộc (Dependency Inversion Principle) của Clean Architecture:

| Phân tầng | Tệp nguồn / Thành phần | Trách nhiệm kỹ thuật |
| :--- | :--- | :--- |
| **Application** | `Application/Common/Services/IVnPayService.cs` | Định nghĩa hợp đồng trừu tượng (Interface) cho cổng thanh toán: tạo URL thanh toán (`CreatePaymentUrl`), xử lý phản hồi trình duyệt (`ProcessCallback`) và xử lý Webhook (`ProcessIpn`). Định nghĩa các DTOs: `VnPayRequestDto`, `VnPayResponseDto`, `VnPayIpnResponseDto`. Tầng này hoàn toàn không phụ thuộc thư viện thanh toán cụ thể. |
| **Infrastructure** | `Infrastructure/Payments/VnPayService.cs` | Triển khai chi tiết kỹ thuật của `IVnPayService`: cài đặt thư viện VNPAY.NET, cấu hình thuật toán mã hóa băm HMAC-SHA512, đóng gói tham số truy vấn, xác thực chữ ký kiểm tra tính hợp lệ và xử lý chuẩn hóa múi giờ Việt Nam (UTC+7). |
| **Host** | `Host/Controllers/Public/OrdersController.cs` | Đăng ký dịch vụ vào DI Container (`builder.Services.AddScoped<IVnPayService, VnPayService>()`), tiếp nhận các yêu cầu thanh toán lại (`POST /api/orders/{id}/repay-vnpay`), đón nhận Return URL từ trình duyệt khách hàng và tiếp nhận IPN Webhook trực tiếp từ máy chủ VNPay. |

---

### 5.2. Cơ chế Kiểm soát Tương tranh 3 Lớp Chống Bán Vượt Tồn Kho (Overselling Protection)

#### 1. Bài toán Thực tế
Trong các đợt mở bán sản phẩm "Hot" (ví dụ: iPhone 16 Pro Max phiên bản giới hạn chỉ còn 1 chiếc cuối cùng trong kho), hàng chục người dùng có thể cùng nhấn nút "Đặt hàng" vào cùng một mili-giây. Nếu hệ thống xử lý song song không được kiểm soát:
- Cả 10 luồng cùng đọc số lượng tồn kho `QuantityInStock = 1` tại cùng một thời điểm.
- Cả 10 luồng đều vượt qua điều kiện kiểm tra tồn kho (`1 >= 1`).
- Cả 10 luồng cùng trừ tồn kho và tạo 10 đơn hàng thành công, dẫn đến tình trạng bán âm tồn kho (`QuantityInStock = -9`), gây thiệt hại nghiêm trọng về uy tín và chi phí đền bù của doanh nghiệp.

#### 2. Giải pháp: Cơ chế Khóa 3 Lớp (3-Tier Concurrency Defense)

| Lớp bảo vệ | Tầng thực thi | Cơ chế kỹ thuật | Vai trò & Cách thức hoạt động |
| :---: | :--- | :--- | :--- |
| **Lớp 1** | **Ứng dụng (.NET Memory)** | `ConcurrentDictionary<int, SemaphoreSlim>` kết hợp **Lock Ordering** | - Quản lý khóa tương tranh cấp độ hạt mịn (Fine-grained Lock) theo từng mã biến thể `ProductVariantId`.<br>- **Nguyên tắc Lock Ordering (Chống Deadlock):** Trước khi lấy khóa, danh sách `ProductVariantId` trong đơn hàng bắt buộc phải được sắp xếp theo thứ tự ID tăng dần (`items.Select(x => x.VariantId).Distinct().OrderBy(id => id)`). Nếu Đơn hàng A mua (món 1, món 2) và Đơn hàng B mua (món 2, món 1), cả 2 luồng đều buộc phải xin khóa món 1 trước, sau đó mới xin khóa món 2. Cơ chế này loại bỏ 100% rủi ro xảy ra Deadlock chéo (Lock Inversion).<br>- Tại một thời điểm, chỉ duy nhất 1 luồng được quyền kiểm tra và trừ tồn kho cho biến thể đó. |
| **Lớp 2** | **Giao dịch (Database)** | `IDatabaseTransaction` (ACID Transaction) | - Toàn bộ chuỗi thao tác: Đọc tồn kho mới nhất $\rightarrow$ Kiểm tra đủ hàng $\rightarrow$ Trừ tồn kho $\rightarrow$ Tạo đơn `Orders` $\rightarrow$ Lưu chi tiết `OrderItems` $\rightarrow$ Ghi log `StatusHistoryJson` $\rightarrow$ Xóa giỏ hàng được đóng gói trong một Transaction duy nhất (`_appDbContext.BeginTransactionAsync()`).<br>- Nếu xảy ra bất kỳ lỗi ngoại lệ nào ở bất kỳ bước nào, toàn bộ giao dịch tự động `Rollback` nguyên trạng, tuyệt đối không để lại dữ liệu rác hay tình trạng trừ kho mà không có đơn. |
| **Lớp 3** | **Cơ sở dữ liệu (SQL Server)** | Khóa lạc quan với `[Timestamp] byte[] RowVersion` | - Cột `RowVersion` trên bảng `catalog.ProductVariants` tự động thay đổi giá trị nhị phân sau mỗi câu lệnh UPDATE vật lý trên đĩa.<br>- Nếu có bất kỳ tiến trình nền nào khác can thiệp sửa đổi biến thể trong lúc giao dịch đang diễn ra, EF Core lập tức phát hiện xung đột phiên bản và ném `DbUpdateConcurrencyException`, chặn đứng hoàn toàn việc ghi đè sai lệch dữ liệu. |

---

### 5.3. Quy tắc Nghiệp vụ Quản lý Tồn kho & Vòng đời Đơn hàng

Hệ thống thiết lập các quy tắc nghiệp vụ chặt chẽ nhằm bảo đảm tính nhất quán giữa kho hàng thực tế và giao dịch tài chính:

| Quy tắc nghiệp vụ | Thời điểm kích hoạt | Cách thức xử lý chi tiết | Ý nghĩa thực tiễn |
| :--- | :--- | :--- | :--- |
| **Trừ tồn kho tức thì** | Ngay khi tạo đơn hàng thành công ở trạng thái `Pending` (Chờ xử lý) | - Áp dụng cho **cả phương thức COD lẫn VNPay**.<br>- Hệ thống lập tức trừ `QuantityInStock` của biến thể tương ứng ngay khi bấm Đặt hàng.<br>- Đơn hàng được khởi tạo với trạng thái `Status = Pending` và `PaymentStatus = Pending` (đối với VNPay) hoặc `PaymentStatus = Pending` (đối với COD). | - Giữ hàng công bằng cho người mua đã chốt đơn.<br>- Ngăn chặn tình trạng khách hàng đang thao tác nhập mã OTP thẻ trên cổng VNPay thì biến thể bị người khác mua mất. |
| **Hoàn trả tồn kho tự động** | Khi đơn hàng chuyển sang trạng thái `Cancelled` (Đã hủy) | - Kích hoạt khi khách hàng hủy đơn hợp lệ hoặc Quản trị viên hủy đơn.<br>- Hệ thống duyệt qua từng mục hàng `OrderItems`, cộng trả lại chính xác số lượng `Quantity` vào `QuantityInStock` của từng biến thể.<br>- Đồng thời hoàn trả lượt sử dụng voucher nếu đơn hàng có áp dụng mã giảm giá. | - Phục hồi số lượng hàng hóa vào kho để những khách hàng khác có thể tiếp tục đặt mua. |
| **Chặn tuyệt đối hủy đơn khi đã thanh toán** | Bất kỳ thời điểm nào sau khi đơn hàng đạt `PaymentStatus = Paid` | - **Phía Backend:** `PublicOrderService.CancelOrderAsync` và `OrderService.CancelOrderAsync` kiểm tra điều kiện `if (order.PaymentStatus == PaymentStatus.Paid) throw new DomainException(...)`. Ngoại lệ nghiệp vụ chặn đứng mọi request hủy đơn qua API.<br>- **Thuộc tính tính toán DTO:** `CanCancel => Status == "Pending" && PaymentStatus != "Paid"`.<br>- **Phía Frontend:** Giao diện Storefront ("Đơn hàng của tôi") ẩn hoàn toàn nút "Hủy đơn hàng". Giao diện Quản trị viên (Admin Drawer & Modal) vô hiệu hóa tùy chọn "Hủy đơn" đối với các đơn đã thanh toán. | - Loại bỏ triệt để rủi ro thất thoát tài chính và gian lận (khách hàng đã thanh toán xong nhấn hủy để đòi hoàn kho trong khi tiền đã vào tài khoản cửa hàng).<br>- Muốn can thiệp đơn đã thanh toán, phải thực hiện theo quy trình Hoàn tiền (Refund) và xử lý đổi trả có biên bản. |

---

### 5.4. Cơ chế Thanh toán lại Linh hoạt Không Giới Hạn Thời Gian (Flexible Repayment)

Trước đây, một số hệ thống áp đặt thời hạn thanh toán lại 15 phút, gây khó khăn cho khách hàng khi gặp sự cố thẻ, tài khoản ngân hàng chưa kịp nạp tiền hoặc kết nối mạng bị gián đoạn. Urban Stitch đã tái cấu trúc cơ chế này:

| Đặc điểm | Giải pháp thiết kế |
| :--- | :--- |
| **Bỏ giới hạn thời gian** | Khách hàng sở hữu đơn hàng có phương thức `VNPAY`, trạng thái `Status = Pending` và chưa thanh toán (`PaymentStatus != Paid`) có thể truy cập vào mục "Đơn hàng của tôi" (`/orders`) và nhấn nút **"Thanh toán qua VNPay"** bất kỳ lúc nào mà không bị giới hạn thời gian. |
| **Sinh URL thanh toán mới độc lập** | Endpoint `POST /api/orders/{id}/repay-vnpay` sinh ra URL thanh toán VNPay mới với mã tham chiếu giao dịch độc nhất và mốc thời gian UTC+7 hiện tại, cho phép giao dịch được gửi sang VNPay như một phiên thanh toán mới toanh. |
| **Bảo lưu tồn kho an toàn** | Do tồn kho đã được trừ ngay khi tạo đơn ban đầu, sản phẩm của khách hàng luôn được giữ nguyên trong kho an toàn trong suốt thời gian khách cân nhắc hoặc chuẩn bị phương tiện thanh toán. |

---

### 5.5. Quy trình Xác thực Kép: Return URL & IPN Webhook

Để bảo đảm tính tin cậy tuyệt đối và chống gian lận dữ liệu từ phía máy trạm (Client Manipulation), hệ thống sử dụng cơ chế xác thực kép qua 2 kênh độc lập:

| Tiêu chí | Kênh 1: Return URL (Client-side Redirect) | Kênh 2: IPN Webhook (Server-to-Server Callback) |
| :--- | :--- | :--- |
| **Kênh truyền tải** | Trình duyệt người dùng được cổng thanh toán VNPay chuyển hướng (HTTP GET 302) quay trở lại URL giao diện Storefront (`/checkout/success`). | Máy chủ của VNPay gọi trực tiếp bằng HTTP GET ngầm tới Webhook API của Backend Urban Stitch (`/api/orders/vnpay-ipn`). |
| **Độ tin cậy** | Trung bình. Có thể bị can thiệp bởi người dùng sửa đổi tham số URL hoặc bị mất kết nối mạng khi chuyển hướng từ VNPay về web. | **Tuyệt đối an toàn**. Kết nối mạng máy chủ - máy chủ độc lập, không phụ thuộc vào trình duyệt của người dùng. |
| **Vai trò chính** | Cập nhật giao diện người dùng tức thời, thông báo kết quả thanh toán thành công hoặc thất bại cho khách hàng ngay trên màn hình. | Là kênh **đối soát tài chính chính thức**. Đảm bảo đơn hàng luôn được cập nhật sang `Paid` ngay cả khi người dùng tắt trình duyệt ngay sau khi chuyển tiền. |
| **Cơ chế Idempotency** | Kiểm tra trạng thái đơn: Nếu đơn đã được cập nhật thành `Paid` bởi IPN trước đó, Return URL chỉ hiển thị thông báo thành công mà không cập nhật lại trạng thái lần 2. | Kiểm tra trạng thái đơn: Nếu đơn đã là `Paid`, IPN trả về ngay mã phản hồi `{"RspCode":"02","Message":"Order already confirmed"}` cho VNPay, chống ghi nhận trùng lặp giao dịch. |
| **Kiểm tra chữ ký (Checksum)** | Giải mã toàn bộ tham số URL, sắp xếp theo thứ tự bảng chữ cái và kiểm tra mã băm HMAC-SHA512 với `HashSecret`. | Tương tự, kiểm tra chữ ký HMAC-SHA512. Nếu chữ ký không khớp, lập tức từ chối và phản hồi `{"RspCode":"97","Message":"Invalid Checksum"}`. |

---

### 5.6. Bảng Ma trận Kịch bản Biên (Edge Cases) & Giải pháp Xử lý

| STT | Kịch bản biên (Edge Case) | Nguy cơ tiềm ẩn | Giải pháp kỹ thuật xử lý của hệ thống |
| :---: | :--- | :--- | :--- |
| **1** | Nhiều người dùng đồng thời mua cùng 1 biến thể sắp hết hàng | Bán vượt tồn kho (Overselling), số lượng tồn kho bị âm. | `SemaphoreSlim` theo từng `VariantId` (đã sắp xếp tăng dần chống deadlock) kết hợp `IDatabaseTransaction` và `RowVersion`. Chỉ luồng đầu tiên trừ thành công, các luồng sau nhận mã lỗi 400 kèm thông báo "Biến thể sản phẩm đã hết hàng hoặc không đủ số lượng". |
| **2** | Khách hàng tắt trình duyệt ngay sau khi nhập mã OTP thành công trên VNPay | Trình duyệt không chuyển hướng về Return URL, giao diện không báo thành công, đơn hàng có thể bị treo `Pending`. | Kênh **IPN Webhook (Server-to-Server)** của VNPay tự động gọi ngầm tới Backend, xác thực chữ ký HMAC-SHA512 và cập nhật đơn hàng thành `PaymentStatus = Paid`. Khi khách mở lại trang "Đơn hàng của tôi", đơn đã hiển thị đã thanh toán thành công. |
| **3** | VNPay gửi IPN Webhook nhiều lần cho cùng một giao dịch | Trùng lặp ghi nhận doanh thu, ghi đè lịch sử trạng thái đơn hàng. | Cơ chế **Idempotent Webhook Handler**: Kiểm tra `order.PaymentStatus == PaymentStatus.Paid`. Nếu đã thanh toán, hệ thống bỏ qua bước cập nhật và phản hồi mã `02 (Order already confirmed)` cho VNPay. |
| **4** | Kẻ xấu can thiệp sửa đổi số tiền `vnp_Amount` hoặc mã đơn `vnp_TxnRef` trên URL | Gian lận thanh toán giá rẻ hoặc thanh toán cho đơn hàng của người khác. | Kiểm tra chữ ký HMAC-SHA512 thất bại ngay lập tức do dữ liệu đã bị biến đổi so với mã băm ban đầu. Đồng thời, hệ thống đối chiếu số tiền thực tế trong cơ sở dữ liệu (`order.TotalAmount * 100 == vnp_Amount`), nếu sai lệch sẽ lập tức từ chối giao dịch. |
| **5** | Khách hàng đã thanh toán thành công cố tình gọi API hủy đơn | Tiền đã vào tài khoản nhưng đơn bị hủy và sản phẩm bị trả lại kho hàng. | Backend kiểm tra `order.PaymentStatus == PaymentStatus.Paid` và ném `DomainException`, từ chối 100% yêu cầu hủy đơn. Frontend ẩn nút hủy đơn và vô hiệu hóa tùy chọn hủy trên giao diện Quản trị. |
| **6** | Lỗi kết nối cơ sở dữ liệu hoặc sự cố mạng trong lúc trừ tồn kho | Dữ liệu bị phân mảnh: kho bị trừ nhưng đơn hàng không tạo được, hoặc ngược lại. | Khối `using var transaction = await _appDbContext.BeginTransactionAsync()` đảm bảo tính toàn vẹn ACID. Khi xảy ra ngoại lệ, toàn bộ thay đổi tự động được rollback về trạng thái ban đầu. |
