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

        // POST: api/HoatDong/them
        [HttpPost("them")]
        public async Task<IActionResult> ThemHoatDong([FromBody] HoatDong hoatDong)
        {
            _context.HoatDongs.Add(hoatDong);
            await _context.SaveChangesAsync();
            return Ok(hoatDong);
        }
        // GET: api/HoatDong
        [HttpGet]
        public async Task<IActionResult> GetHoatDongs()
        {
            // Lấy danh sách, sắp xếp cái nào mới nhất lên đầu
            var list = await _context.HoatDongs
                                     .OrderByDescending(h => h.ThoiGianBatDau)
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

            // 4. Tạo bản ghi đăng ký mới
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
        // 1. API SỬA HOẠT ĐỘNG (PUT)
        [HttpPut("{id}")]
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


            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật thành công!" });
        }

        // 2. API XÓA HOẠT ĐỘNG (DELETE)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHoatDong(int id)
        {
            var hd = await _context.HoatDongs.FindAsync(id);
            if (hd == null) return NotFound();

            _context.HoatDongs.Remove(hd);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã xóa hoạt động!" });
        }
        [HttpGet("{id}/danhsach")]
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
        // 4. API DUYỆT / CHECK-IN CHO SINH VIÊN
        [HttpPost("checkin/{dangKyId}")]
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
        [HttpGet("qr/{id}")]
        public IActionResult GenerateQRCode(int id)
        {
            // 1. Lấy thông tin hoạt động từ Database
            var hoatDong = _context.HoatDongs.FirstOrDefault(h => h.Id == id);

            if (hoatDong == null)
            {
                return NotFound(new { message = "Không tìm thấy hoạt động" });
            }

            // 2. Đóng gói dữ liệu muốn lưu vào QR
            // Lưu ý: Đặt tên biến ngắn gọn (id, ten, time) để QR đỡ bị dày đặc
            var dataQR = new
            {
                id = hoatDong.Id,
                ten = hoatDong.TenHoatDong,
                diaDiem = hoatDong.DiaDiem,
                // Format ngày giờ cho đẹp
                time = hoatDong.ThoiGianBatDau.ToString("HH:mm dd/MM/yyyy")
            };

            // 3. Chuyển Object thành chuỗi JSON
            // Ví dụ: {"id":4,"ten":"Rung Chuông Vàng","diaDiem":"Hội trường A","time":"13:30 05/10/2025"}
            string payload = JsonSerializer.Serialize(dataQR);

            // 4. Tạo hình ảnh QR
            using (QRCodeGenerator qrGenerator = new QRCodeGenerator())
            {
                // ECCLevel.Q (Quarter): Chịu lỗi 25%, giúp quét nhanh hơn
                QRCodeData qrCodeData = qrGenerator.CreateQrCode(payload, QRCodeGenerator.ECCLevel.Q);

                PngByteQRCode qrCode = new PngByteQRCode(qrCodeData);

                // 20 pixels per module -> Ảnh nét, to rõ
                byte[] qrCodeBytes = qrCode.GetGraphic(20);

                // Trả về file ảnh PNG
                return File(qrCodeBytes, "image/png");
            }
        }
    }

}
