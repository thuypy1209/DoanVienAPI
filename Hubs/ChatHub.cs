using System.Security.Claims;
using System.Text.Json;
using DoanVienAPI.Data;
using DoanVienAPI.Models;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace DoanVienAPI.Hubs
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme + "," + CookieAuthenticationDefaults.AuthenticationScheme)]
    public class ChatHub : Hub
    {
        private readonly AppDbContext _context;

        public ChatHub(AppDbContext context)
        {
            _context = context;
        }

        public async Task SendMessage(string user, string message)
        {
            // Lấy tên người gửi từ Claim (dù là Admin hay Sinh viên)
            var chatMsg = new ChatMessage
            {
                User = user,
                Message = message,
                Timestamp = DateTime.Now,
                IsRead = false // Mặc định chưa đọc để nhảy số chuông
            };

            _context.ChatMessages.Add(chatMsg);
            await _context.SaveChangesAsync();

            // 2. Gửi tin nhắn realtime cho mọi người
            await Clients.All.SendAsync("ReceiveMessage", user, message);

            // 3. Gửi lệnh yêu cầu cái chuông trên Navbar cập nhật số lượng
            await Clients.All.SendAsync("UpdateBellCount");
        }
    }
}
