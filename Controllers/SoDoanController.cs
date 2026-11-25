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
    public class SoDoanController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SoDoanController(AppDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // DÀNH CHO ADMIN & BAN CHẤP HÀNH
        // ==========================================

        // 1. GET: api/SoDoan (Danh sách quản lý sổ đoàn kèm bộ lọc & thống kê)
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? khoa,
            [FromQuery] string? lop,
            [FromQuery] string? trangThai,
            [FromQuery] bool? giayGioiThieuHe,
            [FromQuery] string? viTriLuuTru,
            [FromQuery] string? search)
        {
            var query = _context.SoDoans
                .Include(sd => sd.SinhVien)
                .AsQueryable();

            if (!string.IsNullOrEmpty(khoa))
            {
                query = query.Where(sd => sd.SinhVien != null && sd.SinhVien.Khoa == khoa);
            }

            if (!string.IsNullOrEmpty(lop))
            {
                query = query.Where(sd => sd.SinhVien != null && sd.SinhVien.Lop != null && sd.SinhVien.Lop.Contains(lop));
            }

            if (!string.IsNullOrEmpty(trangThai) && trangThai != "TatCa")
            {
                query = query.Where(sd => sd.TrangThaiSoDoan == trangThai);
            }

            if (giayGioiThieuHe.HasValue)
            {
                query = query.Where(sd => sd.GiayGioiThieuHe == giayGioiThieuHe.Value);
            }

            if (!string.IsNullOrEmpty(viTriLuuTru))
            {
                query = query.Where(sd => sd.ViTriLuuTru != null && sd.ViTriLuuTru.Contains(viTriLuuTru));
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(sd => sd.SinhVien != null &&
                    (sd.SinhVien.MSSV.Contains(search) ||
                     sd.SinhVien.HoTen.Contains(search) ||
                     (sd.SinhVien.SoDoanVien != null && sd.SinhVien.SoDoanVien.Contains(search))));
            }

            var items = await query
                .OrderBy(sd => sd.SinhVien != null ? sd.SinhVien.Lop : "")
                .ThenBy(sd => sd.SinhVien != null ? sd.SinhVien.MSSV : "")
                .Select(sd => new
                {
                    sd.Id,
                    sd.SinhVienId,
                    MSSV = sd.SinhVien != null ? sd.SinhVien.MSSV : "",
                    HoTen = sd.SinhVien != null ? sd.SinhVien.HoTen : "",
                    Lop = sd.SinhVien != null ? sd.SinhVien.Lop : "",
                    Khoa = sd.SinhVien != null ? sd.SinhVien.Khoa : "",
                    Email = sd.SinhVien != null ? sd.SinhVien.Email : "",
                    ChucVuDoan = sd.SinhVien != null ? sd.SinhVien.ChucVuDoan : "DoanVien",
                    SoDoanVien = sd.SinhVien != null ? sd.SinhVien.SoDoanVien : "",
                    sd.TrangThaiSoDoan,
                    sd.NgayNop,
                    sd.ViTriLuuTru,
                    sd.GiayGioiThieuHe
                })
                .ToListAsync();

            // Số liệu thống kê
            int tongSo = items.Count;
            int soLuongDaNop = items.Count(i => i.TrangThaiSoDoan == "DaNop");
            int soLuongChuaNop = items.Count(i => i.TrangThaiSoDoan == "ChuaNop");
            int soLuongDaRut = items.Count(i => i.TrangThaiSoDoan == "DaRut");
            int soLuongGiayGioiThieuHe = items.Count(i => i.GiayGioiThieuHe);
            double tyLeNop = tongSo > 0 ? Math.Round((double)soLuongDaNop / tongSo * 100, 1) : 0;

            // Danh sách lựa chọn cho bộ lọc
            var danhSachKhoa = await _context.SinhViens.Where(s => s.Khoa != null).Select(s => s.Khoa!).Distinct().ToListAsync();
            var danhSachLop = await _context.SinhViens.Where(s => s.Lop != null).Select(s => s.Lop!).Distinct().ToListAsync();
            var danhSachViTri = await _context.SoDoans.Where(s => s.ViTriLuuTru != null).Select(s => s.ViTriLuuTru!).Distinct().ToListAsync();

            return Ok(new
            {
                items,
                stats = new
                {
                    tongSo,
                    soLuongDaNop,
                    soLuongChuaNop,
                    soLuongDaRut,
                    soLuongGiayGioiThieuHe,
                    tyLeNop
                },
                filters = new
                {
                    danhSachKhoa,
                    danhSachLop,
                    danhSachViTri
                }
            });
        }

        // 2. POST: api/SoDoan/tiep-nhan (Tiếp nhận sổ đoàn khi sinh viên vào trường hoặc nộp bổ sung)
        [HttpPost("tiep-nhan")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> TiepNhan([FromBody] TiepNhanSoDoanRequest request)
        {
            var sv = await _context.SinhViens.FindAsync(request.SinhVienId);
            if (sv == null)
            {
                return NotFound("Không tìm thấy thông tin sinh viên.");
            }

            var soDoan = await _context.SoDoans.FirstOrDefaultAsync(s => s.SinhVienId == request.SinhVienId);
            if (soDoan == null)
            {
                soDoan = new SoDoan
                {
                    SinhVienId = request.SinhVienId,
                    TrangThaiSoDoan = "DaNop",
                    NgayNop = request.NgayNop ?? DateTime.Now,
                    ViTriLuuTru = !string.IsNullOrWhiteSpace(request.ViTriLuuTru)
                        ? request.ViTriLuuTru
                        : $"Tủ A - Ngăn Khoa {sv.Khoa ?? "Chung"}",
                    GiayGioiThieuHe = request.GiayGioiThieuHe
                };
                await _context.SoDoans.AddAsync(soDoan);
            }
            else
            {
                soDoan.TrangThaiSoDoan = "DaNop";
                soDoan.NgayNop = request.NgayNop ?? DateTime.Now;
                if (!string.IsNullOrWhiteSpace(request.ViTriLuuTru))
                {
                    soDoan.ViTriLuuTru = request.ViTriLuuTru;
                }
                else if (string.IsNullOrWhiteSpace(soDoan.ViTriLuuTru))
                {
                    soDoan.ViTriLuuTru = $"Tủ A - Ngăn Khoa {sv.Khoa ?? "Chung"}";
                }
                soDoan.GiayGioiThieuHe = request.GiayGioiThieuHe;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Đã tiếp nhận sổ đoàn viên cho {sv.HoTen} ({sv.MSSV}).",
                data = new
                {
                    soDoan.Id,
                    soDoan.SinhVienId,
                    soDoan.TrangThaiSoDoan,
                    soDoan.NgayNop,
                    soDoan.ViTriLuuTru,
                    soDoan.GiayGioiThieuHe
                }
            });
        }

        // 3. PUT: api/SoDoan/{id}/rut-so (Rút sổ đoàn khi tốt nghiệp hoặc chuyển trường)
        [HttpPut("{id}/rut-so")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RutSo(int id)
        {
            var soDoan = await _context.SoDoans.Include(s => s.SinhVien).FirstOrDefaultAsync(s => s.Id == id);
            if (soDoan == null)
            {
                return NotFound("Không tìm thấy thông tin sổ đoàn.");
            }

            soDoan.TrangThaiSoDoan = "DaRut";
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Đã xác nhận rút sổ đoàn cho sinh viên {soDoan.SinhVien?.HoTen ?? soDoan.SinhVienId.ToString()}.",
                data = new
                {
                    soDoan.Id,
                    soDoan.TrangThaiSoDoan
                }
            });
        }

        // 4. PUT: api/SoDoan/{id}/vi-tri (Cập nhật vị trí ngăn/tủ lưu trữ hồ sơ)
        [HttpPut("{id}/vi-tri")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CapNhatViTri(int id, [FromBody] CapNhatViTriRequest request)
        {
            var soDoan = await _context.SoDoans.Include(s => s.SinhVien).FirstOrDefaultAsync(s => s.Id == id);
            if (soDoan == null)
            {
                return NotFound("Không tìm thấy thông tin sổ đoàn.");
            }

            soDoan.ViTriLuuTru = request.ViTriLuuTru?.Trim();
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Đã cập nhật vị trí lưu trữ hồ sơ sổ đoàn.",
                data = new
                {
                    soDoan.Id,
                    soDoan.ViTriLuuTru
                }
            });
        }

        // 5. PUT: api/SoDoan/{id}/giay-gioi-thieu-he (Cấp hoặc cập nhật Giấy giới thiệu hè)
        [HttpPut("{id}/giay-gioi-thieu-he")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CapGiayGioiThieuHe(int id, [FromBody] CapGiayGioiThieuRequest request)
        {
            var soDoan = await _context.SoDoans.Include(s => s.SinhVien).FirstOrDefaultAsync(s => s.Id == id);
            if (soDoan == null)
            {
                return NotFound("Không tìm thấy thông tin sổ đoàn.");
            }

            soDoan.GiayGioiThieuHe = request.GiayGioiThieuHe;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = request.GiayGioiThieuHe
                    ? $"Đã cấp Giấy giới thiệu sinh hoạt Đoàn nơi cư trú cho {soDoan.SinhVien?.HoTen}."
                    : $"Đã thu hồi/hủy trạng thái Giấy giới thiệu hè cho {soDoan.SinhVien?.HoTen}.",
                data = new
                {
                    soDoan.Id,
                    soDoan.GiayGioiThieuHe
                }
            });
        }

        // 6. POST: api/SoDoan/dong-bo (Khởi tạo bản ghi SoDoan cho sinh viên chưa có)
        [HttpPost("dong-bo")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DongBoSoDoan()
        {
            var sinhViens = await _context.SinhViens.ToListAsync();
            var existingIds = await _context.SoDoans.Select(s => s.SinhVienId).ToHashSetAsync();

            var newRecords = new List<SoDoan>();
            foreach (var sv in sinhViens)
            {
                if (!existingIds.Contains(sv.Id))
                {
                    newRecords.Add(new SoDoan
                    {
                        SinhVienId = sv.Id,
                        TrangThaiSoDoan = "ChuaNop",
                        NgayNop = null,
                        ViTriLuuTru = $"Tủ A - Ngăn Khoa {sv.Khoa ?? "Chung"}",
                        GiayGioiThieuHe = false
                    });
                }
            }

            if (newRecords.Count > 0)
            {
                await _context.SoDoans.AddRangeAsync(newRecords);
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                message = $"Đã đồng bộ xong dữ liệu sổ đoàn. Thêm mới {newRecords.Count} bản ghi.",
                soLuongTaoMoi = newRecords.Count,
                tongSinhVien = sinhViens.Count
            });
        }

        // 7. GET: api/SoDoan/export-excel (Xuất danh sách sổ đoàn ra file Excel)
        [HttpGet("export-excel")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ExportExcel(
            [FromQuery] string? khoa,
            [FromQuery] string? lop,
            [FromQuery] string? trangThai,
            [FromQuery] bool? giayGioiThieuHe)
        {
            ExcelPackage.License.SetNonCommercialPersonal("DoanVienAPI");

            var query = _context.SoDoans
                .Include(sd => sd.SinhVien)
                .AsQueryable();

            if (!string.IsNullOrEmpty(khoa)) query = query.Where(sd => sd.SinhVien != null && sd.SinhVien.Khoa == khoa);
            if (!string.IsNullOrEmpty(lop)) query = query.Where(sd => sd.SinhVien != null && sd.SinhVien.Lop != null && sd.SinhVien.Lop.Contains(lop));
            if (!string.IsNullOrEmpty(trangThai) && trangThai != "TatCa") query = query.Where(sd => sd.TrangThaiSoDoan == trangThai);
            if (giayGioiThieuHe.HasValue) query = query.Where(sd => sd.GiayGioiThieuHe == giayGioiThieuHe.Value);

            var items = await query
                .OrderBy(sd => sd.SinhVien != null ? sd.SinhVien.Lop : "")
                .ThenBy(sd => sd.SinhVien != null ? sd.SinhVien.MSSV : "")
                .ToListAsync();

            using (var package = new ExcelPackage())
            {
                var ws = package.Workbook.Worksheets.Add("SoDoan");

                // Tiêu đề
                ws.Cells["A1:I1"].Merge = true;
                ws.Cells["A1"].Value = "DANH SÁCH THEO DÕI & QUẢN LÝ SỔ ĐOÀN VIÊN";
                ws.Cells["A1"].Style.Font.Size = 16;
                ws.Cells["A1"].Style.Font.Bold = true;
                ws.Cells["A1"].Style.Font.Color.SetColor(Color.FromArgb(30, 58, 138));
                ws.Cells["A1"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                ws.Cells["A2:I2"].Merge = true;
                ws.Cells["A2"].Value = $"Khoa: {khoa ?? "Tất cả"} | Lớp: {lop ?? "Tất cả"} | Trạng thái: {trangThai ?? "Tất cả"} | Xuất ngày: {DateTime.Now:dd/MM/yyyy HH:mm}";
                ws.Cells["A2"].Style.Font.Italic = true;
                ws.Cells["A2"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                // Headers
                string[] headers = { "STT", "MSSV", "Họ và Tên", "Chi đoàn (Lớp)", "Khoa", "Số đoàn viên", "Trạng thái sổ", "Vị trí lưu trữ", "Giấy giới thiệu hè" };
                for (int i = 0; i < headers.Length; i++)
                {
                    ws.Cells[4, i + 1].Value = headers[i];
                    ws.Cells[4, i + 1].Style.Font.Bold = true;
                    ws.Cells[4, i + 1].Style.Fill.PatternType = ExcelFillStyle.Solid;
                    ws.Cells[4, i + 1].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(224, 231, 255));
                    ws.Cells[4, i + 1].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(165, 180, 252));
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
                    ws.Cells[row, 6].Value = item.SinhVien?.SoDoanVien ?? "-";

                    string ttText = item.TrangThaiSoDoan switch
                    {
                        "DaNop" => "Đang lưu trữ",
                        "ChuaNop" => "Chưa nộp",
                        "DaRut" => "Đã rút sổ",
                        _ => item.TrangThaiSoDoan
                    };
                    ws.Cells[row, 7].Value = ttText;

                    if (item.TrangThaiSoDoan == "DaNop")
                    {
                        ws.Cells[row, 7].Style.Font.Color.SetColor(Color.FromArgb(22, 101, 52));
                    }
                    else if (item.TrangThaiSoDoan == "ChuaNop")
                    {
                        ws.Cells[row, 7].Style.Font.Color.SetColor(Color.FromArgb(185, 28, 28));
                    }
                    else
                    {
                        ws.Cells[row, 7].Style.Font.Color.SetColor(Color.FromArgb(107, 114, 128));
                    }

                    ws.Cells[row, 8].Value = item.ViTriLuuTru ?? "Chưa sắp xếp";
                    ws.Cells[row, 9].Value = item.GiayGioiThieuHe ? "Đã cấp" : "Chưa cấp";

                    for (int col = 1; col <= 9; col++)
                    {
                        ws.Cells[row, col].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(229, 231, 235));
                    }

                    row++;
                }

                ws.Cells.AutoFitColumns();

                var fileBytes = package.GetAsByteArray();
                string fileName = $"Danh_Sach_So_Doan_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
                return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
        }

        // ==========================================
        // DÀNH CHO SINH VIÊN (CỔNG ĐOÀN VIÊN)
        // ==========================================

        // 8. GET: api/SoDoan/me (Xem thông tin tình trạng sổ đoàn của mình)
        [HttpGet("me")]
        public async Task<IActionResult> GetMySoDoan()
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

            var soDoan = await _context.SoDoans.FirstOrDefaultAsync(s => s.SinhVienId == sv.Id);

            return Ok(new
            {
                sinhVien = new
                {
                    sv.MSSV,
                    sv.HoTen,
                    sv.Lop,
                    sv.Khoa,
                    sv.ChucVuDoan,
                    sv.SoDoanVien,
                    sv.NgayVaoDoan,
                    sv.NoiVaoDoan
                },
                soDoan = soDoan != null ? new
                {
                    soDoan.Id,
                    soDoan.TrangThaiSoDoan,
                    soDoan.NgayNop,
                    soDoan.ViTriLuuTru,
                    soDoan.GiayGioiThieuHe
                } : null,
                daNopSo = soDoan != null && soDoan.TrangThaiSoDoan == "DaNop"
            });
        }
    }

    // DTO Classes
    public class TiepNhanSoDoanRequest
    {
        public int SinhVienId { get; set; }
        public string? ViTriLuuTru { get; set; }
        public DateTime? NgayNop { get; set; }
        public bool GiayGioiThieuHe { get; set; } = false;
    }

    public class CapNhatViTriRequest
    {
        public string? ViTriLuuTru { get; set; }
    }

    public class CapGiayGioiThieuRequest
    {
        public bool GiayGioiThieuHe { get; set; } = true;
    }
}
