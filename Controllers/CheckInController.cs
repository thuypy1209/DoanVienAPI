using DoanVienAPI.Data;
using DoanVienAPI.Models;
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
    public class CheckInController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CheckInController(AppDbContext context)
        {
            _context = context;
        }

        // 1. API XỬ LÝ QUÉT MÃ QR (Quan trọng nhất)
        [HttpPost("submit")]
        public async Task<IActionResult> SubmitCheckIn([FromBody] CheckInRequest request)
        {
            // A. Lấy ID Sinh viên từ Token
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized("Token lỗi.");
            int sinhVienId = int.Parse(userIdString);

            // B. Phân tích mã QR (Giả sử mã QR chính là ID của Hoạt động, ví dụ: "10")
            if (!int.TryParse(request.QrCode, out int hoatDongId))
            {
                return BadRequest("Mã QR không hợp lệ (Phải là số ID hoạt động).");
            }

            // C. Kiểm tra hoạt động có tồn tại không
            var hoatDong = await _context.HoatDongs.FindAsync(hoatDongId);
            if (hoatDong == null) return NotFound("Hoạt động không tồn tại.");

            // D. Kiểm tra xem sinh viên đã đăng ký chưa
            var dangKy = await _context.DangKyHoatDongs
                .FirstOrDefaultAsync(dk => dk.SinhVienId == sinhVienId && dk.HoatDongId == hoatDongId);

            // --- TRƯỜNG HỢP 1: ĐÃ ĐĂNG KÝ TRƯỚC ĐÓ ---
            if (dangKy != null)
            {
                if (dangKy.TrangThai == "DaThamGia")
                {
                    return BadRequest("Bạn đã check-in hoạt động này rồi!");
                }

                // Cập nhật trạng thái
                dangKy.TrangThai = "DaThamGia";
                dangKy.ThoiGianCheckIn = DateTime.Now;
            }
            // --- TRƯỜNG HỢP 2: CHƯA ĐĂNG KÝ (Cho phép Check-in luôn - Walk-in) ---
            else
            {
                // Tạo mới bản ghi check-in luôn
                dangKy = new DangKyHoatDong
                {
                    SinhVienId = sinhVienId,
                    HoatDongId = hoatDongId,
                    NgayDangKy = DateTime.Now,
                    ThoiGianCheckIn = DateTime.Now,
                    TrangThai = "DaThamGia"
                };
                _context.DangKyHoatDongs.Add(dangKy);
            }

            // E. CỘNG ĐIỂM CHO SINH VIÊN (Logic giống trong HoatDongController của bạn)
            var sinhVien = await _context.SinhViens.FindAsync(sinhVienId);
            if (sinhVien != null)
            {
                // Cộng điểm rèn luyện tích lũy
                sinhVien.DiemRenLuyenTichLuy += (int)hoatDong.DiemCong;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = $"Check-in thành công! Bạn được cộng {hoatDong.DiemCong} điểm.",
                tenHoatDong = hoatDong.TenHoatDong
            });
        }

        // 2. API LẤY LỊCH SỬ CHECK-IN (Chỉ lấy những cái đã tham gia)
        [HttpGet("history")]
        public async Task<IActionResult> GetCheckInHistory()
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
            int sinhVienId = int.Parse(userIdString);

            var list = await _context.DangKyHoatDongs
                .Where(dk => dk.SinhVienId == sinhVienId) // Lấy của sinh viên này
                .Include(dk => dk.HoatDong) // Join bảng Hoạt động
                .OrderByDescending(dk => dk.ThoiGianCheckIn ?? dk.NgayDangKy)
                .Select(dk => new
                {
                    id = dk.Id,
                    tenHoatDong = dk.HoatDong.TenHoatDong,
                    thoiGianCheckIn = dk.ThoiGianCheckIn, // Có thể null nếu chưa check-in
                    isSuccess = dk.TrangThai == "DaThamGia", // True nếu đã check-in
                    diemCong = dk.HoatDong.DiemCong
                })
                .ToListAsync();

            return Ok(list);
        }
    }

    // Class hứng dữ liệu JSON từ Flutter gửi lên
    public class CheckInRequest
    {
        public string QrCode { get; set; }
    }
}