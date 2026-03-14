using DoanVienAPI.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DoanVienAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class SinhVienController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SinhVienController(AppDbContext context)
        {
            _context = context;
        }

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
        [HttpPost("upload-avatar")]
        public async Task<IActionResult> UploadAvatar(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0) return BadRequest("Vui lòng chọn file.");

                // 👇 SỬA: Dùng MSSV cho đồng bộ với GetMe
                var mssvClaim = User.Claims.FirstOrDefault(c => c.Type == "MSSV");
                if (mssvClaim == null) return Unauthorized();
                string mssv = mssvClaim.Value;

                // Tìm User theo MSSV
                var sinhVien = await _context.SinhViens.FirstOrDefaultAsync(s => s.MSSV == mssv);
                if (sinhVien == null) return NotFound("Không tìm thấy sinh viên.");

                // ... (Đoạn lưu file giữ nguyên) ...
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "avatars");
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);
                var uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(fileStream);
                }

                // Cập nhật DB
                string relativePath = $"/uploads/avatars/{uniqueFileName}";
                sinhVien.AvatarUrl = relativePath;
                _context.SinhViens.Update(sinhVien);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Upload thành công", avatarUrl = relativePath });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi Server: {ex.Message}");
            }
        }
    }
}
