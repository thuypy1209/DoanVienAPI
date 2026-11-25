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
    public class DoanPhiController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DoanPhiController(AppDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // DÀNH CHO ADMIN & BAN CHẤP HÀNH
        // ==========================================

        // 1. GET: api/DoanPhi (Danh sách thu nộp có lọc & thống kê)
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? namHoc,
            [FromQuery] string? hocKy,
            [FromQuery] string? khoa,
            [FromQuery] string? lop,
            [FromQuery] string? trangThai,
            [FromQuery] string? search)
        {
            var query = _context.DoanPhis
                .Include(dp => dp.SinhVien)
                .AsQueryable();

            if (!string.IsNullOrEmpty(namHoc))
            {
                query = query.Where(dp => dp.NamHoc == namHoc);
            }

            if (!string.IsNullOrEmpty(hocKy))
            {
                query = query.Where(dp => dp.HocKy == hocKy);
            }

            if (!string.IsNullOrEmpty(khoa))
            {
                query = query.Where(dp => dp.SinhVien != null && dp.SinhVien.Khoa == khoa);
            }

            if (!string.IsNullOrEmpty(lop))
            {
                query = query.Where(dp => dp.SinhVien != null && dp.SinhVien.Lop != null && dp.SinhVien.Lop.Contains(lop));
            }

            if (!string.IsNullOrEmpty(trangThai) && trangThai != "TatCa")
            {
                query = query.Where(dp => dp.TrangThai == trangThai);
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(dp => dp.SinhVien != null &&
                    (dp.SinhVien.MSSV.Contains(search) || dp.SinhVien.HoTen.Contains(search)));
            }

            var rawItems = await query
                .OrderByDescending(dp => dp.NamHoc)
                .ThenBy(dp => dp.HocKy)
                .ThenBy(dp => dp.SinhVien != null ? dp.SinhVien.MSSV : string.Empty)
                .Select(dp => new
                {
                    dp.Id,
                    dp.SinhVienId,
                    MSSV = dp.SinhVien != null ? dp.SinhVien.MSSV : "",
                    HoTen = dp.SinhVien != null ? dp.SinhVien.HoTen : "",
                    Lop = dp.SinhVien != null ? dp.SinhVien.Lop : "",
                    Khoa = dp.SinhVien != null ? dp.SinhVien.Khoa : "",
                    ChucVuDoan = dp.SinhVien != null ? dp.SinhVien.ChucVuDoan : "DoanVien",
                    dp.HocKy,
                    dp.NamHoc,
                    dp.SoTien,
                    dp.TrangThai,
                    dp.NgayNop,
                    dp.NguoiThu
                })
                .ToListAsync();

            // Tính toán số liệu thống kê
            int tongSo = rawItems.Count;
            int soLuongDaNop = rawItems.Count(i => i.TrangThai == "DaNop");
            int soLuongChuaNop = rawItems.Count(i => i.TrangThai == "ChuaNop");
            decimal tongTienDaThu = rawItems.Where(i => i.TrangThai == "DaNop").Sum(i => i.SoTien);
            decimal tongTienChuaThu = rawItems.Where(i => i.TrangThai == "ChuaNop").Sum(i => i.SoTien);
            double tyLeHoanThanh = tongSo > 0 ? Math.Round((double)soLuongDaNop / tongSo * 100, 1) : 0;

            // Danh sách lựa chọn bộ lọc
            var danhSachNamHoc = await _context.DoanPhis.Select(dp => dp.NamHoc).Distinct().ToListAsync();
            var danhSachHocKy = await _context.DoanPhis.Select(dp => dp.HocKy).Distinct().ToListAsync();
            var danhSachKhoa = await _context.SinhViens.Where(s => s.Khoa != null).Select(s => s.Khoa!).Distinct().ToListAsync();
            var danhSachLop = await _context.SinhViens.Where(s => s.Lop != null).Select(s => s.Lop!).Distinct().ToListAsync();

            return Ok(new
            {
                items = rawItems,
                stats = new
                {
                    tongSo,
                    soLuongDaNop,
                    soLuongChuaNop,
                    tongTienDaThu,
                    tongTienChuaThu,
                    tyLeHoanThanh
                },
                filters = new
                {
                    danhSachNamHoc,
                    danhSachHocKy,
                    danhSachKhoa,
                    danhSachLop
                }
            });
        }

        // 2. PUT: api/DoanPhi/{id}/xac-nhan (Xác nhận đã nộp)
        [HttpPut("{id}/xac-nhan")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> XacNhanThu(int id, [FromBody] XacNhanDoanPhiRequest? request)
        {
            var dp = await _context.DoanPhis.Include(d => d.SinhVien).FirstOrDefaultAsync(d => d.Id == id);
            if (dp == null)
            {
                return NotFound("Không tìm thấy bản ghi đoàn phí.");
            }

            dp.TrangThai = "DaNop";
            dp.NgayNop = request?.NgayNop ?? DateTime.Now;
            dp.NguoiThu = !string.IsNullOrWhiteSpace(request?.NguoiThu)
                ? request.NguoiThu
                : (User.Identity?.Name ?? "Ban Chấp Hành Đoàn");

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Đã xác nhận thu đoàn phí cho đoàn viên {dp.SinhVien?.HoTen ?? dp.SinhVienId.ToString()}.",
                data = new
                {
                    dp.Id,
                    dp.TrangThai,
                    dp.NgayNop,
                    dp.NguoiThu
                }
            });
        }

        // 3. PUT: api/DoanPhi/{id}/huy (Hủy xác nhận - chuyển về Chưa nộp)
        [HttpPut("{id}/huy")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> HuyXacNhan(int id)
        {
            var dp = await _context.DoanPhis.Include(d => d.SinhVien).FirstOrDefaultAsync(d => d.Id == id);
            if (dp == null)
            {
                return NotFound("Không tìm thấy bản ghi đoàn phí.");
            }

            dp.TrangThai = "ChuaNop";
            dp.NgayNop = null;
            dp.NguoiThu = null;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Đã hủy xác nhận nộp đoàn phí cho {dp.SinhVien?.HoTen ?? dp.SinhVienId.ToString()}.",
                data = new
                {
                    dp.Id,
                    dp.TrangThai,
                    dp.NgayNop,
                    dp.NguoiThu
                }
            });
        }

        // 4. POST: api/DoanPhi/xac-nhan-hang-loat (Xác nhận nhiều đoàn viên cùng lúc)
        [HttpPost("xac-nhan-hang-loat")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> XacNhanHangLoat([FromBody] XacNhanHangLoatRequest request)
        {
            if (request.Ids == null || request.Ids.Count == 0)
            {
                return BadRequest("Danh sách ID không được để trống.");
            }

            var records = await _context.DoanPhis
                .Where(dp => request.Ids.Contains(dp.Id))
                .ToListAsync();

            string nguoiThu = !string.IsNullOrWhiteSpace(request.NguoiThu)
                ? request.NguoiThu
                : (User.Identity?.Name ?? "Ban Chấp Hành Đoàn");
            var now = DateTime.Now;

            foreach (var dp in records)
            {
                dp.TrangThai = "DaNop";
                dp.NgayNop = now;
                dp.NguoiThu = nguoiThu;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Đã xác nhận thu đoàn phí thành công cho {records.Count} đoàn viên.",
                soLuong = records.Count
            });
        }

        // 5. POST: api/DoanPhi/tao-dot-thu (Khởi tạo đợt thu mới cho toàn trường hoặc lớp/khoa)
        [HttpPost("tao-dot-thu")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> TaoDotThu([FromBody] TaoDotThuRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.NamHoc) || string.IsNullOrWhiteSpace(request.HocKy))
            {
                return BadRequest("Học kỳ và Năm học không được để trống.");
            }

            if (request.SoTien <= 0)
            {
                request.SoTien = 24000;
            }

            var svQuery = _context.SinhViens.AsQueryable();

            if (!string.IsNullOrEmpty(request.Khoa))
            {
                svQuery = svQuery.Where(s => s.Khoa == request.Khoa);
            }

            if (!string.IsNullOrEmpty(request.Lop))
            {
                svQuery = svQuery.Where(s => s.Lop != null && s.Lop.Contains(request.Lop));
            }

            var sinhViens = await svQuery.ToListAsync();
            if (sinhViens.Count == 0)
            {
                return BadRequest("Không tìm thấy đoàn viên phù hợp với tiêu chí lọc.");
            }

            // Lấy các bản ghi đã có để tránh trùng lặp
            var existingMap = await _context.DoanPhis
                .Where(dp => dp.NamHoc == request.NamHoc && dp.HocKy == request.HocKy)
                .Select(dp => dp.SinhVienId)
                .ToHashSetAsync();

            var newRecords = new List<DoanPhi>();
            int skippedCount = 0;

            foreach (var sv in sinhViens)
            {
                if (existingMap.Contains(sv.Id))
                {
                    skippedCount++;
                    continue;
                }

                newRecords.Add(new DoanPhi
                {
                    SinhVienId = sv.Id,
                    HocKy = request.HocKy,
                    NamHoc = request.NamHoc,
                    SoTien = request.SoTien,
                    TrangThai = "ChuaNop",
                    NgayNop = null,
                    NguoiThu = null
                });
            }

            if (newRecords.Count > 0)
            {
                await _context.DoanPhis.AddRangeAsync(newRecords);
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                message = $"Khởi tạo đợt thu {request.HocKy} ({request.NamHoc}) hoàn tất.",
                soLuongTaoMoi = newRecords.Count,
                soLuongBoQua = skippedCount,
                tongSinhVien = sinhViens.Count
            });
        }

        // 6. GET: api/DoanPhi/export-excel (Xuất danh sách ra file Excel)
        [HttpGet("export-excel")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ExportExcel(
            [FromQuery] string? namHoc,
            [FromQuery] string? hocKy,
            [FromQuery] string? khoa,
            [FromQuery] string? lop,
            [FromQuery] string? trangThai)
        {
            ExcelPackage.License.SetNonCommercialPersonal("DoanVienAPI");

            var query = _context.DoanPhis
                .Include(dp => dp.SinhVien)
                .AsQueryable();

            if (!string.IsNullOrEmpty(namHoc)) query = query.Where(dp => dp.NamHoc == namHoc);
            if (!string.IsNullOrEmpty(hocKy)) query = query.Where(dp => dp.HocKy == hocKy);
            if (!string.IsNullOrEmpty(khoa)) query = query.Where(dp => dp.SinhVien != null && dp.SinhVien.Khoa == khoa);
            if (!string.IsNullOrEmpty(lop)) query = query.Where(dp => dp.SinhVien != null && dp.SinhVien.Lop != null && dp.SinhVien.Lop.Contains(lop));
            if (!string.IsNullOrEmpty(trangThai) && trangThai != "TatCa") query = query.Where(dp => dp.TrangThai == trangThai);

            var items = await query
                .OrderBy(dp => dp.SinhVien != null ? dp.SinhVien.Lop : "")
                .ThenBy(dp => dp.SinhVien != null ? dp.SinhVien.MSSV : "")
                .ToListAsync();

            using (var package = new ExcelPackage())
            {
                var ws = package.Workbook.Worksheets.Add("DoanPhi");

                // Tiêu đề lớn
                ws.Cells["A1:J1"].Merge = true;
                ws.Cells["A1"].Value = "DANH SÁCH THEO DÕI THU NỘP ĐOÀN PHÍ";
                ws.Cells["A1"].Style.Font.Size = 16;
                ws.Cells["A1"].Style.Font.Bold = true;
                ws.Cells["A1"].Style.Font.Color.SetColor(Color.FromArgb(30, 58, 138));
                ws.Cells["A1"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                // Thông tin bộ lọc
                ws.Cells["A2:J2"].Merge = true;
                ws.Cells["A2"].Value = $"Học kỳ: {hocKy ?? "Tất cả"} | Năm học: {namHoc ?? "Tất cả"} | Ngày xuất: {DateTime.Now:dd/MM/yyyy HH:mm}";
                ws.Cells["A2"].Style.Font.Italic = true;
                ws.Cells["A2"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                // Headers
                string[] headers = { "STT", "MSSV", "Họ và Tên", "Chi đoàn (Lớp)", "Khoa", "Học kỳ", "Năm học", "Số tiền (VNĐ)", "Trạng thái", "Ngày nộp", "Cán bộ thu" };
                for (int i = 0; i < headers.Length; i++)
                {
                    ws.Cells[4, i + 1].Value = headers[i];
                    ws.Cells[4, i + 1].Style.Font.Bold = true;
                    ws.Cells[4, i + 1].Style.Fill.PatternType = ExcelFillStyle.Solid;
                    ws.Cells[4, i + 1].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(219, 234, 254));
                    ws.Cells[4, i + 1].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(147, 197, 253));
                    ws.Cells[4, i + 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                }

                // Data Rows
                int row = 5;
                int stt = 1;
                foreach (var item in items)
                {
                    ws.Cells[row, 1].Value = stt++;
                    ws.Cells[row, 2].Value = item.SinhVien?.MSSV ?? "";
                    ws.Cells[row, 3].Value = item.SinhVien?.HoTen ?? "";
                    ws.Cells[row, 4].Value = item.SinhVien?.Lop ?? "";
                    ws.Cells[row, 5].Value = item.SinhVien?.Khoa ?? "";
                    ws.Cells[row, 6].Value = item.HocKy;
                    ws.Cells[row, 7].Value = item.NamHoc;
                    ws.Cells[row, 8].Value = item.SoTien;
                    ws.Cells[row, 8].Style.Numberformat.Format = "#,##0";

                    ws.Cells[row, 9].Value = item.TrangThai == "DaNop" ? "Đã nộp" : "Chưa nộp";
                    if (item.TrangThai == "DaNop")
                    {
                        ws.Cells[row, 9].Style.Font.Color.SetColor(Color.FromArgb(22, 101, 52));
                        ws.Cells[row, 9].Style.Font.Bold = true;
                    }
                    else
                    {
                        ws.Cells[row, 9].Style.Font.Color.SetColor(Color.FromArgb(185, 28, 28));
                        ws.Cells[row, 9].Style.Font.Bold = true;
                    }

                    ws.Cells[row, 10].Value = item.NgayNop?.ToString("dd/MM/yyyy HH:mm") ?? "-";
                    ws.Cells[row, 11].Value = item.NguoiThu ?? "-";

                    for (int col = 1; col <= 11; col++)
                    {
                        ws.Cells[row, col].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(229, 231, 235));
                    }

                    row++;
                }

                // Hàng tổng kết
                ws.Cells[row, 1, row, 7].Merge = true;
                ws.Cells[row, 1].Value = "TỔNG CỘNG";
                ws.Cells[row, 1].Style.Font.Bold = true;
                ws.Cells[row, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                ws.Cells[row, 8].Formula = $"SUM(H5:H{row - 1})";
                ws.Cells[row, 8].Style.Font.Bold = true;
                ws.Cells[row, 8].Style.Numberformat.Format = "#,##0";

                for (int col = 1; col <= 11; col++)
                {
                    ws.Cells[row, col].Style.Border.BorderAround(ExcelBorderStyle.Medium, Color.FromArgb(156, 163, 175));
                    ws.Cells[row, col].Style.Fill.PatternType = ExcelFillStyle.Solid;
                    ws.Cells[row, col].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(243, 244, 246));
                }

                ws.Cells.AutoFitColumns();

                var fileBytes = package.GetAsByteArray();
                string fileName = $"Bao_Cao_Doan_Phi_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";

                return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
        }

        // ==========================================
        // DÀNH CHO SINH VIÊN (CỔNG ĐOÀN VIÊN)
        // ==========================================

        // 7. GET: api/DoanPhi/me (Lịch sử & Tình trạng đóng đoàn phí của chính mình)
        [HttpGet("me")]
        public async Task<IActionResult> GetMyDoanPhi()
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
                return NotFound("Không tìm thấy dữ liệu đoàn viên.");
            }

            var doanPhis = await _context.DoanPhis
                .Where(dp => dp.SinhVienId == sv.Id)
                .OrderByDescending(dp => dp.NamHoc)
                .ThenByDescending(dp => dp.HocKy)
                .Select(dp => new
                {
                    dp.Id,
                    dp.HocKy,
                    dp.NamHoc,
                    dp.SoTien,
                    dp.TrangThai,
                    dp.NgayNop,
                    dp.NguoiThu
                })
                .ToListAsync();

            decimal tongDaNop = doanPhis.Where(d => d.TrangThai == "DaNop").Sum(d => d.SoTien);
            decimal tongChuaNop = doanPhis.Where(d => d.TrangThai == "ChuaNop").Sum(d => d.SoTien);
            int soKyDaNop = doanPhis.Count(d => d.TrangThai == "DaNop");
            int soKyChuaNop = doanPhis.Count(d => d.TrangThai == "ChuaNop");

            return Ok(new
            {
                sinhVien = new
                {
                    sv.MSSV,
                    sv.HoTen,
                    sv.Lop,
                    sv.Khoa,
                    sv.ChucVuDoan,
                    sv.TrangThaiDoan,
                    sv.SoDoanVien
                },
                summary = new
                {
                    tongDaNop,
                    tongChuaNop,
                    soKyDaNop,
                    soKyChuaNop,
                    daHoanTatTatCa = soKyChuaNop == 0
                },
                records = doanPhis
            });
        }
    }

    // DTO Classes
    public class XacNhanDoanPhiRequest
    {
        public string? NguoiThu { get; set; }
        public DateTime? NgayNop { get; set; }
    }

    public class XacNhanHangLoatRequest
    {
        public List<int> Ids { get; set; } = new List<int>();
        public string? NguoiThu { get; set; }
    }

    public class TaoDotThuRequest
    {
        public string NamHoc { get; set; } = "2025-2026";
        public string HocKy { get; set; } = "HK1";
        public decimal SoTien { get; set; } = 24000;
        public string? Khoa { get; set; }
        public string? Lop { get; set; }
    }
}
