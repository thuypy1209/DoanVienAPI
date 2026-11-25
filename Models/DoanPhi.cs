using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DoanVienAPI.Models
{
    public class DoanPhi
    {
        [Key]
        public int Id { get; set; }

        public int SinhVienId { get; set; }
        [ForeignKey("SinhVienId")]
        public SinhVien? SinhVien { get; set; }

        public string HocKy { get; set; } = "HK1"; // HK1, HK2, HK3
        public string NamHoc { get; set; } = "2025-2026";
        public decimal SoTien { get; set; } = 24000; // 24.000 VNĐ / kỳ

        public string TrangThai { get; set; } = "ChuaNop"; // ChuaNop, DaNop
        public DateTime? NgayNop { get; set; }
        public string? NguoiThu { get; set; } // Bí thư chi đoàn hoặc cán bộ thu
    }
}
