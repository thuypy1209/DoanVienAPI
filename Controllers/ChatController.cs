using DoanVienAPI.Hubs;
using DoanVienAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace DoanVienAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ChatController : Controller
    {
        private readonly IHubContext<ChatHub> _hubContext;
        public ChatController(IHubContext<ChatHub> hubContext)
        {
            _hubContext = hubContext;
        }
        // POST: api/Chat/send
        [HttpPost("send")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageModel model)
        {
            // Kiểm tra dữ liệu đầu vào
            if (model == null || string.IsNullOrEmpty(model.Message))
            {
                return BadRequest("Nội dung tin nhắn không được để trống.");
            }

            // Gửi tin nhắn đến tất cả các client đang lắng nghe sự kiện "ReceiveMessage"
            // Tên sự kiện phải khớp với connection.on("ReceiveMessage", ...) ở Web và Flutter
            await _hubContext.Clients.All.SendAsync("ReceiveMessage", model.SenderId, model.Message);

            return Ok(new { success = true, message = "Tin nhắn đã được gửi qua Hub thành công." });
        }
    }
}
