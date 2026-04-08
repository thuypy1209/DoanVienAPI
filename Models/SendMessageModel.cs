namespace DoanVienAPI.Models
{
    public class SendMessageModel
    {
        public string SenderId { get; set; } = string.Empty; // ID người gửi (MSSV)
        public string Message { get; set; } = string.Empty;  // Nội dung tin nhắn
    }
}
