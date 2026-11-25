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
    public class XepLoaiController : ControllerBase
    {
        private readonly AppDbContext _context;

        public XepLoaiController(AppDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // DÀNH CHO ADMIN & BAN CHẤP HÀNH
        // ==========================================

        // 1. GET: api/XepLoai (Danh sách bình bầu & phân loại đoàn viên có bộ lọc)
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? namHoc,
            [FromQuery] string? khoa,
            [FromQuery] string? lop,
            [FromQuery] string? xepLoai,
            [FromQuery] bool? doanKhoaDuyet,
            [FromQuery] string? search)
        {
            var query = _context.XepLoaiDoanViens
                .Include(x => x.SinhVien)
                .AsQueryable();

            if (!string.IsNullOrEmpty(namHoc))
            {
                query = query.Where(x => x.NamHoc == namHoc);
            }

            if (!string.IsNullOrEmpty(khoa))
            {
                query = query.Where(x => x.SinhVien != null && x.SinhVien.Khoa == khoa);
            }

            if (!string.IsNullOrEmpty(lop))
            {
                query = query.Where(x => x.SinhVien != null && x.SinhVien.Lop != null && x.SinhVien.Lop.Contains(lop));
            }

            if (!string.IsNullOrEmpty(xepLoai) && xepLoai != "TatCa")
            {
                query = query.Where(x => x.XepLoai == xepLoai);
            }

            if (doanKhoaDuyet.HasValue)
            {
                query = query.Where(x => x.DoanKhoaDuyet == doanKhoaDuyet.Value);
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(x => x.SinhVien != null &&
                    (x.SinhVien.MSSV.Contains(search) || x.SinhVien.HoTen.Contains(search)));
            }

            var items = await query
                .OrderByDescending(x => x.NamHoc)
                .ThenBy(x => x.SinhVien != null ? x.SinhVien.Lop : "")
                .ThenBy(x => x.SinhVien != null ? x.SinhVien.MSSV : "")
                .Select(x => new
                {
                    x.Id,
                    x.SinhVienId,
                    MSSV = x.SinhVien != null ? x.SinhVien.MSSV : "",
                    HoTen = x.SinhVien != null ? x.SinhVien.HoTen : "",
                    Lop = x.SinhVien != null ? x.SinhVien.Lop : "",
                    Khoa = x.SinhVien != null ? x.SinhVien.Khoa : "",
                    ChucVuDoan = x.SinhVien != null ? x.SinhVien.ChucVuDoan : "DoanVien",
                    LaDoanVienUuTu = x.SinhVien != null && x.SinhVien.LaDoanVienUuTu,
                    DiemRenLuyenTichLuy = x.SinhVien != null ? x.SinhVien.DiemRenLuyenTichLuy : 0,
                    x.NamHoc,
                    x.XepLoai,
                    x.TuDanhGia,
                    x.ChiDoanDanhGia,
                    x.DoanKhoaDuyet
                })
                .ToListAsync();

            // Tính toán số liệu thống kê
            int tongSo = items.Count;
            int soLuongXuatSac = items.Count(i => i.XepLoai == "XuatSac");
            int soLuongKha = items.Count(i => i.XepLoai == "Kha");
            int soLuongTrungBinh = items.Count(i => i.XepLoai == "TrungBinh");
            int soLuongYeu = items.Count(i => i.XepLoai == "Yeu");
            int soLuongDaDuyet = items.Count(i => i.DoanKhoaDuyet);
            int soLuongChoDuyet = items.Count(i => !i.DoanKhoaDuyet);
            int soLuongUuTu = items.Count(i => i.LaDoanVienUuTu);
            double tyLeDuyet = tongSo > 0 ? Math.Round((double)soLuongDaDuyet / tongSo * 100, 1) : 0;

            // Danh sách lựa chọn bộ lọc
            var danhSachNamHoc = await _context.XepLoaiDoanViens.Select(x => x.NamHoc).Distinct().ToListAsync();
            var danhSachKhoa = await _context.SinhViens.Where(s => s.Khoa != null).Select(s => s.Khoa!).Distinct().ToListAsync();
            var danhSachLop = await _context.SinhViens.Where(s => s.Lop != null).Select(s => s.Lop!).Distinct().ToListAsync();

            return Ok(new
            {
                items,
                stats = new
                {
                    tongSo,
                    soLuongXuatSac,
                    soLuongKha,
                    soLuongTrungBinh,
                    soLuongYeu,
                    soLuongDaDuyet,
                    soLuongChoDuyet,
                    soLuongUuTu,
                    tyLeDuyet
                },
                filters = new
                {
                    danhSachNamHoc,
                    danhSachKhoa,
                    danhSachLop
                }
            });
        }

        // 2. PUT: api/XepLoai/{id}/chi-doan-danh-gia (Chi đoàn họp bình xét & nhận xét)
        [HttpPut("{id}/chi-doan-danh-gia")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ChiDoanDanhGia(int id, [FromBody] ChiDoanDanhGiaRequest request)
        {
            var xl = await _context.XepLoaiDoanViens.Include(x => x.SinhVien).FirstOrDefaultAsync(x => x.Id == id);
            if (xl == null)
            {
                return NotFound("Không tìm thấy bản ghi phân loại đoàn viên.");
            }

            xl.XepLoai = request.XepLoai;
            xl.ChiDoanDanhGia = request.ChiDoanDanhGia?.Trim();

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Đã cập nhật đánh giá của Chi đoàn cho đoàn viên {xl.SinhVien?.HoTen}.",
                data = new
                {
                    xl.Id,
                    xl.XepLoai,
                    xl.ChiDoanDanhGia
                }
            });
        }

        // 3. PUT: api/XepLoai/{id}/duyet (Đoàn Khoa / Đoàn Trường phê duyệt chính thức)
        [HttpPut("{id}/duyet")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DuyetXepLoai(int id, [FromBody] DuyetXepLoaiRequest request)
        {
            var xl = await _context.XepLoaiDoanViens.Include(x => x.SinhVien).FirstOrDefaultAsync(x => x.Id == id);
            if (xl == null)
            {
                return NotFound("Không tìm thấy bản ghi phân loại.");
            }

            xl.DoanKhoaDuyet = request.DoanKhoaDuyet;

            // Nếu chỉ định xét Đoàn viên Ưu tú
            if (request.SetDoanVienUuTu.HasValue && xl.SinhVien != null)
            {
                xl.SinhVien.LaDoanVienUuTu = request.SetDoanVienUuTu.Value;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = request.DoanKhoaDuyet
                    ? $"Đã phê duyệt kết quả xếp loại ({xl.XepLoai}) cho {xl.SinhVien?.HoTen}."
                    : $"Đã thu hồi phê duyệt cho {xl.SinhVien?.HoTen}.",
                data = new
                {
                    xl.Id,
                    xl.DoanKhoaDuyet,
                    laDoanVienUuTu = xl.SinhVien?.LaDoanVienUuTu ?? false
                }
            });
        }

        // 4. POST: api/XepLoai/duyet-hang-loat (Phê duyệt kết quả cho nhiều đoàn viên cùng lúc)
        [HttpPost("duyet-hang-loat")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DuyetHangLoat([FromBody] DuyetHangLoatRequest request)
        {
            if (request.Ids == null || request.Ids.Count == 0)
            {
                return BadRequest("Danh sách ID không được rỗng.");
            }

            var records = await _context.XepLoaiDoanViens
                .Where(x => request.Ids.Contains(x.Id))
                .ToListAsync();

            foreach (var r in records)
            {
                r.DoanKhoaDuyet = request.DoanKhoaDuyet;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Đã cập nhật trạng thái phê duyệt cho {records.Count} đoàn viên.",
                soLuong = records.Count
            });
        }

        // 5. POST: api/XepLoai/khoi-tao-dot (Khởi tạo đợt đánh giá cho năm học mới)
        [HttpPost("khoi-tao-dot")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> KhoiTaoDot([FromBody] KhoiTaoDotRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.NamHoc))
            {
                return BadRequest("Năm học không được để trống.");
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

            var existingIds = await _context.XepLoaiDoanViens
                .Where(x => x.NamHoc == request.NamHoc)
                .Select(x => x.SinhVienId)
                .ToHashSetAsync();

            var newRecords = new List<XepLoaiDoanVien>();
            int skippedCount = 0;

            foreach (var sv in sinhViens)
            {
                if (existingIds.Contains(sv.Id))
                {
                    skippedCount++;
                    continue;
                }

                // Gợi ý mức xếp loại ban đầu dựa trên điểm rèn luyện
                string deXuat = "Kha";
                if (sv.DiemRenLuyenTichLuy >= 90) deXuat = "XuatSac";
                else if (sv.DiemRenLuyenTichLuy >= 80) deXuat = "Kha";
                else if (sv.DiemRenLuyenTichLuy >= 65) deXuat = "TrungBinh";
                else deXuat = "Yeu";

                newRecords.Add(new XepLoaiDoanVien
                {
                    SinhVienId = sv.Id,
                    NamHoc = request.NamHoc,
                    XepLoai = deXuat,
                    TuDanhGia = null,
                    ChiDoanDanhGia = null,
                    DoanKhoaDuyet = false
                });
            }

            if (newRecords.Count > 0)
            {
                await _context.XepLoaiDoanViens.AddRangeAsync(newRecords);
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                message = $"Khởi tạo đợt bình xét phân loại năm học {request.NamHoc} hoàn tất.",
                soLuongTaoMoi = newRecords.Count,
                soLuongBoQua = skippedCount,
                tongSinhVien = sinhViens.Count
            });
        }

        // 6. GET: api/XepLoai/export-excel (Xuất danh sách phân loại ra file Excel)
        [HttpGet("export-excel")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ExportExcel(
            [FromQuery] string? namHoc,
            [FromQuery] string? khoa,
            [FromQuery] string? lop,
            [FromQuery] string? xepLoai,
            [FromQuery] bool? doanKhoaDuyet)
        {
            ExcelPackage.License.SetNonCommercialPersonal("DoanVienAPI");

            var query = _context.XepLoaiDoanViens
                .Include(x => x.SinhVien)
                .AsQueryable();

            if (!string.IsNullOrEmpty(namHoc)) query = query.Where(x => x.NamHoc == namHoc);
            if (!string.IsNullOrEmpty(khoa)) query = query.Where(x => x.SinhVien != null && x.SinhVien.Khoa == khoa);
            if (!string.IsNullOrEmpty(lop)) query = query.Where(x => x.SinhVien != null && x.SinhVien.Lop != null && x.SinhVien.Lop.Contains(lop));
            if (!string.IsNullOrEmpty(xepLoai) && xepLoai != "TatCa") query = query.Where(x => x.XepLoai == xepLoai);
            if (doanKhoaDuyet.HasValue) query = query.Where(x => x.DoanKhoaDuyet == doanKhoaDuyet.Value);

            var items = await query
                .OrderBy(x => x.SinhVien != null ? x.SinhVien.Lop : "")
                .ThenBy(x => x.SinhVien != null ? x.SinhVien.MSSV : "")
                .ToListAsync();

            using (var package = new ExcelPackage())
            {
                var ws = package.Workbook.Worksheets.Add("XepLoaiDoanVien");

                // Tiêu đề
                ws.Cells["A1:K1"].Merge = true;
                ws.Cells["A1"].Value = "BẢNG TỔNG HỢP KẾT QUẢ ĐÁNH GIÁ & PHÂN LOẠI ĐOÀN VIÊN";
                ws.Cells["A1"].Style.Font.Size = 16;
                ws.Cells["A1"].Style.Font.Bold = true;
                ws.Cells["A1"].Style.Font.Color.SetColor(Color.FromArgb(30, 58, 138));
                ws.Cells["A1"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                ws.Cells["A2:K2"].Merge = true;
                ws.Cells["A2"].Value = $"Năm học: {namHoc ?? "Tất cả"} | Khoa: {khoa ?? "Tất cả"} | Ngày xuất: {DateTime.Now:dd/MM/yyyy HH:mm}";
                ws.Cells["A2"].Style.Font.Italic = true;
                ws.Cells["A2"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                // Headers
                string[] headers = { "STT", "MSSV", "Họ và Tên", "Chi đoàn (Lớp)", "Khoa", "Điểm RL", "Tự đánh giá", "Chi đoàn nhận xét", "Xếp loại chính thức", "Trạng thái duyệt", "Đoàn viên ưu tú" };
                for (int i = 0; i < headers.Length; i++)
                {
                    ws.Cells[4, i + 1].Value = headers[i];
                    ws.Cells[4, i + 1].Style.Font.Bold = true;
                    ws.Cells[4, i + 1].Style.Fill.PatternType = ExcelFillStyle.Solid;
                    ws.Cells[4, i + 1].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(254, 240, 138));
                    ws.Cells[4, i + 1].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(234, 179, 8));
                    ws.Cells[4, i + 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                }

                int row = 5;
                int stt = 1;
                foreach (var item in items)
                {
                    ws.Cells[row, 1].Value = stt++;
                    ws.Cells[row, 2].Value = item.SinhVien?.MSSV ?? "";
                    ws.Cells[row, 3].Value = item.SinhVien?.HoTen ?? "";
                    ws.Cells[row, 4].Value = item.SinhVien?.Lop ?? "";
                    ws.Cells[row, 5].Value = item.SinhVien?.Khoa ?? "";
                    ws.Cells[row, 6].Value = item.SinhVien?.DiemRenLuyenTichLuy ?? 0;
                    ws.Cells[row, 7].Value = item.TuDanhGia ?? "-";
                    ws.Cells[row, 8].Value = item.ChiDoanDanhGia ?? "-";

                    string xlVi = item.XepLoai switch
                    {
                        "XuatSac" => "Xuất sắc",
                        "Kha" => "Khá",
                        "TrungBinh" => "Trung bình",
                        "Yeu" => "Yếu",
                        _ => item.XepLoai
                    };
                    ws.Cells[row, 9].Value = xlVi;
                    ws.Cells[row, 9].Style.Font.Bold = true;

                    if (item.XepLoai == "XuatSac") ws.Cells[row, 9].Style.Font.Color.SetColor(Color.FromArgb(161, 98, 7));
                    else if (item.XepLoai == "Kha") ws.Cells[row, 9].Style.Font.Color.SetColor(Color.FromArgb(22, 101, 52));
                    else if (item.XepLoai == "TrungBinh") ws.Cells[row, 9].Style.Font.Color.SetColor(Color.FromArgb(194, 65, 12));
                    else ws.Cells[row, 9].Style.Font.Color.SetColor(Color.FromArgb(185, 28, 28));

                    ws.Cells[row, 10].Value = item.DoanKhoaDuyet ? "Đã duyệt" : "Chờ duyệt";
                    ws.Cells[row, 11].Value = (item.SinhVien?.LaDoanVienUuTu ?? false) ? "Đoàn viên Ưu tú" : "-";

                    for (int col = 1; col <= 11; col++)
                    {
                        ws.Cells[row, col].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(229, 231, 235));
                    }

                    row++;
                }

                ws.Cells.AutoFitColumns();

                var fileBytes = package.GetAsByteArray();
                string fileName = $"Bao_Cao_Xep_Loai_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
                return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
        }

        // ==========================================
        // DÀNH CHO SINH VIÊN (CỔNG ĐOÀN VIÊN)
        // ==========================================

        // 7. GET: api/XepLoai/me (Xem kết quả đánh giá phân loại của chính mình)
        [HttpGet("me")]
        public async Task<IActionResult> GetMyXepLoai()
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

            var danhSach = await _context.XepLoaiDoanViens
                .Where(x => x.SinhVienId == sv.Id)
                .OrderByDescending(x => x.NamHoc)
                .Select(x => new
                {
                    x.Id,
                    x.NamHoc,
                    x.XepLoai,
                    x.TuDanhGia,
                    x.ChiDoanDanhGia,
                    x.DoanKhoaDuyet
                })
                .ToListAsync();

            var current = danhSach.FirstOrDefault();

            return Ok(new
            {
                sinhVien = new
                {
                    sv.MSSV,
                    sv.HoTen,
                    sv.Lop,
                    sv.Khoa,
                    sv.ChucVuDoan,
                    sv.LaDoanVienUuTu,
                    sv.DiemRenLuyenTichLuy
                },
                currentRating = current,
                history = danhSach
            });
        }

        // 8. POST: api/XepLoai/tu-danh-gia (Đoàn viên tự nhận xét & đề xuất xếp loại)
        [HttpPost("tu-danh-gia")]
        public async Task<IActionResult> TuDanhGia([FromBody] TuDanhGiaRequest request)
        {
            var mssvClaim = User.Claims.FirstOrDefault(c => c.Type == "MSSV");
            if (mssvClaim == null)
            {
                return Unauthorized("Không tìm thấy thông tin định danh.");
            }

            string mssv = mssvClaim.Value;
            var sv = await _context.SinhViens.FirstOrDefaultAsync(s => s.MSSV == mssv);
            if (sv == null)
            {
                return NotFound("Không tìm thấy sinh viên.");
            }

            var record = await _context.XepLoaiDoanViens
                .FirstOrDefaultAsync(x => x.SinhVienId == sv.Id && x.NamHoc == request.NamHoc);

            if (record != null && record.DoanKhoaDuyet)
            {
                return BadRequest("Kết quả phân loại năm học này đã được Đoàn Trường phê duyệt chính thức, không thể thay đổi.");
            }

            if (record == null)
            {
                record = new XepLoaiDoanVien
                {
                    SinhVienId = sv.Id,
                    NamHoc = request.NamHoc,
                    XepLoai = request.XepLoai,
                    TuDanhGia = request.TuDanhGia?.Trim(),
                    DoanKhoaDuyet = false
                };
                await _context.XepLoaiDoanViens.AddAsync(record);
            }
            else
            {
                record.XepLoai = request.XepLoai;
                record.TuDanhGia = request.TuDanhGia?.Trim();
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Đã lưu bản tự đánh giá đoàn viên thành công.",
                data = new
                {
                    record.Id,
                    record.NamHoc,
                    record.XepLoai,
                    record.TuDanhGia
                }
            });
        }
    }

    // DTO Classes
    public class ChiDoanDanhGiaRequest
    {
        public string XepLoai { get; set; } = "Kha";
        public string? ChiDoanDanhGia { get; set; }
    }

    public class DuyetXepLoaiRequest
    {
        public bool DoanKhoaDuyet { get; set; } = true;
        public bool? SetDoanVienUuTu { get; set; }
    }

    public class DuyetHangLoatRequest
    {
        public List<int> Ids { get; set; } = new List<int>();
        public bool DoanKhoaDuyet { get; set; } = true;
    }

    public class KhoiTaoDotRequest
    {
        public string NamHoc { get; set; } = "2025-2026";
        public string? Khoa { get; set; }
        public string? Lop { get; set; }
    }

    public class TuDanhGiaRequest
    {
        public string NamHoc { get; set; } = "2025-2026";
        public string XepLoai { get; set; } = "XuatSac";
        public string? TuDanhGia { get; set; }
    }
}
