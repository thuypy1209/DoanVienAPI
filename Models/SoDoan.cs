using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DoanVienAPI.Models
{
    public class SoDoan
    {
        [Key]
        public int Id { get; set; }

        public int SinhVienId { get; set; }
        [ForeignKey("SinhVienId")]
        public SinhVien? SinhVien { get; set; }

        public string TrangThaiSoDoan { get; set; } = "DaNop"; // DaNop, ChuaNop, DaRut
        public DateTime? NgayNop { get; set; }
        public string? ViTriLuuTru { get; set; } // Ví dụ: "Tủ A - Ngăn Khoa CNTT"
        public bool GiayGioiThieuHe { get; set; } = false; // Đã cấp giấy giới thiệu sinh hoạt hè
    }
}
