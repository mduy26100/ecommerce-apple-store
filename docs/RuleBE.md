# QUY CHUẨN PHÁT TRIỂN BACKEND (RuleBE)

Tài liệu này là quy chuẩn bắt buộc dành cho lập trình viên và AI Agent khi tham gia phát triển backend của dự án. Mọi đóng góp mã nguồn (PR/commit) phải tuân thủ nghiêm ngặt 100% các nguyên tắc dưới đây.

---

## 1. Kiến trúc tổng thể & Chiều phụ thuộc (Clean Architecture)

Hệ thống tuân thủ mô hình phân lớp một chiều nghiêm ngặt:

```
[Domain] <─────── [Application] <─────── [Infrastructure]
   ^                     ^                      ^
   │                     │                      │
   └─────────────────────┴──────────────────────[Host]
```

### Nguyên tắc phụ thuộc một chiều
| Dự án (Layer) | Phụ thuộc (References) | Nghiêm cấm tuyệt đối |
| :--- | :--- | :--- |
| **Domain** | **Độc lập hoàn toàn** (Không reference tới bất kỳ layer nào). | Cấm reference project khác; Cấm cài đặt EF Core hoặc bất kỳ thư viện ORM/Database nào. |
| **Application** | Chỉ reference tới **Domain**. | Cấm reference `Infrastructure` hoặc `Host`; Cấm cài đặt `Microsoft.EntityFrameworkCore` hoặc các thư viện liên quan đến DB. Mọi truy vấn DB phải thông qua `IRepository<T>` và `ISpecification<T>`. |
| **Infrastructure** | Reference tới **Domain** và **Application**. | Triển khai cụ thể các interface trừu tượng từ Application (EF Core, Identity, SQL Server, Repository). |
| **Host** | Reference tới **Domain**, **Application**, **Infrastructure**. | Đóng vai trò là entrypoint khởi chạy ứng dụng (Web API), cấu hình DI, Middlewares, Filters và Controllers. |

---

## 2. Quy tắc viết Code (Coding Conventions)

### 2.1. Cấm Comment trong Code
- **Tuyệt đối KHÔNG viết comment vào mã nguồn** (`//`, `/* */`, `/// <summary>`).
- Code phải tự giải thích (Self-explanatory) thông qua:
  - Tên class, interface, method, biến mang ý nghĩa tường minh, rõ nghĩa.
  - Tách các đoạn logic phức tạp hoặc lặp lại thành private helper methods nhỏ gọn.
  - Cấu trúc clean, mạch lạc, dễ đọc.

### 2.2. Block-scoped Namespace
- **Bắt buộc** sử dụng cú pháp block-scoped namespace:
  ```csharp
  namespace Application.Features.Catalog.Categories.Services
  {
      public class CategoryService : ICategoryService
      {
          // Code ở đây
      }
  }
  ```
- **Tuyệt đối KHÔNG** sử dụng file-scoped namespace (`namespace Foo.Bar;`).

### 2.3. Quy tắc GlobalUsings
- **Tất cả các thư viện bên ngoài** (`System.*`, `Microsoft.*`, `Ardalis.*`, các thư viện NuGet bên thứ 3) **bắt buộc phải được khai báo trong file `GlobalUsings.cs`** của từng project tương ứng (`Domain/GlobalUsings.cs`, `Application/GlobalUsings.cs`, `Infrastructure/GlobalUsings.cs`, `Host/GlobalUsings.cs`).
- Các file `.cs` cụ thể **chỉ được phép `using` các namespace nội bộ của solution** (`Domain.*`, `Application.*`, `Infrastructure.*`, `Host.*`).
  ```csharp
  // HỢP LỆ trong file .cs:
  using Application.Features.Catalog.Categories.DTOs;
  using Application.Wrappers;
  using Domain.Entities.Catalog;

  // KHÔNG HỢP LỆ trong file .cs (phải đưa ra GlobalUsings.cs):
  using System.Text.Json;
  using Microsoft.AspNetCore.Mvc;
  using Ardalis.Specification;
  ```

---

## 3. Quy chuẩn API Response & Xử lý Nghiệp vụ

### 3.1. Chuẩn hoá ApiResponse Wrapper
Mọi response trả về client đều được middleware/filter tự động bọc theo cấu trúc chuẩn:
```json
{
  "data": ...,
  "meta": {
    "timestamp": "2026-10-18T00:00:00Z",
    "path": "/api/...",
    "method": "GET",
    "statusCode": 200,
    "traceId": "...",
    "cursorPagedResult": null
  },
  "error": null
}
```

### 3.2. Phương thức Ghi (Create / Update / Delete)
- Các hàm `CreateAsync`, `UpdateAsync`, `DeleteAsync` trong Service layer **trả về `Task` (không trả về đối tượng)**.
- Controller trả về `return Ok();`.
- Filter tự động bọc thành `ApiResponse` với `data: null`, mã HTTP 200.

### 3.3. Phương thức Đọc & Phân trang (Read & Pagination)
- **Input**: Kế thừa `PagedRequest` (nằm trong `Application.Wrappers`):
  - Tự động clamp: `PageNumber <= 0` ép về `1`. `PageSize <= 0` ép về `10`; `PageSize > 50` ép về `50`.
  - Có sẵn trường `string? Search` phục vụ tìm kiếm từ khóa.
- **Output**: Trả về `PagedList<T>` (nằm trong `Application.Wrappers`):
  - Tự động bóc tách dữ liệu danh sách vào `data`.
  - Tự động gán thông số phân trang vào `meta.cursorPagedResult` (`pageNumber`, `pageSize`, `totalCount`, `totalPages`, `hasPreviousPage`, `hasNextPage`).
- **Danh sách Public**: Viết hàm riêng (ví dụ `GetAllAsync`) sử dụng Specification lọc `IsActive == true` và sắp xếp theo `DisplayOrder` để phục vụ giao diện người dùng (Storefront).

### 3.4. Xử lý Lỗi & Exception
- Khi có lỗi nghiệp vụ hoặc không tìm thấy bản ghi, ném trực tiếp Exception kế thừa từ `Domain.Exceptions`:
  - `NotFoundException` $\rightarrow$ Tự động chuyển thành HTTP 404 Not Found.
  - `ConflictException` $\rightarrow$ Tự động chuyển thành HTTP 409 Conflict (trùng tên, trùng slug, trùng dữ liệu duy nhất).
  - `BusinessRuleException` $\rightarrow$ Tự động chuyển thành HTTP 400 Bad Request.
  - `UnauthorizedException` $\rightarrow$ Tự động chuyển thành HTTP 401 Unauthorized.
  - `ForbiddenException` $\rightarrow$ Tự động chuyển thành HTTP 403 Forbidden.
- **Tuyệt đối không** tự `return BadRequest("...")` hay `return NotFound()` thủ công trong Controller; hãy để Service ném exception để middleware xử lý thống nhất.

---

## 4. Quy chuẩn Controller (Tách biệt Manager & Public)

Các Controller bắt buộc phải chia thành 2 thư mục riêng biệt tại `Host/Controllers/`:

```
src/Host/Controllers/
├── Manager/
│   ├── BaseManagerController.cs     # Kế thừa ControllerBase, [ApiController], prefix: api/manager/[controller]
│   └── [Feature]Controller.cs       # Đầy đủ CRUD + Phân trang phục vụ Admin / Quản trị
└── Public/
    ├── BasePublicController.cs      # Kế thừa ControllerBase, [ApiController], prefix: api/[controller]
    └── [Feature]Controller.cs       # Read-only (GetAll, GetById, GetBySlug) phục vụ người dùng / Storefront
```

- **Manager Controller**:
  - Route: `[Route("api/manager/[feature]")]`
  - Tag: `[Tags("Manager - [Feature]")]`
  - Sẵn sàng gắn quyền `[Authorize(Roles = "...")]`.
- **Public Controller**:
  - Route: `[Route("api/[feature]")]` và `[Route("api/public/[feature]")]`
  - Tag: `[Tags("Public - [Feature]")]`

---

## 5. Quy trình & Khuôn mẫu tạo một Feature mới

Khi xây dựng một tính năng mới (ví dụ `Brand`, `Product`, `Order`), hãy triển khai tuần tự theo đúng các bước sau:

### Bước 1: Khai báo Entity (Domain)
Tạo entity kế thừa `BaseEntity<int>` tại `Domain/Entities/{Module}/{Entity}.cs`:
```csharp
using Domain.Common;

namespace Domain.Entities.Catalog
{
    public class Brand : BaseEntity<int>
    {
        public string Name { get; set; } = default!;
        public string Slug { get; set; } = default!;
        public string? Description { get; set; }
        public int DisplayOrder { get; set; } = 0;
    }
}
```

### Bước 2: Tạo DTOs (Application)
Tạo tại `Application/Features/{Module}/{FeaturePlural}/DTOs/`:
- `{Entity}Dto.cs`: Dữ liệu trả về cho client.
- `Create{Entity}Request.cs`: Dữ liệu khi tạo mới.
- `Update{Entity}Request.cs`: Dữ liệu khi cập nhật.
- `{Entity}PagedRequest.cs`: Kế thừa `PagedRequest`, bổ sung các filter riêng nếu cần (ví dụ `bool? IsActive`).

### Bước 3: Tạo Specifications (Application)
Tạo tại `Application/Features/{Module}/{FeaturePlural}/Specifications/`:
- `{Entity}FilterSpec.cs`: Specification phân trang, tìm kiếm từ khóa, sắp xếp.
- `Active{Entity}Spec.cs`: Specification lấy tất cả bản ghi active cho storefront.
- `{Entity}ByNameSpec.cs` & `{Entity}BySlugSpec.cs`: Phục vụ kiểm tra trùng lặp (hỗ trợ loại trừ Id khi update).

### Bước 4: Tạo Service Interface & Implementation (Application)
Tạo tại `Application/Features/{Module}/{FeaturePlural}/Services/`:
- `I{Entity}Service.cs`:
  ```csharp
  using Application.Features.Catalog.Brands.DTOs;
  using Application.Wrappers;

  namespace Application.Features.Catalog.Brands.Services
  {
      public interface IBrandService
      {
          Task<PagedList<BrandDto>> GetPagedAsync(BrandPagedRequest request, CancellationToken cancellationToken = default);
          Task<IReadOnlyList<BrandDto>> GetAllAsync(CancellationToken cancellationToken = default);
          Task<BrandDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);
          Task<BrandDto> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
          Task CreateAsync(CreateBrandRequest request, CancellationToken cancellationToken = default);
          Task UpdateAsync(int id, UpdateBrandRequest request, CancellationToken cancellationToken = default);
          Task DeleteAsync(int id, CancellationToken cancellationToken = default);
      }
  }
  ```
- `{Entity}Service.cs`:
  - Khử lặp code bằng các helper methods nội bộ:
    - `GetEntityOrThrowAsync(id)`: Lấy theo Id hoặc ném `NotFoundException`.
    - `ValidateEntityAsync(name, slug, excludeId)`: Kiểm tra rỗng và trùng lặp Name/Slug.
    - `MapToDto(entity)`: Ánh xạ thực thể sang DTO.

### Bước 5: Đăng ký Service vào DI (Application)
Cập nhật [DependencyInjection.cs](file:///c:/Users/Admin/Documents/ecommerce-apple-store/apple-store-app/src/App/Application/DependencyInjection.cs):
```csharp
services.AddScoped<IBrandService, BrandService>();
```

### Bước 6: Khai báo EntityTypeConfiguration (Infrastructure)
Tạo file cấu hình Fluent API tại `Infrastructure/Persistence/Configurations/{Module}/{Entity}Configuration.cs`:
```csharp
using Domain.Constants;
using Domain.Entities.Catalog;

namespace Infrastructure.Persistence.Configurations.Catalog
{
    public class BrandConfiguration : IEntityTypeConfiguration<Brand>
    {
        public void Configure(EntityTypeBuilder<Brand> builder)
        {
            builder.ToTable("Brands", SchemaNames.Catalog);
            builder.HasKey(b => b.Id);
            builder.Property(b => b.Name).IsRequired().HasMaxLength(150);
            builder.Property(b => b.Slug).IsRequired().HasMaxLength(150);
            builder.HasIndex(b => b.Slug).IsUnique();
        }
    }
}
```
Khai báo `DbSet<{Entity}>` vào [AppDbContext.cs](file:///c:/Users/Admin/Documents/ecommerce-apple-store/apple-store-app/src/App/Infrastructure/Persistence/AppDbContext.cs).

### Bước 7: Tạo Controllers (Host)
Tạo 2 Controller tương ứng:
- [Host/Controllers/Public/{FeaturePlural}Controller.cs](file:///c:/Users/Admin/Documents/ecommerce-apple-store/apple-store-app/src/Host/Controllers/Public/): Kế thừa `BasePublicController`, chỉ chứa `GetAll`, `GetById`, `GetBySlug`.
- [Host/Controllers/Manager/{FeaturePlural}Controller.cs](file:///c:/Users/Admin/Documents/ecommerce-apple-store/apple-store-app/src/Host/Controllers/Manager/): Kế thừa `BaseManagerController`, chứa `GetPaged`, `GetById`, `Create`, `Update`, `Delete`.
