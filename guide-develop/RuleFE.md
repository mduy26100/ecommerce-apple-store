# QUY CHUẨN PHÁT TRIỂN FRONTEND (RuleFE)

> **Mục đích:** Tài liệu chuẩn duy nhất định hình cấu trúc, kiến trúc và nguyên tắc phát triển frontend (React / Vite) của dự án. Mọi lập trình viên và AI Agent khi tham gia phát triển frontend bắt buộc phải đọc và tuân thủ nghiêm ngặt 100% các nguyên tắc dưới đây trước khi viết mã nguồn.

---

## Mục lục

1. [Tổng quan kiến trúc & Tech Stack](#1-tổng-quan-kiến-trúc--tech-stack)
2. [Phân cấp phân hệ Storefront & Quản trị Admin](#2-phân-cấp-phân-hệ-storefront--quản-trị-admin)
3. [Bản đồ thư mục chuẩn hóa & Path Aliases](#3-bản-đồ-thư-mục-chuẩn-hóa--path-aliases)
4. [Quy chuẩn viết Code & Giao diện bắt buộc](#4-quy-chuẩn-viết-code--giao-diện-bắt-buộc)
   - 4.1. [Tuyệt đối CẤM Comment trong Code](#41-tuyệt-đối-cấm-comment-trong-code)
   - 4.2. [100% Giao diện người dùng (UI) là Tiếng Việt](#42-100-giao-diện-người-dùng-ui-là-tiếng-việt)
   - 4.3. [Quy tắc đặt tên (Naming Conventions)](#43-quy-tắc-đặt-tên-naming-conventions)
5. [Quy tắc luồng và phụ thuộc (Dependency Rules)](#5-quy-tắc-luồng-và-phụ-thuộc-dependency-rules)
6. [Trách nhiệm của từng Layer](#6-trách-nhiệm-của-từng-layer)
7. [Mẫu triển khai tính năng chuẩn (Scaffold Blueprint)](#7-mẫu-triển-khai-tính-năng-chuẩn-scaffold-blueprint)
8. [Nguyên tắc thiết kế UI & Styling](#8-nguyên-tắc-thiết-kế-ui--styling)
9. [Sai lầm cốt lõi cần tránh (Anti-patterns)](#9-sai-lầm-cốt-lõi-cần-tránh-anti-patterns)
   - 9.8. [Truyền dữ liệu null/undefined vào thuộc tính items của Ant Design (Image.PreviewGroup)](#98-truyền-dữ-liệu-null-hoặc-undefined-vào-thuộc-tính-items-của-ant-design-đặc-biệt-imagepreviewgroup)
10. [Chiến lược Caching & Tối ưu UX (TanStack Query)](#10-chiến-lược-caching--tối-ưu-ux-tanstack-query)
11. [Chiến lược Xử lý lỗi toàn cục & Silent Refresh](#11-chiến-lược-xử-lý-lỗi-toàn-cục--silent-refresh)

---

## 1. Tổng quan kiến trúc & Tech Stack

Dự án áp dụng mô hình **Feature-based Architecture** (Kiến trúc theo tính năng) kết hợp với **Layered Architecture** (Kiến trúc phân tầng) dành cho ứng dụng Thương mại điện tử Apple Store:

- **Hai phân hệ tách biệt hoàn toàn:** Hệ thống phân tách rành mạch giữa **Storefront** (Khách hàng mua sắm) và **Admin** (Ban quản trị).
- **Feature-based:** Mỗi miền nghiệp vụ được đóng gói độc lập theo phân hệ tại `src/features/storefront/`, `src/features/admin/` và module dùng chung `src/features/auth/`.
- **Layered:** Bên trong mỗi feature, mã nguồn được phân tách rõ ràng theo các tầng trách nhiệm: Types → Constants → API → Store → Hooks → Components.
- **Page là Orchestrator chính:** Page đóng vai trò điều phối, không chứa business logic phức tạp mà kết nối hooks (lấy dữ liệu/actions) với các components (hiển thị UI) thông qua props.

### Tech Stack chuẩn hóa

| Thành phần | Công nghệ / Thư viện | Phiên bản | Vai trò & Mục đích |
| :--- | :--- | :--- | :--- |
| **Core Framework** | React + React DOM | 19.x | Thư viện giao diện chính |
| **Build Tool** | Vite | 8.x | Trình đóng gói và dev server siêu tốc |
| **Ngôn ngữ** | TypeScript | ~6.x | Kiểm soát kiểu tĩnh chặt chẽ |
| **UI Framework** | Ant Design (`antd`, `@ant-design/icons`) | 6.x | Bộ components quản trị và thương mại điện tử |
| **CSS Utility** | Tailwind CSS (`@tailwindcss/vite`) | 4.x | Bố cục linh hoạt, utility-first styling hiện đại |
| **Routing** | React Router (`react-router-dom`) | 7.x | Quản lý định tuyến phân cấp (`createBrowserRouter`) |
| **Server State & Caching** | TanStack React Query | 5.x | Quản lý fetch, cache, revalidate và mutation dữ liệu server |
| **Client State** | Zustand | 5.x | Quản lý global state nội bộ client (Auth, user info) |
| **HTTP Client** | Axios | 1.x | Gọi API backend, Interceptors (Silent refresh, xử lý lỗi toàn cục) |
| **Form & Validation** | React Hook Form + Zod / Ant Design Form | 7.x / 4.x | Quản lý biểu mẫu và kiểm tra tính hợp lệ dữ liệu |
| **Image Processing** | `browser-image-compression`, `react-easy-crop` | 2.x / 6.x | Cắt và nén ảnh phía client trước khi upload |
| **Icons bổ trợ** | Lucide React | 1.x | Icon bổ sung cho giao diện |

---

## 2. Phân cấp phân hệ Storefront & Quản trị Admin

Dự án phục vụ đồng thời 2 đối tượng người dùng với luồng định tuyến và giao diện riêng biệt:

```text
                             [Ứng dụng Apple Store]
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        ▼                              ▼                              ▼
  [Storefront Domain]           [Admin Domain]                  [Auth Domain]
  Đường dẫn: "/"                Đường dẫn: "/admin"             Đường dẫn: "/auth"
  Khách hàng mua sắm            Ban quản trị / Nhân viên        Đăng nhập / Đăng ký
  Layout: StorefrontLayout      Layout: AdminLayout             Layout: AuthLayout
  Pages: src/pages/storefront/  Pages: src/pages/admin/         Pages: src/pages/auth/
  Features: features/storefront Features: features/admin/       Features: features/auth/
```

### Nguyên tắc điều hướng (Routing Flow)

- **Truy cập `/`:** Vào thẳng cửa hàng Apple Store dành cho khách hàng với `StorefrontLayout` (Header mua sắm, danh mục sản phẩm, banner iPhone 16 Pro, MacBook M4, iPad Pro, giỏ hàng, footer chính sách). Tuyệt đối không tự động redirect sang admin.
- **Truy cập `/admin`:** Vào cổng quản trị hệ thống với `AdminLayout` (Sidebar quản trị, bảng thống kê doanh số, quản lý người dùng, phân quyền, cấu hình chi nhánh).
- **Truy cập `/auth`:** Vào cổng xác thực tài khoản với `AuthLayout` (`/auth/login`, `/auth/register`).

---

## 3. Bản đồ thư mục chuẩn hóa & Path Aliases

Cấu trúc thư mục tại `src/` của dự án được chuẩn hóa như sau:

```text
src/
├── app/                          # Khởi chạy ứng dụng & Thiết lập định tuyến
│   ├── App.tsx                   # Component gốc, khởi tạo ứng dụng
│   └── routes/
│       ├── AppRouter.tsx         # Định nghĩa toàn bộ cây routes bằng React Router v7
│       ├── ProtectedRoute.tsx    # Route bảo vệ các path yêu cầu đăng nhập/phân quyền
│       └── PublicRoute.tsx       # Route public dành cho khách (Login, Register)
│
├── core/                         # Hạ tầng dùng chung toàn bộ ứng dụng
│   ├── api/
│   │   ├── axios.config.ts       # Cấu hình Axios instance, interceptors, silent refresh, error handler
│   │   ├── mock.api.ts           # Mock adapter phục vụ chạy độc lập (TUYỆT ĐỐI KHÔNG SỬA FILE NÀY)
│   │   └── queryClient.ts        # Cấu hình QueryClient mặc định cho TanStack React Query
│   ├── constants/
│   │   ├── role.constants.ts     # Hằng số vai trò (USER_ROLES) và ánh xạ JWT Claims
│   │   └── storage.constants.ts  # Các key lưu trữ, mã lỗi hệ thống
│   ├── models/
│   │   └── api.model.ts          # Kiểu dữ liệu chuẩn hóa ApiResponse<T>, MetaInfo, ErrorInfo, CursorPagedResult
│   ├── storage/
│   │   └── token.storage.ts      # Quản lý Access Token trong bộ nhớ RAM (In-Memory)
│   └── utils/
│       └── jwt.ts                # Tiện ích giải mã an toàn JWT Token (safe Base64URL decode)
│
├── features/                     # Các module tính năng độc lập theo nghiệp vụ
│   ├── storefront/               # Nghiệp vụ dành riêng cho khách hàng mua sắm
│   │   └── catalog/              # Module danh mục & hiển thị sản phẩm cửa hàng
│   │       ├── api/catalog.api.ts
│   │       ├── components/ProductCard.tsx
│   │       ├── hooks/useCatalog.ts
│   │       ├── types/catalog.types.ts
│   │       └── index.ts
│   │
│   ├── admin/                    # Nghiệp vụ dành riêng cho quản trị viên
│   │   └── index.ts              # Namespace và exports module quản trị
│   │
│   └── auth/                     # Module xác thực & phiên đăng nhập dùng chung
│       ├── api/auth.api.ts
│       ├── components/LoginForm.tsx, RegisterForm.tsx
│       ├── constants/auth.constants.ts, auth.endpoints.ts
│       ├── hooks/useLogin.ts, useLogout.ts, useRegister.ts, useCurrentUserRole.ts
│       ├── store/auth.store.ts
│       ├── types/auth.types.ts
│       └── index.ts
│
├── layouts/                      # Khung giao diện (UI Shells)
│   ├── StorefrontLayout/         # Khung giao diện mua sắm cho khách hàng
│   │   ├── StorefrontLayout.tsx
│   │   └── components/
│   │       ├── StorefrontHeader.tsx  # Navbar Apple: Logo, Danh mục, Tìm kiếm, Giỏ hàng, Link Admin
│   │       └── StorefrontFooter.tsx  # Footer Apple: Hotline, Đổi trả, Bảo hành, Bản quyền VN
│   │
│   ├── AdminLayout/              # Khung quản trị chính cho ban quản lý
│   │   ├── AdminLayout.tsx
│   │   ├── components/
│   │   │   ├── AdminHeader.tsx   # Header: Nút "Xem Cửa Hàng", Thông báo, Tài khoản
│   │   │   ├── AdminSidebar.tsx  # Sidebar: Menu quản trị đa cấp, thu gọn, mobile drawer
│   │   │   └── AdminFooter.tsx   # Footer bản quyền quản trị
│   │   ├── data/menuItems.ts     # Cấu hình danh mục menu và phân quyền route
│   │   └── models/menu-item.model.ts
│   │
│   └── AuthLayout/               # Khung giao diện màn hình xác thực
│       ├── AuthLayout.tsx
│       └── components/AuthCard.tsx, AuthHeader.tsx, AuthFooter.tsx
│
├── pages/                        # Các trang điều phối (Orchestration Pages)
│   ├── storefront/               # Các trang giao diện mua sắm
│   │   └── Home/HomePage.tsx     # Trang chủ Apple Store (Banner, Danh mục, Sản phẩm nổi bật)
│   │
│   ├── admin/                    # Các trang giao diện quản trị
│   │   ├── Dashboard/DashboardPage.tsx
│   │   ├── Users/UsersPage.tsx
│   │   ├── Roles/RolesPage.tsx
│   │   ├── Tenants/TenantsPage.tsx
│   │   ├── Settings/SettingsPage.tsx
│   │   └── Profile/ProfilePage.tsx
│   │
│   ├── auth/                     # Các trang xác thực
│   │   ├── Login/LoginPage.tsx
│   │   └── Register/RegisterPage.tsx
│   │
│   └── common/                   # Các trang dùng chung hệ thống
│       ├── NotFound/NotFoundPage.tsx
│       └── Error/GlobalErrorBoundary.tsx
│
├── shared/                       # Thành phần UI và tiện ích dùng chung (không chứa nghiệp vụ)
│   ├── components/
│   │   ├── page-header/          # Header hiển thị breadcrumb và tiêu đề trang
│   │   ├── splash-screen/        # Màn hình loading toàn trang khi khởi tạo
│   │   ├── network-timeout/      # Màn hình cảnh báo khi mất kết nối mạng
│   │   ├── image-cropper/        # Modal hỗ trợ cắt tỉ lệ ảnh
│   │   └── scroll-to-top/        # Nút cuộn nhanh lên đầu trang
│   └── utils/
│       ├── imageCompressor.ts    # Tiện ích nén dung lượng ảnh trước khi upload
│       ├── imageCrop.ts          # Tiện ích tính toán canvas cắt ảnh
│       └── index.ts
│
├── assets/                       # Tài nguyên tĩnh nội bộ (hình ảnh, vector logo)
├── index.css                     # Global styles, Tailwind CSS v4 & ghi đè Ant Design
├── main.tsx                      # Entrypoint khởi tạo React DOM và QueryClientProvider
└── vite-env.d.ts                 # Khai báo kiểu môi trường Vite
```

### Path Aliases bắt buộc sử dụng

Dự án đã cấu hình alias tại `vite.config.ts` và `tsconfig.app.json`. Bắt buộc dùng alias thay vì đường dẫn tương đối nhiều cấp:

- `@core` $\rightarrow$ `src/core`
- `@features` $\rightarrow$ `src/features`
- `@shared` $\rightarrow$ `src/shared`
- `@pages` $\rightarrow$ `src/pages`
- `@layouts` $\rightarrow$ `src/layouts`
- `@app` $\rightarrow$ `src/app`

---

## 4. Quy chuẩn viết Code & Giao diện bắt buộc

### 4.1. Tuyệt đối CẤM Comment trong Code

- **Nghiêm cấm tuyệt đối viết comment vào bất kỳ file mã nguồn nào** (`//`, `/* */`, JSDoc `/** */`, JSX `{/* */}`).
- Không để lại TODO, FIXME, console debug tạm thời, hay các đoạn mã cũ bị comment lại. Mã không dùng bắt buộc phải xóa bỏ hoàn toàn khỏi repository.
- Mã nguồn phải **tự giải thích (Self-explanatory)** thông qua:
  - Tên component, custom hook, hàm, biến, type, interface mang ý nghĩa tường minh, rõ ràng bằng tiếng Anh chuẩn.
  - Chia nhỏ các đoạn logic phức tạp hoặc hàm quá dài thành các private helper functions hoặc component con nhỏ hơn.
  - Sử dụng hệ thống Type của TypeScript chặt chẽ thay vì giải thích kiểu dữ liệu bằng comment.
- **Trong tài liệu này**, toàn bộ các đoạn code mẫu cũng TUYỆT ĐỐI KHÔNG chứa comment bên trong khối code. Mọi giải thích phải nằm ở văn bản Markdown phía ngoài.

### 4.2. 100% Giao diện người dùng (UI) là Tiếng Việt

- **Toàn bộ văn bản hiển thị tới người dùng cuối trên giao diện (UI) bắt buộc 100% phải là Tiếng Việt có dấu, đúng chính tả và ngữ pháp**:
  - **Tiêu đề trang & Điều hướng:** Tiêu đề trang (Page Titles), Breadcrumbs, Mục menu Navbar, Sidebar ("Trang chủ", "Danh mục sản phẩm", "Bảng điều khiển", "Quản trị người dùng", "Chính sách vai trò", "Cấu hình hệ thống"...).
  - **Biểu mẫu (Forms):** Nhãn trường nhập liệu (Form labels), ô gợi ý (Placeholders: "Nhập họ và tên...", "Nhập email...", "Nhập mật khẩu...", "Tìm kiếm sản phẩm...").
  - **Nút bấm & Hành động (Buttons):** "Mua ngay", "Thêm giỏ", "Đăng nhập", "Đăng ký", "Lưu thay đổi", "Thêm người dùng mới", "Chỉnh sửa", "Xóa", "Hủy", "Tải lại trang", "Quay lại"...
  - **Bảng dữ liệu (Tables):** Tiêu đề cột ("Họ và tên", "Email", "Vai trò", "Trạng thái", "Thao tác"...), phân trang.
  - **Thông báo & Phản hồi (Feedback & Alerts):**
    - Thông báo thành công: `message.success("Đăng nhập thành công!")`, `message.success("Đã thêm vào giỏ hàng!")`...
    - Thông báo thất bại: `message.error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!")`...
    - Thông báo lỗi xác thực form: "Vui lòng nhập họ và tên!", "Mật khẩu phải chứa ít nhất 6 ký tự!", "Không được chỉ nhập khoảng trắng!"...
  - **Hộp thoại xác nhận (Modal / Popconfirm):** "Bạn có chắc chắn muốn xóa bản ghi này?", "Xác nhận", "Đóng".
  - **Trạng thái rỗng & Trang lỗi:** "Không có dữ liệu", "Không tìm thấy trang (404)", "Lỗi ứng dụng (500)".
- **Nghiêm cấm:** Trộn lẫn tiếng Anh và tiếng Việt trên UI (nửa nạc nửa mỡ).
- **Ngoại lệ duy nhất:** Các tên thương hiệu riêng của sản phẩm phần cứng/phần mềm không thể dịch (Apple, iPhone, iPad, MacBook, iMac, AirPods, Apple Watch, AppleCare+, App Store, iCloud...) hoặc mã kỹ thuật (ID, SKU).

### 4.3. Quy tắc đặt tên (Naming Conventions)

- **Component & Layout files:** PascalCase (ví dụ: `HomePage.tsx`, `StorefrontHeader.tsx`, `DashboardPage.tsx`, `LoginForm.tsx`).
- **Hook files:** camelCase có tiền tố `use` (ví dụ: `useCatalog.ts`, `useLogin.ts`, `useCurrentUserRole.ts`).
- **API, Storage, Constants, Utils files:** camelCase có hậu tố mô tả mục đích (ví dụ: `catalog.api.ts`, `auth.api.ts`, `token.storage.ts`, `jwt.ts`).
- **Type & Model files:** camelCase có hậu tố `.types.ts` hoặc `.model.ts` (ví dụ: `catalog.types.ts`, `auth.types.ts`, `api.model.ts`).
- **Thư mục shared component:** kebab-case (ví dụ: `page-header/`, `splash-screen/`, `image-cropper/`).

---

## 5. Quy tắc luồng và phụ thuộc (Dependency Rules)

Để tránh phụ thuộc vòng và giữ hệ thống ổn định lâu dài, mọi thành phần phải tuân thủ nghiêm ngặt chiều phụ thuộc một chiều:

```text
Page (Orchestrator) hoặc Smart Component (Container)
  ├──► Hooks (Business Logic)
  │      ├──► API Layer (HTTP Requests) ──► core/api (Axios Config)
  │      ├──► Store Layer (Client State) ─► core/storage (Token Persistence)
  │      └──► Constants / Types
  └──► Component (Pure UI Render)
         └──► Shared Components / UI Framework (Ant Design, Tailwind)
```

### Ma trận cho phép Import

| Tầng chịu trách nhiệm | Được phép import từ | TUYỆT ĐỐI CẤM import từ |
| :--- | :--- | :--- |
| `types/` | Không import gì (leaf layer) | Bất kỳ tệp runtime nào |
| `constants/` | `types/` | hooks, api, store, components |
| `api/` | `core/api`, `types/`, `constants/` | hooks, store, components |
| `store/` | `core/storage`, `core/utils`, `core/api/queryClient`, `types/`, `constants/` | hooks, api, components |
| `hooks/` | `api/`, `store/`, `types/`, `constants/`, `@features/<module>` (qua Barrel) | components, pages, import file nội bộ feature khác |
| `components/` | `types/`, `shared/`, `@features/<module>` (đối với Container) | api trực tiếp, import sâu file nội bộ feature khác |
| `pages/` | `hooks/`, `components/`, `shared/`, `store` (chỉ read state) | api (trực tiếp) |

### Nguyên tắc cách ly Feature (Feature Isolation)

- **Cho phép phụ thuộc một chiều chéo:** Một feature được phép import từ feature khác để đọc dữ liệu cache từ React Query (ví dụ: Feature Storefront gọi hook `useCurrentUserRole` thông qua path alias `@features/auth`).
- **Nghiêm cấm import file nội bộ trực tiếp:** Mọi import chéo feature bắt buộc phải thông qua tệp Barrel export `index.ts` công khai của feature đó. Nghiêm cấm import xuyên sâu vào các thư mục con bên trong feature khác (như `@features/auth/hooks/useLogin.ts` là SAI, phải dùng `@features/auth`).
- **Nghiêm cấm Circular Dependency:** Tuyệt đối không tạo phụ thuộc vòng giữa các features.

---

## 6. Trách nhiệm của từng Layer

### 6.1. Components Layer

- **Trách nhiệm:** Hiển thị giao diện người dùng và nhận sự kiện từ người dùng.
- **Pure UI Component:** Chỉ nhận props (data, loading state, callbacks). Không chứa hooks gọi API hoặc state nghiệp vụ phức tạp.
- **Form Inputs:** Các ô input bắt buộc nhập thì rules phải khai báo `{ required: true, whitespace: true }` để kiểm tra cả trường hợp người dùng chỉ nhập khoảng trắng.
- **Container Component (Hậu tố `*Container.tsx`):** Chỉ dùng khi component nằm sâu dưới DOM tree để giải quyết Prop Drilling, được phép gọi custom hooks lấy dữ liệu từ React Query cache.
- **Tối ưu hiệu năng:** Áp dụng `React.memo`, `useMemo`, `useCallback` với các danh sách lớn hoặc các component có tần suất re-render cao.

### 6.2. Hooks Layer

- **Trách nhiệm:** Nơi duy nhất chứa logic nghiệp vụ (business logic) của tính năng.
- Sử dụng `@tanstack/react-query`: `useQuery` cho truy vấn đọc và `useMutation` cho thao tác thay đổi dữ liệu (Create, Update, Delete).
- **Thông báo UI nghiệp vụ:** Thực hiện thông báo `message.success` hoặc `message.error` bằng Tiếng Việt tại hook. Lỗi hệ thống diện rộng (401, 403, 500) được Axios Interceptor xử lý tự động.

### 6.3. API Layer

- **Trách nhiệm:** Thực hiện các cuộc gọi HTTP thô tới backend.
- Chỉ import instance `api` từ `@core/api/axios.config` và các endpoint constants cùng feature.
- Trả về Promise chứa dữ liệu đã unwrap. Không thực hiện điều hướng hay hiển thị thông báo lỗi tại đây.

### 6.4. Store Layer (Zustand)

- **Trách nhiệm:** Quản lý trạng thái client toàn cục (Authentication, Theme, Cấu hình Layout).
- **CẤM dùng làm bộ nhớ đệm dữ liệu API:** Toàn bộ dữ liệu server phải được quản lý và cache bởi React Query, tuyệt đối không đưa danh sách từ API vào Zustand store.

### 6.5. Types & Constants Layers

- **Trách nhiệm:** Định nghĩa cấu trúc dữ liệu và loại bỏ magic strings.
- **Quy tắc đặt tên Type:** Sử dụng hậu tố rõ nghĩa như `Request`, `Response`, `Details` (ví dụ: `LoginRequest`, `AuthResponse`, `UserDetails`).
- **Hằng số:** Khai báo hằng số với `as const` để bảo vệ kiểu chặt chẽ.
- **Biến môi trường:** Mọi cấu hình URL, API base hay feature flags phải đọc từ `import.meta.env.VITE_*`. Constants chỉ đóng vai trò ghép path tương đối (ví dụ: `LOGIN: '/api/v1/auth/login'`).

---

## 7. Mẫu triển khai tính năng chuẩn (Scaffold Blueprint)

Dưới đây là khung chuẩn khi triển khai một tính năng mới. Tuân thủ nghiêm ngặt: **Không có comment trong code** và **100% văn bản giao diện là Tiếng Việt**.

### 7.1. Định nghĩa API (features/storefront/catalog/api/catalog.api.ts)

```typescript
import { api } from "@core/api/axios.config";
import type { Product, Category } from "../types/catalog.types";

export const catalogApi = {
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>("/api/catalog/categories");
    return response;
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    const response = await api.get<Product[]>("/api/catalog/featured-products");
    return response;
  },
};
```

### 7.2. Định nghĩa Hook Nghiệp vụ (features/storefront/catalog/hooks/useCatalog.ts)

```typescript
import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "../api/catalog.api";

export const CATALOG_QUERY_KEYS = {
  CATEGORIES: ["catalog", "categories"] as const,
  FEATURED_PRODUCTS: ["catalog", "featured-products"] as const,
};

export const useCategories = () => {
  return useQuery({
    queryKey: CATALOG_QUERY_KEYS.CATEGORIES,
    queryFn: () => catalogApi.getCategories(),
    staleTime: Infinity,
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: CATALOG_QUERY_KEYS.FEATURED_PRODUCTS,
    queryFn: () => catalogApi.getFeaturedProducts(),
    staleTime: 5 * 60 * 1000,
  });
};
```

### 7.3. Định nghĩa Component UI (features/storefront/catalog/components/ProductCard.tsx)

```tsx
import { Tag, Button } from "antd";
import { ShoppingCartOutlined, ThunderboltOutlined } from "@ant-design/icons";
import type { Product } from "../types/catalog.types";

export interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const ProductCard = ({
  product,
  onAddToCart,
  onBuyNow,
}: ProductCardProps) => {
  return (
    <div className="group flex flex-col justify-between h-full bg-white rounded-2xl border border-slate-100 hover:border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden p-5">
      <div>
        <div className="relative w-full aspect-square rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden mb-4">
          <img
            src={product.thumbnail}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
            {product.isNew && (
              <Tag color="#2563eb" className="border-none font-semibold text-xxs px-2 py-0.5 rounded-full">
                MỚI
              </Tag>
            )}
            {product.isHot && (
              <Tag color="#dc2626" className="border-none font-semibold text-xxs px-2 py-0.5 rounded-full">
                BÁN CHẠY
              </Tag>
            )}
          </div>
        </div>

        <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider mb-1">
          {product.category}
        </div>

        <h3 className="font-bold text-slate-800 text-sm sm:text-base line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
          {product.name}
        </h3>

        <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
          {product.description}
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100/80">
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-base sm:text-lg font-black text-slate-900">
            {formatCurrency(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-slate-400 line-through">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            icon={<ShoppingCartOutlined />}
            onClick={() => onAddToCart?.(product)}
            className="w-full h-9 rounded-xl text-xs font-semibold border-slate-200 hover:border-blue-500 hover:text-blue-600"
          >
            Thêm giỏ
          </Button>
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            onClick={() => onBuyNow?.(product)}
            className="w-full h-9 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 border-none"
          >
            Mua ngay
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
```

---

## 8. Nguyên tắc thiết kế UI & Styling

### 8.1. Stack công nghệ giao diện

Ứng dụng sử dụng **Tailwind CSS v4** cho bố cục và styling linh hoạt phối hợp với **Ant Design v6** cho các thành phần giao diện phức tạp (Form, Table, Button, Dropdown, Modal, Menu...).

### 8.2. Quy tắc Styling bắt buộc

1. **Cấm viết CSS thuần và inline styles:** Tránh dùng thuộc tính `style={{ ... }}` trên các React components. Toàn bộ styling chi tiết phải được thiết lập thông qua các class tiện ích của Tailwind CSS.
2. **Ghi đè phong cách Ant Design:** Sử dụng trực tiếp class Tailwind trong thuộc tính `className` để override style của Ant Design Components. Các cấu hình ghi đè diện rộng toàn hệ thống chỉ được khai báo duy nhất trong tệp global `src/index.css`.
3. **Responsive Web Design:** Luôn xây dựng giao diện theo triết lý mobile-first, sử dụng các tiền tố breakpoint của Tailwind (`sm:`, `md:`, `lg:`, `xl:`) thay vì viết mã media query thủ công.
4. **Trải nghiệm bảng biểu & cuộn:** Các trang quản trị có bảng dữ liệu lớn phải thiết lập thuộc tính `scroll={{ x: "max-content" }}` và class `.custom-scrollbar` để đảm bảo hiển thị hoàn hảo trên mọi kích thước màn hình.

---

## 9. Sai lầm cốt lõi cần tránh (Anti-patterns)

### 9.1. Chứa logic nghiệp vụ hoặc gọi API trực tiếp trong Component

- **Sai lầm:** Gọi trực tiếp `axios.get` hoặc viết logic xử lý dữ liệu thô ngay trong component hiển thị.
- **Khắc phục:** Đóng gói toàn bộ logic gọi API và xử lý dữ liệu nghiệp vụ vào custom hook với React Query.

### 9.2. Tự động chuyển hướng trang chủ "/" vào "/admin"

- **Sai lầm:** Khi người dùng vào trang chủ `"/"` lại chuyển hướng sang trang quản trị.
- **Khắc phục:** Trang chủ `"/"` luôn phục vụ khách hàng mua sắm Apple Store (Storefront). Chỉ khi vào `"/admin"` mới truy cập cổng quản trị.

### 9.3. Phụ thuộc chéo chằng chịt giữa các Features

- **Sai lầm:** Feature này import trực tiếp một file con nghiệp vụ nội bộ của feature khác.
- **Khắc phục:** Mọi phụ thuộc giữa các features phải diễn ra một chiều và bắt buộc đi qua tệp Barrel export `index.ts`.

### 9.4. Đưa dữ liệu cache của Server vào Global Store (Zustand)

- **Sai lầm:** Tạo action `fetchUsers` trong Zustand store để tải danh sách và lưu vào state của store.
- **Khắc phục:** Hãy để React Query quản lý trạng thái tải, lưu bộ nhớ đệm (caching), tự động làm mới (refetching). Zustand chỉ quản lý các trạng thái thực sự của client app.

### 9.5. Viết comment trong mã nguồn

- **Sai lầm:** Viết các comment giải thích `// xử lý login`, `/* TODO: sửa lại */`, `/// <summary>`.
- **Khắc phục:** Viết code tự tường minh, đặt tên hàm và biến rõ nghĩa, xóa bỏ hoàn toàn code thừa.

### 9.6. Giao diện người dùng bằng tiếng Anh hoặc trộn lẫn ngôn ngữ

- **Sai lầm:** Để text "Sign in", "Submit", "Delete user", "Overview", "Save changes" trên giao diện người dùng.
- **Khắc phục:** Chuyển 100% sang Tiếng Việt chuẩn ("Đăng nhập", "Xác nhận", "Xóa người dùng", "Tổng quan", "Lưu thay đổi").

### 9.7. Chỉnh sửa file `mock.api.ts`

- **Sai lầm:** Sửa đổi cấu trúc hoặc logic bên trong `src/core/api/mock.api.ts`.
- **Khắc phục:** File này là template chạy thử dự án khi chưa có backend, tuyệt đối không được chỉnh sửa bất kỳ thứ gì trong file này.

### 9.8. Truyền dữ liệu null hoặc undefined vào thuộc tính items của Ant Design (đặc biệt Image.PreviewGroup)

- **Nguyên nhân lỗi chí mạng (`TypeError: Cannot convert undefined or null to object` tại `Object.keys`):**
  - Ant Design `Image.PreviewGroup` nhận prop `items`. Khi truyền vào mảng chứa phần tử `null` hoặc `undefined` (ví dụ: `images.map(img => img.imageUrl)` khi cơ sở dữ liệu có ảnh `imageUrl = null`), Ant Design kiểm tra `typeof item !== 'string'`. Do trong JavaScript `typeof null === 'object'`, Ant Design lầm tưởng đây là object cấu hình và thực thi `Object.keys(null)`. Thao tác này ngay lập tức ném ra lỗi `TypeError: Cannot convert undefined or null to object`, làm sập toàn bộ cây component trong chu kỳ render của React Router. Không chỉ ảnh mà toàn bộ phải xử lý null thật tốt để tránh lỗii "TypeError: Cannot convert undefined or null to object".
- **Quy chuẩn phòng ngừa bắt buộc toàn diện:**
  1. **Lọc sạch dữ liệu chuỗi (Sanitization):** Trước khi truyền vào thuộc tính `items` của `Image.PreviewGroup`, `Breadcrumb`, `Menu`, `Tabs`, bắt buộc phải lọc loại bỏ hoàn toàn các giá trị null, undefined hoặc chuỗi rỗng:

     ```typescript
     const validPreviewUrls = (images || [])
       .map((img) => img.imageUrl)
       .filter((url): url is string => Boolean(url && typeof url === "string" && url.trim().length > 0));
     ```

  2. **Render có điều kiện (Conditional Render):** Chỉ render `<Image.PreviewGroup>` khi danh sách URL hợp lệ có ít nhất 1 phần tử (`validPreviewUrls.length > 0`). Nếu rỗng hoặc không có ảnh, tuyệt đối không gắn component `Image.PreviewGroup`.
  3. **Thiết lập ảnh dự phòng (Fallback & Safe Preview):** Đối với component `<Image>` hoặc thẻ `<img>`:
     - Luôn khai báo ảnh dự phòng: `fallback="/placeholder-product.png"`.
     - Chuyển giá trị null thành undefined: `src={img.imageUrl || undefined}`.
     - Vô hiệu hóa tính năng phóng to khi không có ảnh thật: `preview={Boolean(img.imageUrl)}`.

---

## 10. Chiến lược Caching & Tối ưu UX (TanStack Query)

Để ứng dụng mượt mà, phản hồi tức thì và không bị giật lag, lập trình viên bắt buộc phải tuân thủ các quy tắc caching sau:

### 10.1. Optimistic Updates (Cập nhật lạc quan)

- **Quy tắc:** Áp dụng bắt buộc cho các tương tác CRUD cơ bản có độ trễ API nhỏ (thay đổi trạng thái kích hoạt/vô hiệu hóa, xóa nhanh, ghim bài).
- **Cách triển khai:** Cập nhật giao diện ngay lập tức trong `onMutate` của React Query thông qua `queryClient.setQueryData`. Thiết lập logic rollback trong `onError` để hoàn tác dữ liệu cũ nếu API thất bại.
- **Xóa cache:** Khi thao tác thay đổi dữ liệu thành công (`onSuccess`), bắt buộc gọi `queryClient.invalidateQueries` với query keys được định nghĩa trong constants để làm mới dữ liệu từ server.

### 10.2. Prefetching Data (Tải trước dữ liệu)

- **Quy tắc:** Tải trước dữ liệu của các route quan trọng trước khi người dùng click chuyển hướng.
- **Cách triển khai:** Sử dụng sự kiện `onMouseEnter` trên menu điều hướng hoặc navigation link để gọi `queryClient.prefetchQuery`. Khi người dùng click, dữ liệu đã sẵn sàng trong cache và hiển thị tức thì.

### 10.3. Phân loại StaleTime (Thời gian sống của Cache)

- **Dữ liệu tĩnh (Static Data - Danh mục, Tỉnh/Thành, Quốc gia):** Thiết lập `staleTime: Infinity`. Dữ liệu chỉ tải một lần duy nhất và không tự động fetch lại trừ khi reload trang. Key phải dùng constant độc lập để tránh nhầm lẫn.
- **Dữ liệu ít thay đổi (Slow-moving Data - Hồ sơ người dùng, Cài đặt hệ thống, Sản phẩm nổi bật):** Thiết lập `staleTime: 5 * 60 * 1000` (5 phút). Hệ thống sẽ dùng cache trong vòng 5 phút trước khi coi dữ liệu là cũ.
- **Dữ liệu thời gian thực (Fast-moving/Real-time Data - Dashboard metrics, Danh sách đơn hàng, Tồn kho tức thì):** Thiết lập `staleTime: 0`. Luôn fetch lại từ server khi trang render hoặc tab được active lại.

---

## 11. Chiến lược Xử lý lỗi toàn cục & Silent Refresh

Hệ thống phân tách rõ ràng trách nhiệm bắt và hiển thị thông báo lỗi giữa hạ tầng Axios Interceptor và hooks nghiệp vụ:

### 11.1. Cơ chế Silent Refresh Token tự động (401 Unauthorized)

- Khi gặp phản hồi 401 trên các request thông thường (ngoại trừ login và refresh-token):
  - Request gốc được giữ lại và đưa vào hàng đợi (`failedQueue`).
  - Axios kích hoạt gọi `refreshInstance` tới endpoint `/api/v1/auth/refresh-token` sử dụng HTTP-Only Cookie.
  - Khi refresh thành công, token mới trong RAM được cập nhật, toàn bộ request trong hàng đợi được gán Authorization header mới và tự động gửi lại.
  - Nếu refresh thất bại (phiên đăng nhập hết hạn hoàn toàn), xóa thông tin auth trong store, hiển thị `message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!")` và điều hướng về trang đăng nhập.

### 11.2. Lỗi Hệ thống diện rộng (System-level Errors)

Được xử lý tập trung tại Response Interceptor trong [axios.config.ts](file:///c:/Users/Admin/Documents/ecommerce-apple-store/apple-store-web/src/core/api/axios.config.ts) bằng Tiếng Việt chuẩn:

- **HTTP 403:** `message.error("Bạn không có quyền truy cập vào tính năng này.")`
- **HTTP 500 / 503:** `message.error("Hệ thống đang bận hoặc gặp sự cố. Vui lòng thử lại sau.")`
- **HTTP 400:** Hiển thị nội dung lỗi chi tiết trả về từ backend (`error.response.data.message`).
- **Mất kết nối mạng (Network Timeout / ECONNABORTED):** `message.error("Kết nối mạng bị gián đoạn. Vui lòng kiểm tra lại đường truyền internet.")`
- **Không kết nối được server:** `message.error("Không thể kết nối đến máy chủ.")`

### 11.3. Lỗi Nghiệp vụ cục bộ (Business-level Errors)

- Các lỗi gắn liền với quy trình xử lý của chức năng cụ thể (ví dụ: "Sai mật khẩu", "Email này đã được sử dụng", "Mã đơn hàng không hợp lệ").
- Hooks nghiệp vụ cục bộ bắt lỗi tại callback `onError` của `useMutation` để hiển thị thông báo hướng dẫn cụ thể trên Form hoặc giao diện tương tác.

---

_Tài liệu này là nguồn sự thật duy nhất (single source of truth) về kiến trúc và quy chuẩn phát triển frontend của dự án. Mọi thay đổi kiến trúc phải cập nhật tài liệu này trước. Trong vòng đời phát triển tính năng, tuyệt đối không được đụng chạm thay đổi [mock.api.ts], phải giữ nguyên không được thay đổi gì hết trong file này._
