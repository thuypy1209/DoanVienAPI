# DoanVienWeb - Cổng Web Quản Lý Đoàn Viên & Sinh Viên

Dự án Web Frontend độc lập được xây dựng bằng **React.js (Vite + TypeScript + Tailwind CSS)**, kết nối trực tiếp với hệ sinh thái **DoanVienAPI (ASP.NET Core 9)** và đồng bộ dữ liệu với ứng dụng di động **Android App**.

---

## 🏛️ Kiến Trúc Hệ Sinh Thái 3 Dự Án Độc Lập

```
               ┌────────────────────────────────────────────────────────┐
               │         Backend API & Realtime Hub                    │
               │         (f:\Github\DoanVienAPI - Port 5000)           │
               └───────────────────────▲────────────────────────────────┘
                                       │
                      REST API (JWT)   │   SignalR Socket (/chathub)
                                       │
             ┌─────────────────────────┴────────────────────────┐
             │                                                  │
             ▼                                                  ▼
┌─────────────────────────────┐                    ┌─────────────────────────────┐
│       Web Frontend          │                    │        Android App          │
│   (e:\Web\DoanVienWeb)      │                    │ (e:\Android App\quanlidoanvien)│
│  React.js + Vite + Tailwind │                    │      Flutter / Mobile       │
│  • Bảng điều khiển Admin    │                    │  • Quét QR Code điểm danh   │
│  • Quản lý phong trào       │                    │  • Đăng ký & Nhận thông báo │
│  • Kênh chat & Thông báo    │                    │  • Điểm rèn luyện cá nhân   │
└─────────────────────────────┘                    └─────────────────────────────┘
```

---

## 🚀 Công Nghệ Sử Dụng

- **Framework:** React 19 + TypeScript + Vite 8
- **Styling:** Tailwind CSS v4
- **Routing:** React Router DOM v7
- **HTTP Client:** Axios (Interceptors tự động đính kèm `Bearer JWT Token` và chuyển hướng khi hết hạn)
- **Realtime:** `@microsoft/signalr` kết nối kênh `/chathub` (tin nhắn tức thời & nhảy số chuông thông báo)
- **Icons:** Lucide React

---

## 📁 Cấu Trúc Thư Mục

```
e:\Web\DoanVienWeb/
├── .env                       # Cấu hình biến môi trường (API URL, SignalR URL)
├── vite.config.ts             # Cấu hình Vite & Tailwind
├── package.json
└── src/
    ├── api/                   # Gọi API Backend
    │   ├── axiosClient.ts     # Axios instance với JWT Interceptor
    │   ├── authApi.ts         # Đăng nhập & Đăng ký
    │   ├── hoatDongApi.ts     # CRUD hoạt động, danh sách đăng ký, duyệt Check-in, QR
    │   └── sinhVienApi.ts     # Lấy thông tin cá nhân, upload avatar
    ├── components/
    │   ├── common/
    │   │   └── ProtectedRoute.tsx # Phân quyền bảo vệ route theo vai trò (Admin / SinhVien)
    │   └── layout/
    │       ├── Navbar.tsx     # Header có chuông thông báo SignalR & avatar
    │       ├── Sidebar.tsx    # Menu theo vai trò và thẻ điểm rèn luyện
    │       └── MainLayout.tsx # Khung layout chính
    ├── context/
    │   └── AuthContext.tsx    # Quản lý phiên đăng nhập và quyền hạn
    ├── hooks/
    │   └── useSignalR.ts      # Hook kết nối Socket SignalR Hub (/chathub)
    ├── pages/
    │   ├── auth/
    │   │   └── LoginPage.tsx  # Giao diện đăng nhập (có nút thử nhanh Admin)
    │   ├── admin/
    │   │   ├── AdminDashboard.tsx # Bảng điều khiển thống kê
    │   │   ├── HoatDongManager.tsx# Quản lý hoạt động, phát mã QR, duyệt check-in
    │   │   └── SinhVienManager.tsx# Quản lý đoàn viên, tiện ích Excel
    │   ├── student/
    │   │   ├── StudentPortal.tsx  # Cổng sinh viên đăng ký hoạt động
    │   │   ├── StudentHistory.tsx # Lịch sử tham gia & điểm danh trực tiếp
    │   │   └── StudentProfile.tsx # Hồ sơ cá nhân & đổi avatar
    │   └── chat/
    │       └── ChatRoom.tsx   # Phòng chat trực tuyến thời gian thực
    ├── types/                 # Kiểu dữ liệu TypeScript
    ├── App.tsx                # Hệ thống định tuyến (Routing)
    └── main.tsx
```

---

## ⚡ Hướng Dẫn Khởi Chạy

### 1. Khởi động Backend (ASP.NET Core API):
```powershell
cd "f:\Github\DoanVienAPI"
dotnet run
```
*Backend sẽ lắng nghe tại: `http://localhost:5000` (Swagger UI: `http://localhost:5000/swagger`)*

### 2. Khởi động Web Frontend:
```powershell
cd "e:\Web\DoanVienWeb"
npm run dev
```
*Truy cập trình duyệt tại: `http://localhost:3000`*

---

## 🔑 Tài Khoản Mặc Định

| Vai trò | Tài khoản | Mật khẩu | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `123456` | Toàn quyền Quản lý hoạt động, sinh mã QR, duyệt điểm danh và quản lý sinh viên. |
| **Sinh viên** | *Mã số sinh viên (MSSV)* | *Mật khẩu đã đăng ký / MSSV* | Xem & đăng ký hoạt động, điểm danh, đổi avatar và chat hỗ trợ. |
