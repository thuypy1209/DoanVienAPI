namespace DoanVienAPI.Models
{
    public class SendMessageModel
    {
        public string SenderId { get; set; } // ID người gửi (MSSV)
        public string Message { get; set; }  // Nội dung tin nhắn
    }
}
