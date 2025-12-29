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

        public ICollection<DangKyHoatDong> DanhSachThamGia { get; set; } = new List<DangKyHoatDong>();
    }
}
