using DoanVienAPI.Data;
using DoanVienAPI.Hubs;
using DoanVienAPI.Models;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DoanVienAPI.Controllers
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme + "," + CookieAuthenticationDefaults.AuthenticationScheme)]
    public class ChatController : Controller
    {
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly AppDbContext _context;

        public ChatController(AppDbContext context, IHubContext<ChatHub> hubContext)
        {
            _hubContext = hubContext;
            _context = context;
        }

        // 1. DÀNH CHO MVC RAZOR VIEW TRÊN CỔNG 5000
        [Authorize(AuthenticationSchemes = CookieAuthenticationDefaults.AuthenticationScheme, Roles = "Admin")]
        public async Task<IActionResult> Index()
        {
            var messages = await _context.ChatMessages
                .OrderBy(m => m.Timestamp)
                .Take(50)
                .ToListAsync();

            var unreadMessages = await _context.ChatMessages.Where(m => !m.IsRead).ToListAsync();
            if (unreadMessages.Any())
            {
                foreach (var msg in unreadMessages)
                {
                    msg.IsRead = true;
                }
                await _context.SaveChangesAsync();
            }

            ViewBag.TinNhanMoi = 0;
            return View(messages);
        }

        // ==========================================
        // 2. DÀNH CHO REST API (REACT WEB & ANDROID APP)
        // ==========================================

        // GET: /api/Chat/messages - Lấy lịch sử tin nhắn
        [HttpGet("/api/Chat/messages")]
        public async Task<IActionResult> GetMessages()
        {
            var messages = await _context.ChatMessages
                .OrderByDescending(m => m.Timestamp)
                .Take(100)
                .OrderBy(m => m.Timestamp)
                .ToListAsync();

            // Nếu người dùng là Admin, đánh dấu đã đọc để chuông tắt
            var isAdmin = User.IsInRole("Admin") || User.FindFirst(ClaimTypes.Role)?.Value == "Admin";
            if (isAdmin)
            {
                var unread = await _context.ChatMessages.Where(m => !m.IsRead).ToListAsync();
                if (unread.Any())
                {
                    foreach (var m in unread) m.IsRead = true;
                    await _context.SaveChangesAsync();
                    await _hubContext.Clients.All.SendAsync("UpdateBellCount");
                }
            }

            return Ok(messages);
        }

        // POST: /api/Chat/mark-read - Đánh dấu tất cả tin nhắn đã đọc
        [HttpPost("/api/Chat/mark-read")]
        public async Task<IActionResult> MarkRead()
        {
            var unread = await _context.ChatMessages.Where(m => !m.IsRead).ToListAsync();
            if (unread.Any())
            {
                foreach (var m in unread) m.IsRead = true;
                await _context.SaveChangesAsync();
                await _hubContext.Clients.All.SendAsync("UpdateBellCount");
            }
            return Ok(new { message = "Đã đánh dấu đã đọc" });
        }

        // GET: /Chat/GetUnreadCount và /api/Chat/unread-count
        [HttpGet("/api/Chat/unread-count")]
        [HttpGet("/Chat/GetUnreadCount")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUnreadCount()
        {
            var count = await _context.ChatMessages.CountAsync(m => !m.IsRead);
            return Ok(count);
        }
    }
}
