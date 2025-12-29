using DoanVienAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DoanVienAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SinhVienController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SinhVienController(AppDbContext context)
        {
            _context = context;
        }

        // Thêm API này để test:
        [Authorize] // <--- Bắt buộc phải có Token mới gọi được
        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            // 1. Giải mã Token để lấy MSSV
            var mssvClaim = User.Claims.FirstOrDefault(c => c.Type == "MSSV");

            if (mssvClaim == null)
            {
                return Unauthorized("Không tìm thấy thông tin xác thực.");
            }

            string mssv = mssvClaim.Value;

            // 2. Tìm sinh viên trong Database bằng MSSV vừa lấy được
            var sv = await _context.SinhViens.FirstOrDefaultAsync(s => s.MSSV == mssv);

            if (sv == null)
            {
                return NotFound("Không tìm thấy dữ liệu sinh viên.");
            }

            // 3. Trả về kết quả
            return Ok(new
            {
                sv.MSSV,
                sv.HoTen,
                sv.Lop,
                sv.Khoa,
                sv.Email,
                sv.DiemRenLuyenTichLuy
            });
        }
    }
}
