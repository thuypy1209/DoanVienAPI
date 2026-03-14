using System.ComponentModel.DataAnnotations;

namespace DoanVienAPI.Models
{
    public class HoatDong
    {
        [Key]
        public int Id { get; set; }

        public string TenHoatDong { get; set; } = string.Empty;
        public string MoTa { get; set; } = string.Empty;

        public DateTime ThoiGianBatDau { get; set; }
        public DateTime ThoiGianKetThuc { get; set; }

        public string DiaDiem { get; set; } = string.Empty;

        // Số điểm cộng khi tham gia (phục vụ tính điểm rèn luyện)
        public int DiemCong { get; set; } = 0;

        // Trạng thái: Sắp diễn ra, Đang diễn ra, Đã kết thúc
        public string TrangThai { get; set; } = "SapDienRa";
        public string? ImageUrl { get; set; }
    }
}
