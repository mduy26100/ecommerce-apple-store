# Hệ Thống Thương Mại Điện Tử Urban Stitch

> Hệ thống thương mại điện tử Urban Stitch chuyên biệt cho hệ sinh thái sản phẩm công nghệ Apple (iPhone, Mac, iPad, Apple Watch, AirPods và Phụ kiện chính hãng). Dự án được thiết kế theo tiêu chuẩn công nghiệp với kiến trúc chịu tải cao, module hóa linh hoạt và quản trị dữ liệu chặt chẽ.

---

## 1. Giới thiệu tổng quan

Dự án **Urban Stitch** là nền tảng bán lẻ trực tuyến toàn diện bao gồm 2 phân hệ độc lập:
- **Cửa hàng trực tuyến (Storefront):** Trải nghiệm mua sắm đẳng cấp thương hiệu Urban Stitch dành cho khách hàng với giao diện mượt mà, tối ưu hóa tìm kiếm, chuyển đổi biến thể màu sắc/dung lượng tức thì và xem thông số kỹ thuật phân cấp chuyên sâu.
- **Cổng quản trị (Admin Portal):** Hệ thống quản trị tập trung dành cho ban quản lý giúp kiểm soát danh mục, thuộc tính biến thể động, sản phẩm, hình ảnh, đơn hàng, khách hàng và phân quyền bảo mật.

---

## 2. Tóm tắt Công nghệ sử dụng (Tech Stack)

| Phân hệ | Công nghệ cốt lõi | Vai trò & Kiến trúc |
| :--- | :--- | :--- |
| **Backend** | **.NET 8 (C#)** | Xây dựng theo nguyên lý **Clean Architecture** kết hợp **Onion Architecture** đa tầng, phân tách rành mạch giữa nghiệp vụ cốt lõi và hạ tầng kỹ thuật. |
| **Database** | **SQL Server** | Hệ quản trị cơ sở dữ liệu quan hệ mạnh mẽ, phân tách schemas (`catalog`, `sales`, `identity`), kiểm soát ràng buộc toàn vẹn và concurrency lock. |
| **Frontend** | **ReactJS (React 19 + TypeScript)** | Xây dựng theo mô hình **Feature-based Architecture**, đóng gói độc lập theo phân hệ Storefront và Admin; phân tách State giữa TanStack Query và Zustand. |
| **DevOps & Container** | **Docker & Docker Compose** | Tự động hóa đóng gói multi-stage, kiểm soát startup healthcheck nghiêm ngặt, tự động hóa migration và nạp seed data an toàn. |

---

## 3. Mục lục tài liệu kiến trúc & Thiết kế

Để nắm bắt chi tiết từng khía cạnh kỹ thuật của hệ thống, vui lòng tham khảo các tài liệu chuyên sâu dưới đây:

- 📊 **[Thiết kế Cơ sở Dữ liệu (DATABASE_DESIGN.md)](./DATABASE_DESIGN.md):**  
  Sơ đồ quan hệ thực thể (ERD), từ điển dữ liệu chi tiết toàn bộ các bảng, các khóa chính/ngoại, chỉ mục (Index) và giải trình kiến trúc dữ liệu linh hoạt (Dynamic Variant EAV, Grouped Specifications) dành riêng cho ngành hàng điện tử viễn thông.

- 🏛️ **[Kiến trúc Hệ thống (SYSTEM_ARCHITECTURE.md)](./SYSTEM_ARCHITECTURE.md):**  
  Mô hình phân tầng Onion Architecture cho Backend, kiến trúc Feature-based cho Frontend, luồng di chuyển dữ liệu (Data Flow) từ Client tới Database và các chuẩn mực thiết kế API Response.

- 📈 **[Báo cáo Tiến độ Dự án (PROJECT_PROGRESS.md)](./PROJECT_PROGRESS.md):**  
  Bảng theo dõi tiến độ thực tế của nhóm, phân loại rõ các tính năng đã hoàn thành, các phần đang code dở và các dự định tiếp theo.

- 💳 **[Tích hợp Cổng thanh toán VNPay Sandbox (PAYMENT_INTEGRATION.md)](./PAYMENT_INTEGRATION.md):**  
  Kiến trúc Clean Architecture phân tầng cho dịch vụ thanh toán, luồng xử lý Return URL & IPN Webhook, mã hóa HMAC-SHA512, cơ chế thanh toán lại và kiểm thử tự động toàn diện với Playwright.

