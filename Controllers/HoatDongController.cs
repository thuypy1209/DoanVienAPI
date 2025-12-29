using DoanVienAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DoanVienAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HoatDongController : ControllerBase
    {
        private readonly AppDbContext _context;

        public HoatDongController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/HoatDong
        [HttpGet]
        [Authorize] // Phải đăng nhập mới xem được
        public async Task<IActionResult> GetHoatDongs()
        {
            // Lấy danh sách, sắp xếp cái nào mới nhất lên đầu
            var list = await _context.HoatDongs
                                     .OrderByDescending(h => h.ThoiGianBatDau)
                                     .ToListAsync();
            return Ok(list);
        }
    }
}
