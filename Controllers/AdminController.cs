using DoanVienAPI.Data;
using DoanVienAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using OfficeOpenXml.Style;

namespace DoanVienAPI.Controllers
{
    [Authorize]
    public class AdminController: Controller
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }
        // ==========================================
        // PHẦN 1: QUẢN LÝ HOẠT ĐỘNG
        // ==========================================
        // 1. Trang Dashboard (Index)
        public async Task<IActionResult> Index()
        {
            // --- DASHBOARD (TRANG CHÍNH) ---
            // 1. Thống kê số lượng để hiển thị lên các ô vuông (Card)
            ViewBag.SoLuongHoatDong = await _context.HoatDongs.CountAsync();
            ViewBag.SoLuongDangKy = await _context.DangKyHoatDongs.CountAsync();

            // Ví dụ thống kê sinh viên (nếu bạn đã có bảng SinhVien)
            // ViewBag.SoLuongSinhVien = await _context.SinhViens.CountAsync(); 

            return View(); // Trả về view Index mới (Dashboard)
        }


        // 2. Trang danh sách hoạt động
        public async Task<IActionResult> HoatDong()
        {
            var hoatDongs = await _context.HoatDongs
                                          .OrderByDescending(h => h.ThoiGianBatDau)
                                          .ToListAsync();
            return View(hoatDongs);
        }

        //  Trang tạo mới (GET)
        public IActionResult Create()
        {
            return View();
        }

        //  Xử lý tạo mới (POST)
        [HttpPost]
        public async Task<IActionResult> Create(HoatDong hoatDong)
        {
            if (ModelState.IsValid)
            {
                _context.Add(hoatDong);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(HoatDong));
            }
            return View(hoatDong);
        }
        // 3. Trang sửa hoạt động (GET)
        public async Task<IActionResult> Edit(int id)
        {
            var hd = await _context.HoatDongs.FindAsync(id);
            if (hd == null)
            {
                return NotFound(); // Trả về lỗi nếu không tìm thấy ID
            }
            return View(hd); // Trả về giao diện Edit kèm dữ liệu
        }

        // Xử lý sửa hoạt động (POST)
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, HoatDong hoatDong)
        {
            if (id != hoatDong.Id) return NotFound();

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(hoatDong);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!_context.HoatDongs.Any(e => e.Id == id)) return NotFound();
                    else throw;
                }
                return RedirectToAction(nameof(HoatDong)); // Sửa xong quay về danh sách
            }
            return View(hoatDong);
        }

        // 4. Xóa hoạt động
        public async Task<IActionResult> Delete(int id)
        {
            var hd = await _context.HoatDongs.FindAsync(id);
            if (hd != null)
            {
                // Xóa các đăng ký liên quan trước để tránh lỗi khóa ngoại
                var dks = _context.DangKyHoatDongs.Where(d => d.HoatDongId == id);
                _context.DangKyHoatDongs.RemoveRange(dks);

                // Xóa hoạt động
                _context.HoatDongs.Remove(hd);
                await _context.SaveChangesAsync();
            }
            return RedirectToAction(nameof(HoatDong));
        }
        // 3. Trang Chi tiết (Xem danh sách sinh viên đăng ký)
        public async Task<IActionResult> Details(int id)
        {
            // Lấy hoạt động
            var hd = await _context.HoatDongs.FindAsync(id);
            if (hd == null) return NotFound();
            // Lấy danh sách sinh viên đã đăng ký hoạt động này
            var danhSachSV = await _context.DangKyHoatDongs
                .Include(d => d.SinhVien)
                .Where(d => d.HoatDongId == id)
                .ToListAsync();
            ViewBag.HoatDong = hd;
            return View(danhSachSV);
        }

        // 4. Xử lý Check-in (Gọi từ giao diện Web)
        public async Task<IActionResult> ConfirmCheckIn(int id)
        {
            var dk = await _context.DangKyHoatDongs.FindAsync(id);
            if (dk != null)
            {
                dk.TrangThai = "DaThamGia";
                dk.ThoiGianCheckIn = DateTime.Now;

                // Cộng điểm
                var hd = await _context.HoatDongs.FindAsync(dk.HoatDongId);
                var sv = await _context.SinhViens.FindAsync(dk.SinhVienId);
                if (hd != null && sv != null) sv.DiemRenLuyenTichLuy += (int)hd.DiemCong;

                await _context.SaveChangesAsync();
            }
            // Quay lại trang chi tiết cũ
            return RedirectToAction("Details", new { id = dk.HoatDongId });
        }
        // ==========================================
        // PHẦN 2: QUẢN LÝ SINH VIÊN (MỚI)
        // ==========================================
        // 1. Danh sách Sinh viên
        public async Task<IActionResult> SinhVien()
        {
            var list = await _context.SinhViens.ToListAsync();
            return View(list);
        }
        // 3. Sửa Sinh viên
        public async Task<IActionResult> SuaSinhVien(int id)
        {
            var sv = await _context.SinhViens.FindAsync(id);
            return sv == null ? NotFound() : View(sv);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> SuaSinhVien(int id, SinhVien model)
        {
            if (id != model.Id) return NotFound();
            if (ModelState.IsValid)
            {
                _context.Update(model);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(SinhVien));
            }
            return View(model);
        }

        // 4. Xóa Sinh viên
        public async Task<IActionResult> SinhVienDelete(int id)
        {
            var sv = await _context.SinhViens.FindAsync(id);
            if (sv != null)
            {
                // Xóa lịch sử đăng ký của SV này trước
                var dks = _context.DangKyHoatDongs.Where(d => d.SinhVienId == id);
                _context.DangKyHoatDongs.RemoveRange(dks);

                _context.SinhViens.Remove(sv);
                await _context.SaveChangesAsync();
            }
            return RedirectToAction(nameof(SinhVien));
        }
        public IActionResult SinhVienCreate()
        {
            return View();
        }
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> SinhVienCreate(SinhVien sv)
        {
            if (ModelState.IsValid)
            {
                _context.SinhViens.Add(sv);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(SinhVien));
            }
            return View(sv);
        }
        // 5. Xuất Excel danh sách Sinh viên
        public async Task<IActionResult> ExportSinhVien()
        {
            ExcelPackage.License.SetNonCommercialPersonal("DoanVienAPI");

            var list = await _context.SinhViens.ToListAsync();

            using (var package = new ExcelPackage())
            {
                var ws = package.Workbook.Worksheets.Add("SinhVien");

                // Header
                ws.Cells[1, 1].Value = "MSSV";
                ws.Cells[1, 2].Value = "Họ tên";
                ws.Cells[1, 3].Value = "Lớp";
                ws.Cells[1, 4].Value = "Khoa";
                ws.Cells[1, 5].Value = "Email";
                ws.Cells[1, 6].Value = "Điểm RL";

                // Data
                int row = 2;
                foreach (var sv in list)
                {
                    ws.Cells[row, 1].Value = sv.MSSV;
                    ws.Cells[row, 2].Value = sv.HoTen;
                    ws.Cells[row, 3].Value = sv.Lop;
                    ws.Cells[row, 4].Value = sv.Khoa;
                    ws.Cells[row, 5].Value = sv.Email;
                    ws.Cells[row, 6].Value = sv.DiemRenLuyenTichLuy;
                    row++;
                }

                ws.Cells.AutoFitColumns();

                var stream = new MemoryStream(package.GetAsByteArray());

                return File(stream,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "DanhSachSinhVien.xlsx");
            }
        }
        // 6. Tải về file Excel mẫu để nhập danh sách Sinh viên
        public IActionResult DownloadTemplateSinhVien()
        {
            ExcelPackage.License.SetNonCommercialPersonal("DoanVienAPI");

            using (var package = new ExcelPackage())
            {
                var ws = package.Workbook.Worksheets.Add("Template");

                ws.Cells[1, 1].Value = "MSSV";
                ws.Cells[1, 2].Value = "HoTen";
                ws.Cells[1, 3].Value = "Lop";
                ws.Cells[1, 4].Value = "Khoa";
                ws.Cells[1, 5].Value = "Email";

                ws.Cells[2, 1].Value = "SV001";
                ws.Cells[2, 2].Value = "Nguyễn Văn A";
                ws.Cells[2, 3].Value = "21DTHA1";
                ws.Cells[2, 4].Value = "CNTT";
                ws.Cells[2, 5].Value = "a@gmail.com";

                ws.Cells.AutoFitColumns();

                var stream = new MemoryStream(package.GetAsByteArray());

                return File(stream,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "TemplateSinhVien.xlsx");
            }
        }
        // 7. Xử lý import file Excel danh sách Sinh viên
        [HttpPost]
        public async Task<IActionResult> ImportSinhVien(IFormFile file)
        {
            ExcelPackage.License.SetNonCommercialPersonal("DoanVienAPI");

            if (file == null || file.Length == 0)
            {
                TempData["Error"] = " Chưa chọn file!";
                return RedirectToAction("SinhVien");
            }

            int success = 0;
            int fail = 0;

            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);

                using (var package = new ExcelPackage(stream))
                {
                    var ws = package.Workbook.Worksheets[0];
                    int rowCount = ws.Dimension.Rows;

                    for (int row = 2; row <= rowCount; row++)
                    {
                        try
                        {
                            var mssv = ws.Cells[row, 1].Text;

                            if (string.IsNullOrEmpty(mssv))
                            {
                                fail++;
                                continue;
                            }

                            // Check trùng
                            if (_context.SinhViens.Any(x => x.MSSV == mssv))
                            {
                                fail++;
                                continue;
                            }

                            var sv = new SinhVien
                            {
                                MSSV = mssv,
                                HoTen = ws.Cells[row, 2].Text,
                                Lop = ws.Cells[row, 3].Text,
                                Khoa = ws.Cells[row, 4].Text,
                                Email = ws.Cells[row, 5].Text,
                                DiemRenLuyenTichLuy = 0
                            };

                            _context.SinhViens.Add(sv);
                            success++;
                        }
                        catch
                        {
                            fail++;
                        }
                    }

                    await _context.SaveChangesAsync();
                }
            }

            TempData["Success"] = $"✔ Thành công: {success} | ❌ Lỗi: {fail}";
            return RedirectToAction("SinhVien");
        }

    }
}

