using DoanVienAPI.Data;
using DoanVienAPI.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System.Drawing;

namespace DoanVienAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class ChungNhanController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ChungNhanController(AppDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // DÀNH CHO ADMIN & BAN CHẤP HÀNH
        // ==========================================

        // 1. GET: api/ChungNhan (Danh sách chứng nhận điện tử có bộ lọc & thống kê)
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll(
            [FromQuery] int? hoatDongId,
            [FromQuery] string? khoa,
            [FromQuery] string? lop,
            [FromQuery] string? search)
        {
            var query = _context.ChungNhans
                .Include(c => c.SinhVien)
                .Include(c => c.HoatDong)
                .AsQueryable();

            if (hoatDongId.HasValue && hoatDongId.Value > 0)
            {
                query = query.Where(c => c.HoatDongId == hoatDongId.Value);
            }

            if (!string.IsNullOrEmpty(khoa))
            {
                query = query.Where(c => c.SinhVien != null && c.SinhVien.Khoa == khoa);
            }

            if (!string.IsNullOrEmpty(lop))
            {
                query = query.Where(c => c.SinhVien != null && c.SinhVien.Lop != null && c.SinhVien.Lop.Contains(lop));
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(c =>
                    c.MaChungNhan.Contains(search) ||
                    (c.SinhVien != null && (c.SinhVien.MSSV.Contains(search) || c.SinhVien.HoTen.Contains(search))) ||
                    (c.HoatDong != null && c.HoatDong.TenHoatDong.Contains(search)));
            }

            var items = await query
                .OrderByDescending(c => c.NgayCap)
                .Select(c => new
                {
                    c.Id,
                    c.MaChungNhan,
                    c.NgayCap,
                    c.SinhVienId,
                    MSSV = c.SinhVien != null ? c.SinhVien.MSSV : "",
                    HoTen = c.SinhVien != null ? c.SinhVien.HoTen : "",
                    Lop = c.SinhVien != null ? c.SinhVien.Lop : "",
                    Khoa = c.SinhVien != null ? c.SinhVien.Khoa : "",
                    ChucVuDoan = c.SinhVien != null ? c.SinhVien.ChucVuDoan : "DoanVien",
                    c.HoatDongId,
                    TenHoatDong = c.HoatDong != null ? c.HoatDong.TenHoatDong : "",
                    LoaiHoatDong = c.HoatDong != null ? c.HoatDong.LoaiHoatDong : "PhongTrao",
                    DiemCong = c.HoatDong != null ? c.HoatDong.DiemCong : 0,
                    ThoiGianBatDau = c.HoatDong != null ? c.HoatDong.ThoiGianBatDau : DateTime.MinValue,
                    ThoiGianKetThuc = c.HoatDong != null ? c.HoatDong.ThoiGianKetThuc : DateTime.MinValue,
                    DiaDiem = c.HoatDong != null ? c.HoatDong.DiaDiem : ""
                })
                .ToListAsync();

            int tongSo = items.Count;
            int soHoatDong = items.Select(i => i.HoatDongId).Distinct().Count();
            int soSinhVien = items.Select(i => i.SinhVienId).Distinct().Count();

            var danhSachHoatDong = await _context.HoatDongs
                .OrderByDescending(h => h.ThoiGianBatDau)
                .Select(h => new { h.Id, h.TenHoatDong })
                .ToListAsync();

            var danhSachKhoa = await _context.SinhViens.Where(s => s.Khoa != null).Select(s => s.Khoa!).Distinct().ToListAsync();
            var danhSachLop = await _context.SinhViens.Where(s => s.Lop != null).Select(s => s.Lop!).Distinct().ToListAsync();

            return Ok(new
            {
                items,
                stats = new
                {
                    tongSo,
                    soHoatDong,
                    soSinhVien
                },
                filters = new
                {
                    danhSachHoatDong,
                    danhSachKhoa,
                    danhSachLop
                }
            });
        }

        // 2. POST: api/ChungNhan/cap-don (Cấp giấy chứng nhận cho 1 sinh viên)
        [HttpPost("cap-don")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CapDon([FromBody] CapChungNhanRequest request)
        {
            var sv = await _context.SinhViens.FindAsync(request.SinhVienId);
            if (sv == null) return NotFound("Không tìm thấy sinh viên.");

            var hd = await _context.HoatDongs.FindAsync(request.HoatDongId);
            if (hd == null) return NotFound("Không tìm thấy hoạt động.");

            var existing = await _context.ChungNhans
                .FirstOrDefaultAsync(c => c.SinhVienId == request.SinhVienId && c.HoatDongId == request.HoatDongId);
            if (existing != null)
            {
                return BadRequest("Đoàn viên này đã được cấp Giấy chứng nhận cho hoạt động này rồi.");
            }

            string maChungNhan = $"CN-{DateTime.Now.Year}-HD{hd.Id}-{sv.MSSV}";
            var cn = new ChungNhan
            {
                MaChungNhan = maChungNhan,
                NgayCap = DateTime.Now,
                SinhVienId = request.SinhVienId,
                HoatDongId = request.HoatDongId
            };

            await _context.ChungNhans.AddAsync(cn);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Đã cấp Giấy chứng nhận thành công cho {sv.HoTen} ({maChungNhan}).",
                data = new
                {
                    cn.Id,
                    cn.MaChungNhan,
                    cn.NgayCap,
                    sv.MSSV,
                    sv.HoTen,
                    hd.TenHoatDong
                }
            });
        }

        // 3. POST: api/ChungNhan/cap-hang-loat (Cấp hàng loạt cho toàn bộ sinh viên đã check-in DaThamGia)
        [HttpPost("cap-hang-loat")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CapHangLoat([FromBody] CapHangLoatRequest request)
        {
            var hd = await _context.HoatDongs.FindAsync(request.HoatDongId);
            if (hd == null) return NotFound("Không tìm thấy hoạt động.");

            // Lấy danh sách sinh viên đã tham gia hoạt động
            var participants = await _context.DangKyHoatDongs
                .Include(dk => dk.SinhVien)
                .Where(dk => dk.HoatDongId == request.HoatDongId && dk.TrangThai == "DaThamGia" && dk.SinhVien != null)
                .ToListAsync();

            if (participants.Count == 0)
            {
                return BadRequest("Chưa có sinh viên nào check-in 'Đã tham gia' trong hoạt động này.");
            }

            var existingMap = await _context.ChungNhans
                .Where(c => c.HoatDongId == request.HoatDongId)
                .Select(c => c.SinhVienId)
                .ToHashSetAsync();

            var newCerts = new List<ChungNhan>();
            int skippedCount = 0;
            var now = DateTime.Now;

            foreach (var p in participants)
            {
                if (existingMap.Contains(p.SinhVienId))
                {
                    skippedCount++;
                    continue;
                }

                newCerts.Add(new ChungNhan
                {
                    MaChungNhan = $"CN-{now.Year}-HD{hd.Id}-{p.SinhVien!.MSSV}",
                    NgayCap = now,
                    SinhVienId = p.SinhVienId,
                    HoatDongId = hd.Id
                });
            }

            if (newCerts.Count > 0)
            {
                await _context.ChungNhans.AddRangeAsync(newCerts);
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                message = $"Đã cấp mới {newCerts.Count} Giấy chứng nhận cho hoạt động '{hd.TenHoatDong}'.",
                soLuongCapMoi = newCerts.Count,
                soLuongDaCo = skippedCount,
                tongThamGia = participants.Count
            });
        }

        // 4. DELETE: api/ChungNhan/{id} (Thu hồi giấy chứng nhận)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ThuHoi(int id)
        {
            var cn = await _context.ChungNhans.Include(c => c.SinhVien).FirstOrDefaultAsync(c => c.Id == id);
            if (cn == null) return NotFound("Không tìm thấy giấy chứng nhận.");

            _context.ChungNhans.Remove(cn);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Đã thu hồi giấy chứng nhận {cn.MaChungNhan} của sinh viên {cn.SinhVien?.HoTen}."
            });
        }

        // 5. GET: api/ChungNhan/export-excel (Xuất danh sách ra file Excel)
        [HttpGet("export-excel")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ExportExcel(
            [FromQuery] int? hoatDongId,
            [FromQuery] string? khoa,
            [FromQuery] string? lop)
        {
            ExcelPackage.License.SetNonCommercialPersonal("DoanVienAPI");

            var query = _context.ChungNhans
                .Include(c => c.SinhVien)
                .Include(c => c.HoatDong)
                .AsQueryable();

            if (hoatDongId.HasValue && hoatDongId.Value > 0) query = query.Where(c => c.HoatDongId == hoatDongId.Value);
            if (!string.IsNullOrEmpty(khoa)) query = query.Where(c => c.SinhVien != null && c.SinhVien.Khoa == khoa);
            if (!string.IsNullOrEmpty(lop)) query = query.Where(c => c.SinhVien != null && c.SinhVien.Lop != null && c.SinhVien.Lop.Contains(lop));

            var items = await query
                .OrderByDescending(c => c.NgayCap)
                .ToListAsync();

            using (var package = new ExcelPackage())
            {
                var ws = package.Workbook.Worksheets.Add("ChungNhan");

                // Tiêu đề
                ws.Cells["A1:I1"].Merge = true;
                ws.Cells["A1"].Value = "DANH SÁCH CẤP GIẤY CHỨNG NHẬN HOẠT ĐỘNG ĐOÀN";
                ws.Cells["A1"].Style.Font.Size = 16;
                ws.Cells["A1"].Style.Font.Bold = true;
                ws.Cells["A1"].Style.Font.Color.SetColor(Color.FromArgb(30, 58, 138));
                ws.Cells["A1"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                ws.Cells["A2:I2"].Merge = true;
                ws.Cells["A2"].Value = $"Ngày xuất báo cáo: {DateTime.Now:dd/MM/yyyy HH:mm} | Đơn vị: Đoàn Thanh Niên HUTECH";
                ws.Cells["A2"].Style.Font.Italic = true;
                ws.Cells["A2"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                string[] headers = { "STT", "Mã chứng nhận", "MSSV", "Họ và Tên", "Chi đoàn", "Khoa", "Tên hoạt động", "Điểm cộng", "Ngày cấp" };
                for (int i = 0; i < headers.Length; i++)
                {
                    ws.Cells[4, i + 1].Value = headers[i];
                    ws.Cells[4, i + 1].Style.Font.Bold = true;
                    ws.Cells[4, i + 1].Style.Fill.PatternType = ExcelFillStyle.Solid;
                    ws.Cells[4, i + 1].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(224, 242, 254));
                    ws.Cells[4, i + 1].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(147, 197, 253));
                    ws.Cells[4, i + 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                }

                int row = 5;
                int stt = 1;
                foreach (var item in items)
                {
                    ws.Cells[row, 1].Value = stt++;
                    ws.Cells[row, 2].Value = item.MaChungNhan;
                    ws.Cells[row, 2].Style.Font.Bold = true;
                    ws.Cells[row, 3].Value = item.SinhVien?.MSSV ?? "";
                    ws.Cells[row, 4].Value = item.SinhVien?.HoTen ?? "";
                    ws.Cells[row, 5].Value = item.SinhVien?.Lop ?? "";
                    ws.Cells[row, 6].Value = item.SinhVien?.Khoa ?? "";
                    ws.Cells[row, 7].Value = item.HoatDong?.TenHoatDong ?? "";
                    ws.Cells[row, 8].Value = item.HoatDong?.DiemCong ?? 0;
                    ws.Cells[row, 9].Value = item.NgayCap.ToString("dd/MM/yyyy HH:mm");

                    for (int col = 1; col <= 9; col++)
                    {
                        ws.Cells[row, col].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(229, 231, 235));
                    }

                    row++;
                }

                ws.Cells.AutoFitColumns();

                var fileBytes = package.GetAsByteArray();
                string fileName = $"Danh_Sach_Chung_Nhan_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
                return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
        }

        // ==========================================
        // DÀNH CHO SINH VIÊN (CỔNG ĐOÀN VIÊN)
        // ==========================================

        // 6. GET: api/ChungNhan/me (Danh sách chứng nhận điện tử cá nhân)
        [HttpGet("me")]
        public async Task<IActionResult> GetMyChungNhan()
        {
            var mssvClaim = User.Claims.FirstOrDefault(c => c.Type == "MSSV");
            if (mssvClaim == null)
            {
                return Unauthorized("Không tìm thấy thông tin định danh sinh viên.");
            }

            string mssv = mssvClaim.Value;
            var sv = await _context.SinhViens.FirstOrDefaultAsync(s => s.MSSV == mssv);
            if (sv == null)
            {
                return NotFound("Không tìm thấy dữ liệu sinh viên.");
            }

            var certificates = await _context.ChungNhans
                .Include(c => c.HoatDong)
                .Where(c => c.SinhVienId == sv.Id)
                .OrderByDescending(c => c.NgayCap)
                .Select(c => new
                {
                    c.Id,
                    c.MaChungNhan,
                    c.NgayCap,
                    c.HoatDongId,
                    TenHoatDong = c.HoatDong != null ? c.HoatDong.TenHoatDong : "",
                    LoaiHoatDong = c.HoatDong != null ? c.HoatDong.LoaiHoatDong : "PhongTrao",
                    DiemCong = c.HoatDong != null ? c.HoatDong.DiemCong : 0,
                    ThoiGianBatDau = c.HoatDong != null ? c.HoatDong.ThoiGianBatDau : DateTime.MinValue,
                    ThoiGianKetThuc = c.HoatDong != null ? c.HoatDong.ThoiGianKetThuc : DateTime.MinValue,
                    DiaDiem = c.HoatDong != null ? c.HoatDong.DiaDiem : "",
                    MoTa = c.HoatDong != null ? c.HoatDong.MoTa : ""
                })
                .ToListAsync();

            return Ok(new
            {
                sinhVien = new
                {
                    sv.MSSV,
                    sv.HoTen,
                    sv.Lop,
                    sv.Khoa,
                    sv.ChucVuDoan,
                    sv.SoDoanVien
                },
                tongChungNhan = certificates.Count,
                items = certificates
            });
        }

        // ==========================================
        // TRA CỨU CÔNG KHAI (VERIFY CERTIFICATE)
        // ==========================================

        // 7. GET: api/ChungNhan/verify/{maChungNhan} (Tra cứu công khai không cần đăng nhập)
        [HttpGet("verify/{maChungNhan}")]
        [AllowAnonymous]
        public async Task<IActionResult> Verify(string maChungNhan)
        {
            if (string.IsNullOrWhiteSpace(maChungNhan))
            {
                return BadRequest("Mã chứng nhận không được để trống.");
            }

            var cert = await _context.ChungNhans
                .Include(c => c.SinhVien)
                .Include(c => c.HoatDong)
                .FirstOrDefaultAsync(c => c.MaChungNhan.ToLower() == maChungNhan.Trim().ToLower());

            if (cert == null)
            {
                return NotFound(new
                {
                    valid = false,
                    message = "Giấy chứng nhận không tồn tại hoặc đã bị thu hồi trên hệ thống Đoàn Trường."
                });
            }

            return Ok(new
            {
                valid = true,
                message = "Giấy chứng nhận điện tử hợp lệ và chính thức của Đoàn TNCS Hồ Chí Minh.",
                data = new
                {
                    maChungNhan = cert.MaChungNhan,
                    ngayCap = cert.NgayCap,
                    hoTen = cert.SinhVien?.HoTen,
                    mssv = cert.SinhVien?.MSSV,
                    lop = cert.SinhVien?.Lop,
                    khoa = cert.SinhVien?.Khoa,
                    chucVuDoan = cert.SinhVien?.ChucVuDoan,
                    soDoanVien = cert.SinhVien?.SoDoanVien,
                    tenHoatDong = cert.HoatDong?.TenHoatDong,
                    loaiHoatDong = cert.HoatDong?.LoaiHoatDong,
                    diemCong = cert.HoatDong?.DiemCong,
                    thoiGianBatDau = cert.HoatDong?.ThoiGianBatDau,
                    thoiGianKetThuc = cert.HoatDong?.ThoiGianKetThuc,
                    diaDiem = cert.HoatDong?.DiaDiem,
                    donViCap = "Đoàn Trường Đại học Công nghệ TP.HCM - HUTECH",
                    nguoiKy = "Ban Thường Vụ Đoàn Trường"
                }
            });
        }
    }

    // DTO Classes
    public class CapChungNhanRequest
    {
        public int SinhVienId { get; set; }
        public int HoatDongId { get; set; }
    }

    public class CapHangLoatRequest
    {
        public int HoatDongId { get; set; }
    }
}
