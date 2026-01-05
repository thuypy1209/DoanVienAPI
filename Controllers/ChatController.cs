using Microsoft.AspNetCore.Mvc;

namespace DoanVienAPI.Controllers
{
    public class ChatController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
