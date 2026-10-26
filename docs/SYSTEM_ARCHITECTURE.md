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

```
┌─────────────────────────────────────────────────────────────┐
│                          HOST LAYER                         │
│   (ASP.NET Core Web API, Controllers, Middlewares, DI)     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                 INFRASTRUCTURE LAYER                  │  │
│  │   (EF Core, SQL Server, Identity, Repositories)       │  │
│  │  ┌───────────────────────────────────────────┐  │  │
│  │  │                APPLICATION LAYER                │  │  │
│  │  │   (Use Cases, Features, DTOs, Specifications)   │  │  │
│  │  │  ┌───────────────────────────────────────────┐  │  │  │
│  │  │  │               DOMAIN LAYER                │  │  │  │
│  │  │  │  (Entities, BaseEntity, Domain Exceptions)│  │  │  │
│  │  │  └───────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

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
1. **Storefront (`src/features/storefront`, `src/pages/storefront`):** Giao diện bán hàng cao cấp cho người tiêu dùng (`StorefrontLayout`), phục vụ xem sản phẩm, đổi biến thể màu/dung lượng tức thì, giỏ hàng trực tuyến (`src/features/storefront/cart`) hỗ trợ khách vãng lai, tự động gộp giỏ hàng khi đăng nhập, đổi phân loại trong giỏ và tự phục hồi số lượng tồn kho.
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
