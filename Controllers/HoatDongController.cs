using System.Security.Claims;
using DoanVienAPI.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DoanVienAPI.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using QRCoder;
using System.Text.Json;   
using System.Drawing;

namespace DoanVienAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class HoatDongController : ControllerBase
    {
        private readonly AppDbContext _context;

        public HoatDongController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/HoatDong/them (Chỉ Admin)
        [HttpPost("them")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ThemHoatDong([FromBody] HoatDong hoatDong)
        {
            _context.HoatDongs.Add(hoatDong);
            await _context.SaveChangesAsync();
            return Ok(hoatDong);
        }

        // POST: api/HoatDong/upload-image (Chỉ Admin)
        [HttpPost("upload-image")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0) return BadRequest("Vui lòng chọn file.");
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "activities");
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);
                var uniqueFileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(file.FileName);
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(fileStream);
                }

                string relativePath = $"/uploads/activities/{uniqueFileName}";
                return Ok(new { message = "Upload ảnh thành công", imageUrl = relativePath });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi Server: {ex.Message}");
            }
        }
        // GET: api/HoatDong (Cho phép tất cả xem danh sách hoạt động)
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetHoatDongs()
        {
            var list = await _context.HoatDongs
                .OrderByDescending(h => h.ThoiGianBatDau)
                .Select(h => new
                {
                    h.Id,
                    h.TenHoatDong,
                    h.MoTa,
                    h.ThoiGianBatDau,
                    h.ThoiGianKetThuc,
                    h.DiaDiem,
                    h.DiemCong,
                    h.TrangThai,
                    h.ImageUrl,
                    h.LoaiHoatDong,
                    h.SoLuongGioiHan,
                    SoLuongDaDangKy = _context.DangKyHoatDongs.Count(dk => dk.HoatDongId == h.Id)
                })
                .ToListAsync();
            return Ok(list);
        }
        // 3. API ĐĂNG KÝ THAM GIA HOẠT ĐỘNG (POST)
        [HttpPost("dangky/{hoatDongId}")]
        public async Task<IActionResult> DangKy(int hoatDongId)
        {
            // 1. Lấy User ID từ Claims 
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdString))
            {
                return Unauthorized("Token không hợp lệ hoặc đã hết hạn.");
            }

            int sinhVienId = int.Parse(userIdString); // Chuyển đổi sang số nguyên

            // 2. Kiểm tra Hoạt động có tồn tại không
            var hd = await _context.HoatDongs.FindAsync(hoatDongId);
            if (hd == null) return NotFound("Hoạt động không tồn tại.");

            // 3. Kiểm tra xem đã đăng ký chưa (Dùng ID lấy từ Token)
            var daDangKy = await _context.DangKyHoatDongs
                .AnyAsync(dk => dk.SinhVienId == sinhVienId && dk.HoatDongId == hoatDongId);

            if (daDangKy)
            {
                return BadRequest("Bạn đã đăng ký hoạt động này rồi.");
            }

            // 4. Kiểm tra giới hạn số lượng tham gia
            if (hd.SoLuongGioiHan.HasValue && hd.SoLuongGioiHan.Value > 0)
            {
                var count = await _context.DangKyHoatDongs.CountAsync(dk => dk.HoatDongId == hoatDongId);
                if (count >= hd.SoLuongGioiHan.Value)
                {
                    return BadRequest($"Hoạt động này đã đủ số lượng tham gia tối đa ({hd.SoLuongGioiHan.Value} người).");
                }
            }

            // 5. Tạo bản ghi đăng ký mới
            var dangKy = new DangKyHoatDong
            {
                SinhVienId = sinhVienId,
                HoatDongId = hoatDongId,
                NgayDangKy = DateTime.Now,
                TrangThai = "DaDangKy"
            };

            _context.DangKyHoatDongs.Add(dangKy);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đăng ký thành công!", data = dangKy });
        }
        // GET: api/HoatDong/lich-su - Xem lịch sử đăng ký của bản thân
        [HttpGet("lich-su")]
        public async Task<IActionResult> GetLichSu()
        {
            // Lấy ID từ Token
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
            int sinhVienId = int.Parse(userIdString);

            var list = await _context.DangKyHoatDongs
                .Where(dk => dk.SinhVienId == sinhVienId)
                .Include(dk => dk.HoatDong) // Kèm thông tin hoạt động
                .OrderByDescending(dk => dk.NgayDangKy)
                .Select(dk => new
                {
                    id = dk.Id,
                    hoatDongId = dk.HoatDongId,
                    dk.HoatDong.TenHoatDong,
                    dk.HoatDong.DiaDiem,
                    ThoiGian = dk.HoatDong.ThoiGianBatDau,
                    dk.TrangThai,
                    dk.HoatDong.DiemCong,
                    ImageUrl = dk.HoatDong.ImageUrl
                })
                .ToListAsync();

            return Ok(list);
        }
        // 1. API SỬA HOẠT ĐỘNG (PUT - Chỉ Admin)
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateHoatDong(int id, [FromBody] HoatDong model)
        {
            if (id != model.Id) return BadRequest("ID không khớp");

            var hd = await _context.HoatDongs.FindAsync(id);
            if (hd == null) return NotFound();

            // Cập nhật thông tin
            hd.TenHoatDong = model.TenHoatDong;
            hd.MoTa = model.MoTa;
            hd.DiaDiem = model.DiaDiem;
            hd.ThoiGianBatDau = model.ThoiGianBatDau;
            hd.ThoiGianKetThuc = model.ThoiGianKetThuc;
            hd.DiemCong = model.DiemCong;
            hd.TrangThai = model.TrangThai;

            hd.ImageUrl = model.ImageUrl;
            hd.LoaiHoatDong = string.IsNullOrEmpty(model.LoaiHoatDong) ? hd.LoaiHoatDong : model.LoaiHoatDong;
            hd.SoLuongGioiHan = model.SoLuongGioiHan;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật thành công!" });
        }

        // 2. API XÓA HOẠT ĐỘNG (DELETE - Chỉ Admin)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteHoatDong(int id)
        {
            var hd = await _context.HoatDongs.FindAsync(id);
            if (hd == null) return NotFound();

            // Xóa các đăng ký liên quan trước để tránh lỗi khóa ngoại
            var dks = _context.DangKyHoatDongs.Where(d => d.HoatDongId == id);
            _context.DangKyHoatDongs.RemoveRange(dks);

            _context.HoatDongs.Remove(hd);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã xóa hoạt động!" });
        }

        // 3. XEM DANH SÁCH ĐĂNG KÝ (Chỉ Admin)
        [HttpGet("{id}/danhsach")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetDanhSachDangKy(int id)
        {
            var list = await _context.DangKyHoatDongs
                .Where(dk => dk.HoatDongId == id)
                .Include(dk => dk.SinhVien) // Kèm thông tin sinh viên
                .Select(dk => new
                {
                    dk.Id, // Mã đăng ký
                    dk.SinhVien.HoTen,
                    dk.SinhVien.MSSV,
                    dk.SinhVien.Lop,
                    dk.NgayDangKy,
                    dk.TrangThai // DaDangKy, DaCheckIn...
                })
                .ToListAsync();

            return Ok(list);
        }

        // 4. API DUYỆT / CHECK-IN CHO SINH VIÊN (Chỉ Admin)
        [HttpPost("checkin/{dangKyId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CheckIn(int dangKyId)
        {
            var dk = await _context.DangKyHoatDongs.FindAsync(dangKyId);
            if (dk == null) return NotFound();

            dk.TrangThai = "DaThamGia"; // Đổi trạng thái
            dk.ThoiGianCheckIn = DateTime.Now;

            // Cộng điểm cho sinh viên (Logic quan trọng)
            var hd = await _context.HoatDongs.FindAsync(dk.HoatDongId);
            var sv = await _context.SinhViens.FindAsync(dk.SinhVienId);

            if (hd != null && sv != null)
            {
                sv.DiemRenLuyenTichLuy += (int)hd.DiemCong; // Cộng điểm tích lũy
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Check-in thành công, đã cộng điểm!" });
        }
        [AllowAnonymous]
        [HttpGet("qr/{id}")]
        public IActionResult GenerateQRCode(int id)
        {
            
            var hoatDong = _context.HoatDongs.AsNoTracking().FirstOrDefault(h => h.Id == id);

            if (hoatDong == null)
            {
                return NotFound(new { message = "Không tìm thấy hoạt động" });
            }

            
            var dataQR = new
            {
                id = hoatDong.Id,
                type = "CHECKIN_ACTIVITY", 
                ten = hoatDong.TenHoatDong
            };

            string payload = JsonSerializer.Serialize(dataQR);


            using (QRCodeGenerator qrGenerator = new QRCodeGenerator())
            {
                
                QRCodeData qrCodeData = qrGenerator.CreateQrCode(payload, QRCodeGenerator.ECCLevel.Q);
                PngByteQRCode qrCode = new PngByteQRCode(qrCodeData);
                byte[] qrCodeBytes = qrCode.GetGraphic(20);
                return File(qrCodeBytes, "image/png");
            }
        }
        [HttpPost("checkin-by-activity/{hoatDongId}")]
        public async Task<IActionResult> CheckInByActivity(int hoatDongId)
        {

            var userIdString = User.FindFirst("Id")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdString)) return Unauthorized("Token lỗi.");
            int sinhVienId = int.Parse(userIdString);
            var hd = await _context.HoatDongs.FindAsync(hoatDongId);
            if (hd == null) return NotFound(new { message = "Hoạt động không tồn tại" });

            var dangKy = await _context.DangKyHoatDongs
                .FirstOrDefaultAsync(dk => dk.SinhVienId == sinhVienId && dk.HoatDongId == hoatDongId);

            if (dangKy != null)
            {
                if (dangKy.TrangThai == "DaThamGia")
                {
                    return BadRequest(new { message = "Bạn đã check-in rồi!" });
                }

                dangKy.TrangThai = "DaThamGia";
                dangKy.ThoiGianCheckIn = DateTime.Now;
            }
            else
            {
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

            // 4. Cộng điểm cho sinh viên
            var sv = await _context.SinhViens.FindAsync(sinhVienId);
            if (sv != null)
            {
                sv.DiemRenLuyenTichLuy += (int)hd.DiemCong;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = $"Check-in thành công! Cộng {hd.DiemCong} điểm." });
        }
    }

}
