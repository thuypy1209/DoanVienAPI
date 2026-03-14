# ⚙️ Quản Lý Đoàn Viên API (Backend)
Hệ thống API phục vụ cho ứng dụng Quản lý Đoàn viên, xử lý logic nghiệp vụ, lưu trữ dữ liệu và bảo mật hệ thống.

### 🛠 Công nghệ sử dụng

- Framework: ASP.NET Core

- Database: SQL Server

- ORM: Entity Framework Core

- Authentication: JWT (JSON Web Token)

- Real-time: SignalR

- Documentation: Swagger UI

# 📖 API Endpoints chính

- Auth: /api/auth/login, /api/auth/register (Xác thực người dùng).

- Sinh viên: /api/sinhvien (Lấy danh sách và thêm mới sinh viên).

- Hoạt động: /api/hoatdong (Quản lý các hoạt động phong trào).

### 🚀 Hướng dẫn cài đặt (Local)
1. Clone dự án:

```bash 
  git clone https://github.com/thuypy1209/DoanVienAPI.git
  
  cd DoanVienAPI

  ```
2. Cấu hình Database:

Mở tệp appsettings.json và cập nhật chuỗi DefaultConnection phù hợp với SQL Server của bạn.
``` bash

  JSON
  "ConnectionStrings": {
      "DefaultConnection": "Server=localhost;Database=QuanLyDoanVien;Trusted_Connection=True;..."
  }

```
3. Khởi tạo Cơ sở dữ liệu:

Xóa thư mục Migrations hiện có 

Chạy các lệnh sau trong Terminal:


``` bash

  dotnet ef migrations add InitialCreate
  dotnet ef database update

```

4. Chạy ứng dụng:

``` bash
  dotnet run
```




  
