# Bản Đặc Tả Giao Tiếp RESTful API (API Specification)

> **Dự án:** Urban Stitch - Nền tảng Thương mại Điện tử Hệ sinh thái Apple  
> **Phiên bản API:** `v1`  
> **Giao thức:** HTTPS / HTTP RESTful JSON  
> **Mã nguồn:** ASP.NET Core 8 Web API (Clean Architecture + Service & Specification Pattern)

---

## 1. Chuẩn Mực Thiết Kế Kiến Trúc API (Design Conventions)

### 1.1. Cấu Trúc Địa Chỉ Gốc (Base URL)
- Môi trường phát triển cục bộ (Localhost): `http://localhost:8088/api/v1`
- Cổng tài liệu Swagger trực quan: `http://localhost:8088/swagger`

### 1.2. Cơ Chế Xác Thực & Phân Quyền (Authentication & Authorization)
Hệ thống sử dụng cơ chế xác thực kép **JWT Access Token + Refresh Token (HttpOnly Cookie)**:
- Mọi request yêu cầu xác thực phải đính kèm Header:
  ```http
  Authorization: Bearer <access_token>
  ```
- Thời hạn Access Token: 15 phút (lưu trữ trong In-Memory RAM của trình duyệt).
- Refresh Token: 7 ngày (lưu trữ trong Secure HttpOnly Cookie với cờ `SameSite=Strict`).

### 1.3. Định Dạng Phản Hồi Chuẩn (Standard Response Envelope)
Toàn bộ API trả về cấu trúc bọc chuẩn hóa `ApiResponse<T>`:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thao tác thành công",
  "data": { ... },
  "errors": null,
  "timestamp": "2026-11-04T10:15:30Z"
}
```

### 1.4. Xử Lý Lỗi Chuẩn RFC 7807 (Problem Details)
Khi xảy ra lỗi nghiệp vụ hoặc kiểm thực thất bại, hệ thống phản hồi mã lỗi HTTP tương ứng kèm thông tin chi tiết:

| Mã HTTP | Tên chuẩn | Ý nghĩa nghiệp vụ trong Urban Stitch |
| :--- | :--- | :--- |
| **200 OK** | Success | Truy vấn hoặc thao tác thành công. |
| **201 Created** | Resource Created | Tạo mới thành công (Đơn hàng, Sản phẩm, Biến thể). |
| **400 Bad Request** | Business/Validation Error | Vi phạm quy tắc nghiệp vụ (ví dụ: giỏ hàng rỗng, mã giảm giá hết lượt). |
| **401 Unauthorized** | Authentication Failed | Token không hợp lệ hoặc đã hết hạn. |
| **403 Forbidden** | Access Denied | Không có quyền truy cập (Người dùng thường cố gọi API Admin). |
| **404 Not Found** | Resource Missing | Không tìm thấy tài nguyên theo ID hoặc Slug. |
| **409 Conflict** | Concurrency / Unique Conflict | Xung đột phiên bản khóa lạc quan `RowVersion` hoặc trùng lặp mã SKU. |
| **422 Unprocessable** | Entity Validation Failed | Lỗi xác thực dữ liệu đầu vào không hợp lệ. |
| **500 Internal Error** | Server Exception | Lỗi hệ thống ngoài dự kiến (được bọc bởi Global Exception Handler). |

---

## 2. Phân Hệ Xác Thực & Tài Khoản (Authentication & Identity)

| Phương thức | Đường dẫn API | Mô tả chức năng | Quyền truy cập |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Đăng ký tài khoản khách hàng mới | Public |
| `POST` | `/api/v1/auth/login` | Đăng nhập hệ thống (sinh JWT & Refresh Cookie) | Public |
| `POST` | `/api/v1/auth/refresh-token` | Tự động làm mới Access Token từ Refresh Cookie | Public |
| `POST` | `/api/v1/auth/logout` | Đăng xuất, hủy cookie và thu hồi Refresh Token | Authenticated |
| `GET` | `/api/v1/auth/me` | Lấy thông tin hồ sơ và vai trò người dùng hiện tại | Authenticated |

### Chi tiết: Đăng Nhập Hệ Thống (`POST /api/v1/auth/login`)
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "identifier": "admin@apple-store.com",
    "password": "Admin@123456"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresAt": "2026-11-04T10:30:00Z",
      "user": {
        "id": 1,
        "email": "admin@apple-store.com",
        "fullName": "Quản Trị Viên Cấp Cao",
        "role": "SuperAdmin",
        "avatarUrl": null
      }
    }
  }
  ```

---

## 3. Phân Hệ Danh Mục & Sản Phẩm (Catalog & Storefront)

| Phương thức | Đường dẫn API | Mô tả chức năng | Quyền truy cập |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/categories` | Lấy cây danh mục sản phẩm (iPhone, Mac, iPad,...) | Public |
| `GET` | `/api/v1/categories/{slug}` | Xem thông tin chi tiết một danh mục theo Slug | Public |
| `GET` | `/api/v1/products` | Danh sách sản phẩm kèm bộ lọc, phân trang, sắp xếp | Public |
| `GET` | `/api/v1/products/{idOrSlug}` | Chi tiết sản phẩm, toàn bộ biến thể và thông số | Public |
| `GET` | `/api/v1/products/search` | Tìm kiếm nhanh sản phẩm cho thanh Search Header | Public |
| `GET` | `/api/v1/variants/{id}/price-stock` | Kiểm tra giá và số lượng tồn kho theo thời gian thực | Public |

### Chi tiết: Lọc & Phân Trang Sản Phẩm (`GET /api/v1/products`)
- **Query Parameters:**
  - `page`: Số trang (mặc định `1`).
  - `pageSize`: Kích thước trang (mặc định `12`).
  - `categorySlug`: Lọc theo danh mục (ví dụ `iphone`, `macbook-pro`).
  - `minPrice`, `maxPrice`: Khoảng giá tìm kiếm.
  - `colorId`: Lọc theo ID màu sắc.
  - `storageId`: Lọc theo ID tùy chọn dung lượng.
  - `sortBy`: Tiêu chí sắp xếp (`price_asc`, `price_desc`, `newest`, `bestseller`).

---

## 4. Phân Hệ Giỏ Hàng Thông Minh (Smart Cart System)

| Phương thức | Đường dẫn API | Mô tả chức năng | Quyền truy cập |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/cart` | Lấy chi tiết giỏ hàng hiện tại (kèm kiểm tra tồn kho) | Guest / Customer |
| `POST` | `/api/v1/cart/items` | Thêm biến thể sản phẩm vào giỏ hàng | Guest / Customer |
| `PUT` | `/api/v1/cart/items/{id}` | Cập nhật số lượng hoặc đổi sang biến thể khác | Guest / Customer |
| `DELETE` | `/api/v1/cart/items/{id}` | Xóa một mặt hàng khỏi giỏ | Guest / Customer |
| `DELETE` | `/api/v1/cart/clear` | Làm sạch toàn bộ giỏ hàng | Guest / Customer |
| `POST` | `/api/v1/cart/merge` | Tự động gộp giỏ hàng khách vãng lai khi đăng nhập | Customer |

---

## 5. Phân Hệ Đơn Hàng & Tra Cứu (Order Processing & Lookup)

| Phương thức | Đường dẫn API | Mô tả chức năng | Quyền truy cập |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/orders` | Tạo đơn hàng mới (Bảo vệ 3-Tier Concurrency Lock) | Guest / Customer |
| `GET` | `/api/v1/orders/my-orders` | Danh sách lịch sử đơn hàng của tài khoản thành viên | Customer |
| `GET` | `/api/v1/orders/{id}` | Chi tiết hóa đơn (thông tin người nhận, snapshot máy) | Customer / Admin |
| `POST` | `/api/v1/orders/lookup` | Tra cứu đơn hàng bảo mật bằng Mã đơn + SĐT | Guest (Public) |
| `PUT` | `/api/v1/orders/{id}/cancel` | Hủy đơn hàng (chỉ cho phép khi chưa thanh toán VNPay) | Customer / Admin |
| `PUT` | `/api/v1/orders/{id}/address` | Cập nhật địa chỉ nhận hàng (chỉ cho phép sửa 1 lần duy nhất) | Customer |

### Chi tiết: Tạo Đơn Hàng (`POST /api/v1/orders`)
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "customerName": "Nguyễn Văn A",
    "phoneNumber": "0987654321",
    "email": "customer@apple-store.com",
    "shippingAddress": "Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội",
    "paymentMethod": "VNPay",
    "voucherCode": "APPLE2026",
    "notes": "Giao hàng giờ hành chính",
    "items": [
      {
        "variantId": 12,
        "quantity": 1
      }
    ]
  }
  ```
- **Phản hồi khi thành công (201 Created):**
  Trả về mã đơn hàng `orderCode`, tổng số tiền thanh toán cuối cùng và `paymentUrl` (nếu chọn phương thức VNPay).

---

## 6. Phân Hệ Thanh Toán VNPay Đẳng Cấp (VNPay Integration)

| Phương thức | Đường dẫn API | Mô tả chức năng | Quyền truy cập |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/payments/vnpay/create-url` | Tạo đường dẫn thanh toán trực tuyến VNPay Sandbox | Authenticated / Guest |
| `POST` | `/api/v1/payments/vnpay/retry-url` | **Tính năng Retry vô hạn**: Sinh URL thanh toán mới toanh cho đơn chưa trả tiền | Customer |
| `GET` | `/api/v1/payments/vnpay/ipn` | **Webhook IPN thực tế**: Nhận thông báo ngầm từ VNPay server | VNPay Server |
| `GET` | `/api/v1/payments/vnpay/callback` | Tiếp nhận chuyển hướng trình duyệt của khách hàng | Public |

### Hợp Đồng Webhook IPN (`GET /api/v1/payments/vnpay/ipn`)
- **Nguyên lý bảo mật:**
  1. Trích xuất toàn bộ Query Parameters nhận được từ VNPay.
  2. Sắp xếp các tham số theo bảng chữ cái A-Z và tính toán chữ ký số HMAC-SHA512 với `vnp_HashSecret`.
  3. So sánh chữ ký số: nếu trùng khớp 100% và mã `vnp_ResponseCode == "00"`, hệ thống kích hoạt Transaction cập nhật trạng thái đơn sang `Paid` và phương thức sang `Completed`.
  4. Phản hồi cho VNPay Server định dạng JSON bắt buộc:
     ```json
     {
       "RspCode": "00",
       "Message": "Confirm Success"
     }
     ```

---

## 7. Phân Hệ Quản Trị Hệ Thống (Admin Portal Endpoints)

### 7.1. Quản Trị Danh Mục & Sản Phẩm Toàn Diện
| Phương thức | Đường dẫn API | Mô tả nghiệp vụ |
| :--- | :--- | :--- |
| `POST` | `/api/v1/admin/products` | Khởi tạo sản phẩm Apple mới |
| `PUT` | `/api/v1/admin/products/{id}` | Cập nhật thông tin chung sản phẩm |
| `DELETE` | `/api/v1/admin/products/{id}` | Xóa mềm sản phẩm (Soft Delete) |
| `POST` | `/api/v1/admin/products/{id}/variants` | Tạo biến thể sản phẩm mới (SKU, giá, tồn kho) |
| `PUT` | `/api/v1/admin/variants/{id}` | Cập nhật giá bán và tồn kho biến thể |
| `POST` | `/api/v1/admin/products/{id}/images` | Tải lên và gán ảnh theo màu sắc (Cloudinary CDN) |
| `PUT` | `/api/v1/admin/products/{id}/specs` | Lưu ma trận thông số kỹ thuật phân cấp |

### 7.2. Quản Trị Đơn Hàng & Tài Khoản Người Dùng
| Phương thức | Đường dẫn API | Mô tả nghiệp vụ |
| :--- | :--- | :--- |
| `GET` | `/api/manager/orders` | Danh sách đơn hàng toàn hệ thống với bộ lọc đa chiều |
| `PUT` | `/api/manager/orders/{id}/status` | Chuyển trạng thái đơn (`Processing` $\rightarrow$ `Shipped` $\rightarrow$ `Delivered`) |
| `POST` | `/api/manager/orders/{id}/cancel` | Hủy đơn hàng và tự động phục hồi tồn kho sản phẩm |
| `GET` | `/hangfire` | **Bảng điều khiển trực quan Hangfire Dashboard (giám sát tự động hóa Jobs, Lịch trình, Lịch sử)** |
| `GET` | `/api/manager/users` | Danh sách tài khoản khách hàng và nhân sự |
| `PUT` | `/api/manager/users/{id}/toggle-status` | Khóa hoặc kích hoạt lại tài khoản người dùng |

---

## 8. Phân Hệ Thống Kê Báo Cáo & Xuất Excel (`/admin/reports`)

Toàn bộ 6 API phục vụ Trung tâm Điều hành Báo cáo Quản trị:

| Phương thức | Đường dẫn API | Dữ liệu trả về & Định dạng |
| :--- | :--- | :--- |
| `GET` | `/api/v1/admin/reports/dashboard-kpi` | 4 thẻ KPI: Doanh thu thực tế, Tổng đơn hàng, Số khách hàng mới, Tỷ lệ đơn thành công. |
| `GET` | `/api/v1/admin/reports/revenue-trends` | Mảng dữ liệu doanh thu kép (Doanh thu đã thu vs Doanh thu tạm tính) theo ngày/tuần/tháng. |
| `GET` | `/api/v1/admin/reports/order-status-distribution` | Cơ cấu tỷ lệ phần trăm phân bổ trên 6 trạng thái đơn hàng. |
| `GET` | `/api/v1/admin/reports/payment-method-share` | Tỷ trọng thanh toán: VNPay Trực tuyến vs Tiền mặt COD. |
| `GET` | `/api/v1/admin/reports/category-inventory` | Báo cáo số lượng tồn kho và tổng giá trị vốn lưu kho theo ngành hàng Apple. |
| `GET` | `/api/v1/admin/reports/export-excel` | **Xuất tệp Excel `.xlsx` trực tiếp**: Stream luồng nhị phân từ ClosedXML OpenXML, định dạng bảng tính kế toán chuyên nghiệp. |

---

## 9. Tổng Kết Bảng Mã Lỗi Nghiệp Vụ Chuẩn Hóa

| Mã nghiệp vụ | Lời nhắn hệ thống (Vietnamese) | Nguyên nhân & Hướng giải quyết |
| :--- | :--- | :--- |
| `ERR_STOCK_INSUFFICIENT` | Số lượng sản phẩm trong kho không đủ đáp ứng | Tồn kho biến thể nhỏ hơn số lượng khách đặt mua. |
| `ERR_CONCURRENCY_CONFLICT` | Dữ liệu đã bị thay đổi bởi giao dịch khác. Vui lòng thử lại! | Xung đột `RowVersion` khi 2 khách cùng đặt món hàng cuối cùng. |
| `ERR_ORDER_ALREADY_PAID` | Đơn hàng đã được thanh toán thành công, không thể hủy bỏ! | Bảo vệ nghiệp vụ: ngăn chặn hủy đơn hàng đã thanh toán qua VNPay. |
| `ERR_ADDRESS_ALREADY_UPDATED` | Địa chỉ giao hàng chỉ được phép cập nhật duy nhất 1 lần! | Ngăn ngừa việc gian lận thay đổi địa chỉ liên tục khi đơn đang chuẩn bị giao. |
| `ERR_VNPAY_SIGNATURE_INVALID` | Chữ ký số giao dịch không hợp lệ | Chữ ký HMAC-SHA512 gửi tới Webhook IPN không khớp với bảo mật server. |
| `ERR_VOUCHER_EXPIRED` | Mã giảm giá đã hết hạn sử dụng hoặc hết lượt áp dụng | Kiểm tra điều kiện ngày hiệu lực và số lượng còn lại của Voucher. |

