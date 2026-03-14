using System.Security.Claims;
using System.Text.Json;
using DoanVienAPI.Data;
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

        public async Task SendMessage(string message)
        {
            // Lấy tên người gửi từ Claim (dù là Admin hay Sinh viên)
            var userName = Context.User?.Identity?.Name ?? "Người dùng";

            // Gửi một Object đồng nhất cho tất cả các bên
            await Clients.All.SendAsync("ReceiveMessage", new
            {
                user = userName,
                message = message,
                timestamp = DateTime.Now.ToString("HH:mm")
            });
        }
    }
}
