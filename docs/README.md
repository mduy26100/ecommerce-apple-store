# Hệ Thống Thương Mại Điện Tử Urban Stitch (Apple Store Ecosystem)

> **Urban Stitch** là nền tảng thương mại điện tử chuyên biệt cho hệ sinh thái công nghệ cao cấp của Apple (iPhone, MacBook, iPad, Apple Watch, AirPods và Phụ kiện chính hãng).  
> Dự án được xây dựng theo tiêu chuẩn công nghiệp với kiến trúc chịu tải cao, kiểm soát tương tranh đa tầng chống bán vượt tồn kho, thanh toán trực tuyến bảo mật với Webhook IPN thực tế, khả năng retry thanh toán vô hạn và trung tâm báo cáo điều hành kinh doanh chuyên sâu.

---

## 1. Điểm Nhấn Kiến Trúc & Tính Năng Cấp Doanh Nghiệp

Hệ thống được thiết kế vượt xa các đồ án thương mại điện tử thông thường nhờ 5 giải pháp công nghệ cấp doanh nghiệp:

| Điểm nhấn kỹ thuật | Bản chất bài toán | Giải pháp triển khai trong Urban Stitch |
| :--- | :--- | :--- |
| **1. Thiết kế CSDL Thuộc tính Đa năng (Hybrid EAV)** | Ngành hàng Apple liên tục bổ sung cấu hình mới (màu sắc mới, dung lượng mới, loại kết nối, loại kính màn hình). Nếu dùng cột cố định sẽ phải sửa bảng liên tục. | Kết hợp thuộc tính cố định siêu tốc (`Colors`, `StorageOptions`) với ma trận thuộc tính động (`ProductOptions`, `ProductOptionValues`, `ProductVariantValues`) và Nhóm thông số kỹ thuật phân cấp (`ProductSpecificationGroups`, `ProductSpecifications`). Mở rộng sản phẩm mới mà không cần ALTER TABLE. |
| **2. Kiểm soát Tương tranh Đa tầng (3-Tier Concurrency)** | Hàng nghìn người cùng bấm "Đặt hàng" một mẫu máy hot trong cùng 1 giây dẫn tới thảm họa bán vượt tồn kho (Overselling). | Bảo vệ 3 lớp: `SemaphoreSlim` in-memory lock theo `VariantId` (kèm sắp xếp ID tăng dần chống Deadlock) $\rightarrow$ SQL Server ACID Transaction $\rightarrow$ Khóa lạc quan với cột `RowVersion`. |
| **3. Thanh toán VNPay có Webhook IPN Thực tế** | Đa số ứng dụng sinh viên vừa bấm thanh toán đã vội báo thành công, hoặc khách lỡ tắt tab là mất dấu giao dịch. | Phân ly 2 kênh: Chỉ ghi nhận `Paid` khi nhận được Webhook IPN ngầm từ server VNPay với mã `vnp_ResponseCode == "00"` và chữ ký số HMAC-SHA512. Chặn tuyệt đối việc hủy đơn sau khi đã thanh toán thành công. |
| **4. Khả năng Retry Thanh toán Vô hạn** | Khách hàng hết tiền trong thẻ, rớt mạng hoặc lỡ tắt tab thanh toán. | Khách hàng chỉ cần vào mục "Đơn hàng của tôi", bấm **"Thanh toán qua VNPay"**, hệ thống sinh ngay URL thanh toán mới toanh để thanh toán tiếp mà không làm mất đơn hay mất hàng đã giữ trong kho. |
| **5. Khởi chạy Docker Tuần tự & Idempotent Seeding** | Sang máy khách hàng trắng chưa có cơ sở dữ liệu thì không thể nạp script bảng, hoặc restart container thì bị ghi đè mất dữ liệu cũ. | Khởi chạy tuần tự nghiêm ngặt: `sqlserver` Healthy $\rightarrow$ container `db-init` tự kiểm tra tên database trong `.env`, tự tạo database nếu chưa có, tự nạp `seed-data.sql` nếu chưa có sản phẩm (bỏ qua nếu đã có dữ liệu để chống mất mát) $\rightarrow$ `backend` Healthy $\rightarrow$ `frontend` & `ngrok`. |

---

## 2. Bảng Tóm Tắt Công Nghệ Sử Dụng (Tech Stack)

| Phân hệ | Công nghệ chủ đạo | Vai trò & Kiến trúc |
| :--- | :--- | :--- |
| **Backend** | **.NET 8 (C#)** | Xây dựng theo nguyên lý **Clean Architecture** kết hợp mô hình phân tầng hướng tâm **Onion Architecture** (`Domain` $\rightarrow$ `Application` $\rightarrow$ `Infrastructure` $\rightarrow$ `Host`). |
| **Database** | **Microsoft SQL Server 2022** | Hệ quản trị cơ sở dữ liệu quan hệ mạnh mẽ, phân tách 3 Schemas độc lập (`catalog`, `sales`, `identity`), chỉ mục lọc và khóa lạc quan `rowversion`. |
| **Frontend** | **React 19 + TypeScript + Vite** | Xây dựng theo mô hình **Feature-based Architecture**, phân tách rạch ròi giữa Server State (TanStack React Query) và Client State (Zustand); tối ưu giao diện với TailwindCSS v4 và Ant Design 6. |
| **Thanh toán & Media** | **VNPay Sandbox & Cloudinary CDN** | Cổng thanh toán trực tuyến bảo mật HMAC-SHA512 và máy chủ lưu trữ / nén ảnh tự động cho các bộ sưu tập ảnh theo màu sắc. |
| **Tự động hóa** | **Docker & Docker Compose** | Tự động hóa đóng gói multi-stage, kiểm soát startup healthcheck tuần tự, nạp seed data an toàn và mở tunnel Ngrok phục vụ Webhook IPN. |

---

## 3. Sơ Đồ Cấu Trúc Dự Án (Project Structure Tree)

Cấu trúc dự án được tổ chức khoa học, phân tách rõ ràng trách nhiệm giữa Backend, Frontend, Bộ tài liệu báo cáo và Tự động hóa Docker:

```text
ecommerce-apple-store/
├── apple-store-app/                              # Phân hệ Backend ASP.NET Core 8 Web API
│   ├── App.sln                                   # Solution tập trung chứa toàn bộ các project
│   ├── Dockerfile                                # Multi-stage Docker build cho Backend .NET 8
│   └── src/
│       ├── App/                                  # Solution Folder chứa các tầng nghiệp vụ cốt lõi
│       │   ├── Domain/                           # Tầng Thực thể lõi (Entities, Enums, Value Objects)
│       │   │   ├── Common/                       # BaseEntity, AuditableEntity
│       │   │   ├── Constants/                    # Hằng số hệ thống, quyền hạn Roles, Schemas
│       │   │   ├── Entities/                     # 27 thực thể CSDL (Products, Variants, Orders, Users,...)
│       │   │   ├── Enums/                        # Kiểu liệt kê trạng thái đơn, thanh toán, phân loại
│       │   │   ├── Exceptions/                   # Ngoại lệ nghiệp vụ chuyên biệt (NotFound, Concurrency)
│       │   │   └── Domain.csproj
│       │   ├── Application/                      # Tầng Xử lý nghiệp vụ (Service & Specification Pattern)
│       │   │   ├── Common/                       # Interfaces (IAppDbContext,...), Helpers, DTOs
│       │   │   ├── Features/                     # Phân tách theo module: Catalog, Orders, Sales, Reports
│       │   │   ├── Wrappers/                     # ApiResponse<T>, PagedResponse<T> chuẩn hóa
│       │   │   ├── DependencyInjection.cs        # Đăng ký Scoped Services (IProductService, IOrderService,...)
│       │   │   └── Application.csproj
│       │   └── Infrastructure/                   # Tầng Triển khai hạ tầng công nghệ
│       │       ├── Identity/                     # Triển khai dịch vụ xác thực JWT & Cookie
│       │       ├── Payments/                     # Xử lý cổng thanh toán VNPay & Webhook IPN
│       │       ├── Persistence/                  # EF Core DbContext, Configurations, Migrations, Seeders
│       │       ├── Reports/                      # Xuất báo cáo Excel ClosedXML OpenXML
│       │       ├── Storage/                      # Dịch vụ upload ảnh đám mây Cloudinary CDN
│       │       ├── DependencyInjection.cs        # Đăng ký DbContext, Repositories, Third-party Services
│       │       └── Infrastructure.csproj
│       └── Host/                                 # Tầng Khởi chạy ứng dụng Web API (Presentation Layer)
│           ├── Controllers/                      # Bộ điều khiển RESTful API
│           │   ├── Manager/                      # APIs dành riêng cho Cổng Quản trị Admin
│           │   └── Public/                       # APIs công khai dành cho Khách hàng & Webhook
│           ├── Extensions/                       # Extension methods cấu hình CORS, Swagger, DI
│           ├── Filters/                          # Action Filters, ApiResponseFilterAttribute
│           ├── Middlewares/                      # ExceptionHandlingMiddleware xử lý lỗi tập trung
│           ├── appsettings.json                  # Cấu hình chuỗi kết nối, JWT, VNPay, Cloudinary
│           ├── Program.cs                        # Điểm khởi động hệ thống, cấu hình middleware pipeline
│           └── Host.csproj
│
├── apple-store-web/                              # Phân hệ Frontend Single Page Application (React 19)
│   ├── package.json                              # Quản lý dependencies (React 19, Vite, Ant Design, TailwindCSS v4)
│   ├── vite.config.ts                            # Cấu hình Vite build & alias đường dẫn (@features, @shared,...)
│   ├── Dockerfile                                # Multi-stage Docker đóng gói Nginx web server
│   ├── nginx.conf                                # Cấu hình Nginx reverse proxy & fallback SPA routing
│   └── src/
│       ├── app/                                  # Cấu hình ứng dụng trung tâm (Router, QueryClient, Providers)
│       ├── core/                                 # Nhân tảng nền tảng (Axios client, Storage, Interceptors)
│       ├── features/                             # Kiến trúc Feature-based chia nhỏ theo nghiệp vụ
│       │   ├── admin/                            # Module Admin: Products, Variants, Orders, Reports, Users
│       │   ├── auth/                             # Module Auth: Login, Register, Token Store, Auth Hooks
│       │   └── storefront/                       # Module Khách hàng: Catalog, Cart, Checkout, Order Lookup
│       ├── layouts/                              # Layouts khung giao diện: StorefrontLayout, AdminLayout, AuthLayout
│       ├── pages/                                # Routing Pages kết nối features với layout tương ứng
│       ├── shared/                               # Thành phần dùng chung: UI Components, Apple Icons, Utilities
│       ├── main.tsx                              # Điểm nhập React DOM (mount root element)
│       └── index.css                             # Cấu hình TailwindCSS v4 và typography toàn cục
│
├── docs/                                         # Bộ Hồ Sơ Tài Liệu Kỹ Thuật & Nghiệp Vụ Báo Cáo Đồ Án
│   ├── README.md                                 # Tổng quan hệ thống & mục lục điều hướng tài liệu
│   ├── DATABASE_DESIGN.md                        # Thiết kế CSDL 27 bảng, 3 Schemas, Hybrid EAV, Khóa lạc quan
│   ├── SYSTEM_ARCHITECTURE.md                    # Kiến trúc Clean Architecture, Concurrency 3 tầng, VNPay IPN
│   ├── FEATURES_SPECIFICATION.md                 # Đặc tả chi tiết 11 phân hệ nghiệp vụ người dùng & Admin
│   ├── API_SPECIFICATION.md                      # Đặc tả hợp đồng RESTful API, Webhook IPN & mã lỗi RFC 7807
│   └── PROJECT_PROGRESS.md                       # Báo cáo tiến độ nghiệm thu hoàn thành 100% các phân hệ [x]
│
├── .env                                          # Biến môi trường tập trung (Cổng port, Database, JWT, VNPay)
├── docker-compose.yml                            # Điều phối khởi chạy tuần tự các container Docker
├── seed-data.sql                                 # Script T-SQL tạo DB và nạp 48 máy Apple 2022-2026 chuẩn mực
└── README.md                                     # Giới thiệu tổng quan dự án Urban Stitch, chạy Docker 1 lệnh
```

---

## 4. Hướng Dẫn Khởi Chạy Dự Án Bằng Docker (Quick Start)

Dự án được cấu hình để khởi chạy trên môi trường Localhost chỉ với **duy nhất một lệnh**:

```bash
docker compose up -d
```

### Trình Tự Khởi Động Tự Động
1. Docker tự động kéo và build images cho toàn bộ các dịch vụ.
2. Dịch vụ `sqlserver` khởi động trước và chuyển sang trạng thái `Healthy`.
3. Dịch vụ `db-init` tự động kiểm tra database theo cấu hình trong `.env`:
   - Nếu chưa có database: tự động tạo mới `CREATE DATABASE [AppleStoreDb]`.
   - Nếu chưa có dữ liệu sản phẩm: tự động nạp `seed-data.sql` (tạo 27 bảng, nạp 48 dòng máy Apple 2022-2026, 298 biến thể, voucher và 45 đơn hàng mẫu).
   - Nếu database đã có dữ liệu: lập tức bỏ qua để bảo toàn dữ liệu giao dịch thực tế.
4. Dịch vụ `backend` khởi động, đồng bộ migrations, hoàn tất kiểm tra `/health`.
5. Dịch vụ `frontend` và `ngrok` khởi động sẵn sàng phục vụ.

### Địa Chỉ Truy Cập Mặc Định & Cổng Dịch Vụ
- **Cửa hàng Storefront:** `http://localhost:3088` (Port: `3088`)
- **Cổng Quản trị Admin:** `http://localhost:3088/admin/auth/login`
- **Backend Web API & Swagger Docs:** `http://localhost:8088/swagger` (Port: `8088`)
- **Microsoft SQL Server 2022:** `localhost:14333` (Port: `14333`, Database: `AppleStoreDb`)
- **Ngrok Tunnel Dashboard:** `http://localhost:4040` (Port: `4040`)

### Tài Khoản Đăng Nhập Mặc Định

| Vai trò người dùng | Địa chỉ Email | Mật khẩu truy cập | Đặc quyền phân quyền |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (SuperAdmin)** | `admin@apple-store.com` | `Admin@123456` | Toàn quyền quản trị: Dashboard, Sản phẩm 5 tabs, Biến thể, Đơn hàng, Khóa tài khoản, Báo cáo thống kê và Xuất Excel. |
| **Khách hàng mẫu (Customer VIP)** | `user@apple-store.com` | `User@123456` | Khách hàng thành viên: Duyệt mua sản phẩm Apple, Ví voucher, Giỏ hàng cá nhân, Lịch sử đơn hàng và Retry thanh toán VNPay. |

---

## 5. Mục Lục Bộ Tài Liệu Kỹ Thuật & Nghiệp Vụ Trong `./docs`

Hệ thống tài liệu chuyên sâu được chuẩn hóa đầy đủ trong thư mục `./docs`:

- 📊 **[Thiết kế Cơ sở Dữ liệu (DATABASE_DESIGN.md)](./DATABASE_DESIGN.md):**  
  Bản đặc tả chi tiết 27 bảng dữ liệu, phân vùng 3 Schemas, giải trình kiến trúc Hybrid EAV, nhóm thông số kỹ thuật phân cấp, snapshot bất biến đơn hàng và cơ chế kiểm soát tương tranh 3 tầng bảo vệ kho hàng.

- 🏛️ **[Kiến trúc Hệ thống (SYSTEM_ARCHITECTURE.md)](./SYSTEM_ARCHITECTURE.md):**  
  Mô hình phân tầng Onion Architecture cho Backend, kiến trúc Feature-based cho Frontend, phân định ranh giới Server State vs Client State, chuyên đề chuyên sâu về **Kiến trúc Thanh toán VNPay có Webhook IPN Thực & Khả năng Retry Thanh toán Vô hạn**, và **Hạ tầng Docker tuần tự Deterministic**.

- 📱 **[Đặc Tả Tính Năng Hệ Thống (FEATURES_SPECIFICATION.md)](./FEATURES_SPECIFICATION.md):**  
  Tài liệu chức năng chuẩn mực (Functional Specification Document - FSD) đặc tả toàn diện 11 phân hệ nghiệp vụ, bao gồm bảng mã tính năng, quy tắc bảo mật Zero-Trust, giỏ hàng tự phục hồi tồn kho, cập nhật địa chỉ đơn 1 lần duy nhất, và trung tâm báo cáo kinh doanh.

- 📑 **[Đặc Tả Giao Tiếp RESTful API (API_SPECIFICATION.md)](./API_SPECIFICATION.md):**  
  Danh mục hợp đồng API hoàn chỉnh: phương thức, headers, body, tham số lọc/phân trang, hợp đồng Webhook IPN với VNPay, mã lỗi RFC 7807 và API xuất Excel ClosedXML OpenXML.

- 📈 **[Báo Cáo Tiến Độ Dự Án (PROJECT_PROGRESS.md)](./PROJECT_PROGRESS.md):**  
  Bảng theo dõi tiến độ thực tế xác nhận 100% hoàn thành các phân hệ, danh mục sản phẩm Apple chuẩn mực 2022 - 2026 và nghiệm thu bàn giao chính thức.
