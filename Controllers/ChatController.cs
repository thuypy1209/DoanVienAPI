using DoanVienAPI.Data;
using DoanVienAPI.Hubs;
using DoanVienAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace DoanVienAPI.Controllers
{
    [Authorize]
    public class ChatController : Controller
    {
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly AppDbContext _context;

        public ChatController(AppDbContext context, IHubContext<ChatHub> hubContext)
        {
            _hubContext = hubContext;
            _context = context;
        }
        public async Task<IActionResult> Index()
        {
            // 1. Lấy lịch sử 50 tin nhắn gần nhất để hiển thị
            var messages = await _context.ChatMessages
                .OrderBy(m => m.Timestamp)
                .Take(50)
                .ToListAsync();

            // 2. KHI ADMIN VÀO TRANG NÀY -> Đánh dấu tất cả tin nhắn là ĐÃ ĐỌC
            // Để cái chuông thông báo trên Navbar nó tự mất số
            var unreadMessages = await _context.ChatMessages.Where(m => !m.IsRead).ToListAsync();
            if (unreadMessages.Any())
            {
                foreach (var msg in unreadMessages)
                {
                    msg.IsRead = true;
                }
                await _context.SaveChangesAsync();
            }

            // 3. Truyền số lượng tin nhắn mới (sau khi đã đọc) vào ViewBag để Navbar không bị lỗi
            ViewBag.TinNhanMoi = 0;

            return View(messages);
        }

        // API để lấy số lượng tin nhắn chưa đọc (phục vụ cho cái chuông nhảy số)
        [HttpGet]
        public async Task<IActionResult> GetUnreadCount()
        {
            var count = await _context.ChatMessages.CountAsync(m => !m.IsRead);
            return Ok(count);
        }
    }
}
