using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace DoanVienAPI.Controllers
{
    public class AccountController : Controller
    {
        // 1. Hiển thị trang đăng nhập
        [HttpGet]
        public IActionResult Login()
        {
            if (User.Identity!.IsAuthenticated)
            {
                return RedirectToAction("Index", "Admin");
            }
            return View();
        }

        // 2. Xử lý khi bấm nút Đăng nhập
        [HttpPost]
        public async Task<IActionResult> Login(string username, string password)
        {
            // Kiểm tra tài khoản (Có thể sửa thành check Database ở đây)
            if (username == "admin" && password == "123456")
            {
                // Tạo thông tin người dùng (Claims)
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, username),
                    new Claim(ClaimTypes.Role, "Admin")
                };

                var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                var authProperties = new AuthenticationProperties();

                // Ghi Cookie đăng nhập
                await HttpContext.SignInAsync(
                    CookieAuthenticationDefaults.AuthenticationScheme,
                    new ClaimsPrincipal(claimsIdentity),
                    authProperties);

                return RedirectToAction("Index", "Admin");
            }

            // Đăng nhập sai
            ViewBag.Error = "Tài khoản hoặc mật khẩu không đúng!";
            return View();
        }

        // 3. Đăng xuất
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return RedirectToAction("Login", "Account");
        }

}
}
