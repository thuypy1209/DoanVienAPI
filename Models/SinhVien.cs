using System.ComponentModel.DataAnnotations;

namespace DoanVienAPI.Models
{
    public class SinhVien
    {
        [Key]
        public int Id { get; set; } 
        public string MSSV { get; set; } = string.Empty; 
        public string HoTen { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? Lop { get; set; }
        public string? Khoa { get; set; }
        public string? Email { get; set; }
        public int DiemRenLuyenTichLuy { get; set; } = 0;
        public string? AvatarUrl { get; set; }

        // ==========================================
        // THÔNG TIN ĐẶC THÙ ĐOÀN VIÊN
        // ==========================================
        public DateTime? NgayVaoDoan { get; set; }
        public string? NoiVaoDoan { get; set; }
        public string? SoDoanVien { get; set; }
        public string ChucVuDoan { get; set; } = "DoanVien"; // DoanVien, BiThu, PhoBiThu, UyVienBCH
        public string TrangThaiDoan { get; set; } = "ChinhThuc"; // ChinhThuc, ChuaKetNap, TruongThanhDoan
        public bool LaDoanVienUuTu { get; set; } = false;

        // Navigation properties
        public ICollection<DangKyHoatDong> DanhSachThamGia { get; set; } = new List<DangKyHoatDong>();
        public ICollection<DoanPhi> DanhSachDoanPhi { get; set; } = new List<DoanPhi>();
        public ICollection<XepLoaiDoanVien> DanhSachXepLoai { get; set; } = new List<XepLoaiDoanVien>();
        public SoDoan? SoDoan { get; set; }
    }
}
