namespace DoanVienAPI.Models
{
    public class ChungNhan
    {
        public int Id { get; set; }
        public string MaChungNhan { get; set; } 
        public DateTime NgayCap { get; set; }

        public int SinhVienId { get; set; }
        public virtual SinhVien SinhVien { get; set; }

        public int HoatDongId { get; set; }
        public virtual HoatDong HoatDong { get; set; }
    }
}
