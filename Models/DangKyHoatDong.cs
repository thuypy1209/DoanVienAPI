using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace DoanVienAPI.Models
{
    public class DangKyHoatDong
    {
        [Key]
        public int Id { get; set; }
        public int SinhVienId { get; set; }
        [ForeignKey("SinhVienId")]
        public SinhVien? SinhVien { get; set; }

        // Liên kết Hoạt động
        public int HoatDongId { get; set; }
        [ForeignKey("HoatDongId")]
        public HoatDong? HoatDong { get; set; }
        public DateTime NgayDangKy { get; set; } = DateTime.Now;

        public DateTime? ThoiGianCheckIn { get; set; }
        public string TrangThai { get; set; } = "DaDangKy";
        public string? MaChungNhan { get; set; }
        public string? LinkTaiChungNhan { get; set; }
    }
}
