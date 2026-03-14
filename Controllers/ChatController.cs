using DoanVienAPI.Hubs;
using DoanVienAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace DoanVienAPI.Controllers
{
    [Authorize]
    public class ChatController : Controller
    {
        private readonly IHubContext<ChatHub> _hubContext;

        public ChatController(IHubContext<ChatHub> hubContext)
        {
            _hubContext = hubContext;
        }
        public IActionResult Index()
        {
            // Trả về View tại: Views/Chat/Index.cshtml
            return View();
        }
    }
}
