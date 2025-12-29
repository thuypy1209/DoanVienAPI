using System.ComponentModel.DataAnnotations;
namespace DoanVienAPI.Models
{
    public class RegisterModel
    {
        [Required(ErrorMessage = "MSSV không được để trống")]
        public string MSSV { get; set; } = string.Empty;
        [Required(ErrorMessage = "Mật khẩu không được để trống")]
        public string Password { get; set; } = string.Empty;
        [Required(ErrorMessage = "Vui lòng nhập lại mật khẩu")]
        [Compare("Password", ErrorMessage = "Mật khẩu nhập lại không khớp!")]
        public string ConfirmPassword { get; set; } = string.Empty;
        public string HoTen { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Lop { get; set; } = string.Empty;
        public string Khoa { get; set; } = string.Empty;
    }
}
