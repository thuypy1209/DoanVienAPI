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
                // 1. Kiểm tra file có tồn tại không
                if (file == null || file.Length == 0)
                {
                    return BadRequest("Vui lòng chọn file ảnh.");
                }

                // 2. Lấy ID sinh viên từ Token
                var userId = User.FindFirst("Id")?.Value;
                if (string.IsNullOrEmpty(userId)) return Unauthorized();

                // 3. Tạo đường dẫn lưu file
                // Ảnh sẽ lưu trong thư mục: wwwroot/uploads/avatars
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "avatars");

                // Tạo thư mục nếu chưa có
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                // Tạo tên file độc nhất (tránh trùng tên)
                var uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                // 4. Lưu file vào ổ cứng Server
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(fileStream);
                }

                // 5. Cập nhật đường dẫn ảnh vào Database
                var sinhVien = _context.SinhViens.FirstOrDefault(s => s.Id.ToString() == userId);
                if (sinhVien != null)
                {
                    // Lưu đường dẫn tương đối để sau này dễ hiển thị
                    // Ví dụ: /uploads/avatars/abc-123.jpg
                    string relativePath = $"/uploads/avatars/{uniqueFileName}";
                    sinhVien.AvatarUrl = relativePath;

                    _context.SinhViens.Update(sinhVien);
                    await _context.SaveChangesAsync();

                    // 6. Trả về đường dẫn ảnh mới cho App hiển thị
                    return Ok(new { message = "Upload thành công", avatarUrl = relativePath });
                }

                return NotFound("Không tìm thấy sinh viên.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi Server: {ex.Message}");
            }
        }
    }
}
