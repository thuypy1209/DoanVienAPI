using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
namespace DoanVienAPI.Models
{
    public class ChatMessage
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string User { get; set; } = string.Empty; // MSSV hoặc tên SV
        [Required]
        public string Message { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.Now;
        public bool IsRead { get; set; } = false; // Mặc định là chưa đọc
        public string? Receiver { get; set; }
    }
}