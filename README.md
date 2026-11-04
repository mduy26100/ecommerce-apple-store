# Urban Stitch — Apple Store Ecosystem Platform

> **Urban Stitch** là nền tảng thương mại điện tử chuyên biệt cho hệ sinh thái công nghệ cao cấp của Apple (iPhone, MacBook, iPad, Apple Watch, AirPods và Phụ kiện chính hãng).  
> Dự án được xây dựng theo tiêu chuẩn công nghiệp với kiến trúc chịu tải cao, kiểm soát tương tranh đa tầng chống bán vượt tồn kho, thanh toán trực tuyến bảo mật với Webhook IPN thực tế, khả năng retry thanh toán vô hạn và trung tâm báo cáo điều hành kinh doanh chuyên sâu.

---

## 1. Điểm Nhấn Nghiệp Vụ & Kiến Trúc Kỹ Thuật (Enterprise Capabilities)

Dự án sở hữu 5 giải pháp công nghệ cấp doanh nghiệp vượt xa các bài tập lớn thương mại điện tử thông thường:

1. **Mô Hình Dữ Liệu Thuộc Tính Đa Năng (Hybrid EAV Model):**
   - Giải quyết trọn vẹn bài toán ngành hàng Apple liên tục bổ sung cấu hình mới (màu sắc mới, dung lượng mới, chuẩn kết nối Thunderbolt, kính màn hình Nano-texture) mà **không cần chạy migration sửa đổi cấu trúc bảng CSDL**.
   - Kết hợp các bảng thuộc tính cố định siêu tốc (`Colors`, `StorageOptions`) với ma trận thuộc tính động (`ProductOptions`, `ProductOptionValues`, `ProductVariantValues`) và Nhóm thông số kỹ thuật phân cấp (`ProductSpecificationGroups`, `ProductSpecifications`).

2. **Kiểm Soát Tương Tranh Đa Tầng (3-Tier Concurrency Defense):**
   - Triệt tiêu hoàn toàn thảm họa bán vượt tồn kho (Overselling) khi hàng nghìn người cùng tranh mua các sản phẩm hot trong đợt mở bán (Flash Sale):
     - *Lớp 1 (In-Memory Lock):* Khóa bộ nhớ `SemaphoreSlim` theo từng `VariantId`, áp dụng nguyên tắc sắp xếp ID tăng dần (`Lock Ordering`) để triệt tiêu vĩnh viễn nguy cơ Deadlock.
     - *Lớp 2 (ACID Database Transaction):* Bọc quy trình kiểm tra kho, trừ kho và sinh đơn hàng trong một Transaction duy nhất.
     - *Lớp 3 (Optimistic Concurrency Control):* Cột `RowVersion` (`timestamp`) trên SQL Server bảo vệ tính toàn vẹn dữ liệu ở cấp độ phần cứng.

3. **Cổng Thanh Toán VNPay Đẳng Cấp với Webhook IPN Thực Tế:**
   - Phân ly rạch ròi giữa chuyển hướng trình duyệt (Redirect URL) và xử lý xác nhận thanh toán ngầm (Webhook IPN).
   - Chỉ khi nhận được Webhook IPN từ máy chủ VNPay với chữ ký số HMAC-SHA512 khớp 100% và mã thành công `vnp_ResponseCode == "00"`, đơn hàng mới được chuyển sang trạng thái `Paid`.
   - Chặn tuyệt đối việc người dùng tự ý hủy đơn sau khi đã thanh toán thành công qua VNPay.

4. **Khả Năng Retry Thanh Toán Vô Hạn (Infinite Payment Retry):**
   - Khách hàng lỡ tắt tab thanh toán, rớt mạng hoặc thẻ ngân hàng tạm thời hết tiền không bị mất đơn hay mất hàng đã giữ trong kho.
   - Khách hàng chỉ cần truy cập "Đơn hàng của tôi", bấm **"Thanh toán qua VNPay"** để hệ thống sinh ngay một URL thanh toán mới toanh và hoàn tất giao dịch bất cứ lúc nào.

5. **Trung Tâm Báo Cáo Điều Hành & Xuất Excel ClosedXML:**
   - Cung cấp bảng điều khiển Dashboard thời gian thực, biểu đồ xu hướng doanh thu kép, cơ cấu phương thức thanh toán và tỷ trọng trạng thái đơn hàng.
   - Tích hợp tính năng xuất tệp Excel `.xlsx` trực tiếp từ luồng stream bộ nhớ thông qua thư viện `ClosedXML` chuẩn OpenXML, trình bày mẫu bảng tính kế toán chuyên nghiệp.

---

## 2. Bảng Tóm Tắt Công Nghệ Sử Dụng (Tech Stack)

| Thành phần | Công nghệ chủ đạo | Vai trò & Kiến trúc |
| :--- | :--- | :--- |
| **Backend** | **ASP.NET Core 8 (.NET 8)** | Xây dựng theo nguyên lý **Clean Architecture** kết hợp mô hình phân tầng hướng tâm **Onion Architecture** (`Domain` $\rightarrow$ `Application` $\rightarrow$ `Infrastructure` $\rightarrow$ `Host`), triển khai **Service Pattern** kết hợp **Specification Pattern (Ardalis.Specification)** và **Repository Pattern**. |
| **Database** | **Microsoft SQL Server 2022** | Phân tách 3 Schemas độc lập (`catalog`, `sales`, `identity`), chỉ mục lọc tối ưu hóa truy vấn và khóa lạc quan `rowversion`. |
| **Frontend** | **React 19 + TypeScript + Vite** | Kiến trúc **Feature-based**, phân tách rạch ròi Client State (Zustand) và Server State (TanStack React Query), Ant Design 6 và TailwindCSS v4. |
| **Cổng Thanh Toán** | **VNPay Sandbox** | Tích hợp cổng thanh toán trực tuyến qua thẻ ATM / QR-Code / Thẻ quốc tế với chữ ký số HMAC-SHA512. |
| **Tự Động Hóa** | **Docker & Docker Compose** | Điều phối khởi chạy tuần tự an toàn, nạp dữ liệu Apple 2022-2026 tự động và chống ghi đè dữ liệu (Idempotency). |

---

## 3. Sơ Đồ Cấu Trúc Dự Án (Project Structure Tree)

Cấu trúc dự án được phân tách rạch ròi và tổ chức khoa học:

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

Dự án được tối ưu hóa toàn diện để chạy trên môi trường Localhost chỉ với **duy nhất một câu lệnh**:

```bash
docker compose up -d
```

### Trình Tự Khởi Động Tự Động
1. **Khởi động SQL Server 2022 (`sqlserver`):** Lắng nghe kiểm tra sức khỏe `SELECT 1` cho tới khi chuyển sang trạng thái `Healthy`.
2. **Khởi tạo Database & Dữ liệu Mẫu (`db-init`):** Tự động đọc file cấu hình `.env`, tự tạo database `AppleStoreDb` nếu chưa có. Nếu chưa có dữ liệu sản phẩm, container tự động nạp `seed-data.sql` (tạo 27 bảng, nạp 48 sản phẩm Apple chuẩn mực 2022 - 2026 và 45 đơn hàng mẫu). Nếu database đã có sẵn dữ liệu, hệ thống tự động bỏ qua để bảo toàn dữ liệu. Sau khi hoàn thành, container tự động dừng với exit code `0`.
3. **Khởi động Backend Web API (`backend`):** Kết nối vào cơ sở dữ liệu đã sẵn sàng, thực thi migrations và chờ endpoint `/health` chuyển sang `Healthy`.
4. **Khởi động Frontend & Ngrok (`frontend`, `ngrok`):** Web bán hàng và cổng quản trị sẵn sàng phục vụ người dùng.

---

## 5. Bảng Ánh Xạ Cổng Dịch Vụ & Địa Chỉ Truy Cập Localhost

| Dịch vụ | Cổng kết nối (Port) | Địa chỉ truy cập Localhost | Chức năng chính |
| :--- | :---: | :--- | :--- |
| **Frontend Storefront** | **`3088`** | `http://localhost:3088` | Giao diện bán hàng trực tuyến chuẩn Apple |
| **Admin Portal** | **`3088`** | `http://localhost:3088/admin/auth/login` | Cổng quản trị toàn màn hình 5 tabs |
| **Backend Web API** | **`8088`** | `http://localhost:8088/swagger` | Cổng tra cứu tài liệu Swagger RESTful API |
| **SQL Server 2022** | **`14333`** | `localhost:14333` | Cơ sở dữ liệu quan hệ (Database: `AppleStoreDb`) |
| **Ngrok Tunnel Dashboard** | **`4040`** | `http://localhost:4040` | Bảng điều khiển Webhook trung gian cho VNPay IPN |

---

## 6. Tài Khoản Đăng Nhập Mặc Định

| Phân quyền | Email tài khoản | Mật khẩu truy cập | Đặc quyền hệ thống |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (SuperAdmin)** | `admin@apple-store.com` | `Admin@123456` | Toàn quyền quản trị hệ thống: Quản lý sản phẩm 5 tabs, duyệt đơn hàng, cấu hình danh mục/màu sắc/dung lượng, xem báo cáo thống kê đa chiều và xuất file Excel. |
| **Khách hàng mẫu (Customer VIP)** | `user@apple-store.com` | `User@123456` | Khách hàng thành viên: Duyệt mua các sản phẩm Apple, áp dụng mã voucher, quản lý giỏ hàng cá nhân, xem lịch sử đơn hàng và thực hiện Retry thanh toán VNPay. |

---

## 7. Bộ Hồ Sơ Tài Liệu Chi Tiết Trong Thư Mục `./docs`

Để phục vụ tốt nhất cho việc nghiên cứu, viết báo cáo đồ án và thuyết trình trước hội đồng chấm thi, toàn bộ tài liệu chuyên sâu được sắp xếp chi tiết trong thư mục `./docs`:

- 📊 **[DATABASE_DESIGN.md](./docs/DATABASE_DESIGN.md):** Bản đặc tả chi tiết 27 bảng dữ liệu, phân vùng 3 Schemas, giải trình kiến trúc Hybrid EAV, nhóm thông số phân cấp, snapshot bất biến đơn hàng và khóa lạc quan.
- 🏛️ **[SYSTEM_ARCHITECTURE.md](./docs/SYSTEM_ARCHITECTURE.md):** Kiến trúc kỹ thuật Clean Architecture, Concurrency Defense 3 tầng, quy trình Webhook IPN VNPay thực tế và cơ chế Retry thanh toán vô hạn.
- 📱 **[FEATURES_SPECIFICATION.md](./docs/FEATURES_SPECIFICATION.md):** Bản đặc tả chức năng (FSD) toàn diện 11 phân hệ nghiệp vụ người dùng và quản trị viên.
- 📑 **[API_SPECIFICATION.md](./docs/API_SPECIFICATION.md):** Bản đặc tả chi tiết danh mục RESTful API endpoints, request/response schemas, mã lỗi RFC 7807 và hợp đồng Webhook IPN.
- 📈 **[PROJECT_PROGRESS.md](./docs/PROJECT_PROGRESS.md):** Báo cáo tiến độ nghiệm thu hoàn thiện 100% tất cả các phân hệ và tính năng của dự án.
- 📖 **[README.md (Tài liệu tổng quan)](./docs/README.md):** Mục lục điều hướng tổng thể hồ sơ kỹ thuật.
