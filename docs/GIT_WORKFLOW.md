# QUY TRÌNH & CHUẨN MỰC GIT (Git Workflow & Commit Guidelines)

Tài liệu này định hình quy chuẩn bắt buộc về Git, cấu trúc commit và quy trình đẩy mã nguồn (push) cho toàn bộ dự án **ecommerce-apple-store**. Mọi AI Agent và lập trình viên khi hoàn thành một chức năng hoặc một đơn vị công việc đều phải tuân thủ nghiêm ngặt các quy tắc dưới đây.

---

## 1. Cấu trúc Commit Message Chuẩn (Conventional Commits)

Mọi commit bắt buộc phải tuân theo cấu trúc:

```text
<type>: <mô tả ngắn bằng tiếng Anh>

- <chi tiết thay đổi 1 bằng tiếng Anh>
- <chi tiết thay đổi 2 bằng tiếng Anh>
- <chi tiết thay đổi 3 bằng tiếng Anh>
```

### 1.1. Quy tắc bắt buộc:
1. **Tuyệt đối KHÔNG sử dụng scope** trong tiêu đề:
   - ✅ HỢP LỆ: `feat: implement product variants management`
   - ❌ KHÔNG HỢP LỆ: `feat(catalog): implement product variants management`
   - ❌ KHÔNG HỢP LỆ: `feat(variants): implement product variants management`
2. **Tiêu đề (Header/Summary):**
   - Viết hoàn toàn bằng **tiếng Anh**.
   - Bắt đầu bằng chữ thường sau dấu `:` và khoảng trắng.
   - Thể mệnh lệnh (imperative mood), không chia thì quá khứ (dùng `add`, `implement`, `update`, `refactor`, không dùng `added`, `implemented`, `updating`).
   - Tối đa 72 ký tự, **không có dấu chấm `.` ở cuối dòng**.
3. **Thân commit (Body):**
   - Cách tiêu đề bằng **1 dòng trống**.
   - Bắt buộc có các gạch đầu dòng (`- `) mô tả cụ thể các công việc đã thực hiện.
   - Viết hoàn toàn bằng **tiếng Anh**.
   - Mỗi gạch đầu dòng bắt đầu bằng chữ hoa, nêu rõ hành động và thành phần bị tác động.

---

## 2. Danh sách Commit Types được phép sử dụng

| Type | Ý nghĩa & Khi nào sử dụng |
| :--- | :--- |
| `feat` | Phát triển tính năng mới cho BE hoặc FE (tạo API, thêm màn hình, thêm components). |
| `fix` | Sửa lỗi logic, sửa lỗi hiển thị DOM, sửa lỗi API 500, 404, validation sai. |
| `refactor` | Tái cấu trúc mã nguồn mà không làm thay đổi hành vi nghiệp vụ (tách helper, tối ưu specs). |
| `test` | Thêm mới hoặc cập nhật kịch bản kiểm thử tự động Playwright headless. |
| `style` | Căn chỉnh giao diện CSS, Tailwind, Ant Design, định dạng mã nguồn. |
| `docs` | Thêm mới, cập nhật tài liệu trong thư mục `./docs/` hoặc README. |
| `chore` | Cập nhật cấu hình build, dependencies, package.json, scripts không ảnh hưởng logic. |
| `perf` | Tối ưu hóa hiệu năng truy vấn database, caching React Query, bundle size. |

---

## 3. Các ví dụ mẫu chuẩn (Reference Examples)

### Ví dụ 1: Tái cấu trúc Controller (Refactor)
```text
refactor: separate manager and public category APIs

- Add paginated CRUD endpoints for manager categories
- Add read-only public category endpoints
- Organize controllers by access level for future authorization
```

### Ví dụ 2: Thêm tính năng Màu sắc (Feature)
```text
feat: implement manager colors CRUD module

- Add color domain specifications, DTOs, and service layer
- Implement manager colors API controller with pagination and validation
- Create color management UI page with Ant Design table and modal forms
- Add color hex preview and Zod form validation
```

### Ví dụ 3: Thêm tính năng Biến thể sản phẩm (Feature)
```text
feat: implement product variants and stock management

- Add product variant entity specifications, DTOs, and service
- Implement optimistic concurrency control via RowVersion token
- Build variant table UI with SKU, pricing, and stock controls
- Validate SKU uniqueness and non-negative price rules
```

### Ví dụ 4: Sửa lỗi kiểm thử Playwright (Fix)
```text
fix: resolve modal submission and selector timeout in color tests

- Update color picker input selector to support headless DOM events
- Ensure query cache invalidation after successful color creation
- Fix missing table row refresh on dialog dismiss
```

### Ví dụ 5: Kịch bản kiểm thử Playwright (Test)
```text
test: add headless e2e test suite for product catalog

- Create headless Playwright test covering product creation and variant linking
- Add automated assertion for SKU duplication conflict response
- Verify Vietnamese UI validation feedback in headless execution
```

---

## 4. Quy trình Tự động Commit & Push (Auto Push Protocol)

Khi một AI Agent hoặc lập trình viên hoàn thành một tác vụ:
1. Đảm bảo toàn bộ kịch bản kiểm thử Playwright Headless **đã PASS 100%**.
2. Kiểm tra `git status` để đảm bảo không có file rác, file tạm, file log trình duyệt.
3. Chạy lệnh thêm thay đổi vào staging:
   ```bash
   git add .
   ```
4. Tạo commit theo đúng cú pháp chuẩn:
   ```bash
   git commit -m "feat: implement manager storage options module" -m "- Add storage options service and controller endpoints
   - Create storage options admin management page
   - Add Playwright headless test verification"
   ```
5. Đẩy code lên nhánh từ xa (remote repository):
   ```bash
   git push origin main
   ```
6. Cập nhật trạng thái hoàn thành vào bảng Checklist trong file `docs/ADMIN_ROADMAP_TODO.md`.
