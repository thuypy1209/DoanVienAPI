using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DoanVienAPI.Models
{
    public class XepLoaiDoanVien
    {
        [Key]
        public int Id { get; set; }

        public int SinhVienId { get; set; }
        [ForeignKey("SinhVienId")]
        public SinhVien? SinhVien { get; set; }

        public string NamHoc { get; set; } = "2025-2026";
        public string XepLoai { get; set; } = "Kha"; // XuatSac, Kha, TrungBinh, Yeu
        public string? TuDanhGia { get; set; }
        public string? ChiDoanDanhGia { get; set; }
        public bool DoanKhoaDuyet { get; set; } = false;
    }
}
