using DoanVienAPI.Data;
using DoanVienAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using BCrypt.Net;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace DoanVienAPI.Controllers
{
    [Authorize]
    public class AdminController: Controller
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public AdminController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
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
            ViewBag.SoLuongSinhVien = await _context.SinhViens.CountAsync();

            var currentDate = DateTime.Now;
            var sixMonthsAgo = currentDate.AddMonths(-5); // Lấy từ 6 tháng trước (tính cả tháng hiện tại)
            var startOfSixMonthsAgo = new DateTime(sixMonthsAgo.Year, sixMonthsAgo.Month, 1);

            var queryData = await _context.DangKyHoatDongs
            .Where(dk => dk.NgayDangKy >= startOfSixMonthsAgo)
            .GroupBy(dk => new { dk.NgayDangKy.Year, dk.NgayDangKy.Month })
            .Select(g => new
            {
                Nam = g.Key.Year,
                Thang = g.Key.Month,
                SoLuong = g.Count()
            })
            .ToListAsync();

            List<string> labels = new List<string>();
            List<int> data = new List<int>();

            for (int i = 5; i >= 0; i--)
            {
                var targetMonth = currentDate.AddMonths(-i);
                labels.Add($"Tháng {targetMonth.Month}/{targetMonth.Year.ToString().Substring(2)}"); // Ví dụ: "Tháng 4/24"

                // Tìm xem tháng này có data trong query không, không có thì mặc định = 0
                var monthData = queryData.FirstOrDefault(q => q.Nam == targetMonth.Year && q.Thang == targetMonth.Month);
                data.Add(monthData != null ? monthData.SoLuong : 0);
            }

            ViewBag.ChartLabels = System.Text.Json.JsonSerializer.Serialize(labels);
            ViewBag.ChartData = System.Text.Json.JsonSerializer.Serialize(data);

            // 2. Lấy 3 hoạt động mới nhất để hiển thị lên phần "Tin tức mới"
            var tinTucMoi = await _context.HoatDongs
                .OrderByDescending(h => h.ThoiGianBatDau) 
                .Take(3)                   
                .ToListAsync();
            ViewBag.TinNhanMoi = await _context.ChatMessages.CountAsync(m => !m.IsRead);

            ViewBag.ThongBaoMoi = await _context.HoatDongs
                .OrderByDescending(h => h.ThoiGianBatDau)
                .Take(5)
                .ToListAsync();

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
        public async Task<IActionResult> Edit(int id, HoatDong hoatDong, IFormFile? imageFile)
        {
            if (id != hoatDong.Id) return NotFound();

            if (ModelState.IsValid)
            {
                try
                {
                    // 1. Lấy dữ liệu cũ từ DB (cực kỳ quan trọng để không làm mất ảnh cũ nếu không chọn ảnh mới)
                    var existingHD = await _context.HoatDongs.AsNoTracking().FirstOrDefaultAsync(h => h.Id == id);
                    if (existingHD == null) return NotFound();

                    // 2. Xử lý lưu ảnh nếu có chọn ảnh mới
                    if (imageFile != null && imageFile.Length > 0)
                    {
                        // Tạo thư mục nếu chưa có
                        var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads", "activities");
                        if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                        // Tạo tên file để không bị trùng (vd: d8f3..._anh1.jpg)
                        var uniqueFileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(imageFile.FileName);
                        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                        // Lưu file vào thư mục wwwroot
                        using (var fileStream = new FileStream(filePath, FileMode.Create))
                        {
                            await imageFile.CopyToAsync(fileStream);
                        }

                        // Cập nhật đường dẫn mới vào object hoatDong
                        hoatDong.ImageUrl = $"/uploads/activities/{uniqueFileName}";
                    }
                    else
                    {
                        // Nếu KHÔNG chọn ảnh mới, lấy lại đường dẫn ảnh cũ đắp vào
                        hoatDong.ImageUrl = existingHD.ImageUrl;
                    }

                    // 3. Cập nhật vào DB
                    _context.Update(hoatDong);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!_context.HoatDongs.Any(e => e.Id == id)) return NotFound();
                    else throw;
                }
                return RedirectToAction(nameof(HoatDong));
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
        public async Task<IActionResult> SinhVien(string khoa, string lop)
        {
            // 1. Khởi tạo truy vấn từ bảng SinhViens
            var query = _context.SinhViens.AsQueryable();

            // 2. Lọc theo Khoa (So sánh chính xác)
            if (!string.IsNullOrEmpty(khoa))
            {
                query = query.Where(s => s.Khoa == khoa);
            }

            // 3. Lọc theo Lớp (Tìm kiếm chứa từ khóa - Contains)
            if (!string.IsNullOrEmpty(lop))
            {
                query = query.Where(s => s.Lop != null && s.Lop.Contains(lop));
            }

            // 4. Lấy danh sách các Khoa duy nhất để hiển thị vào Dropdown lọc trên giao diện
            ViewBag.DanhSachKhoa = await _context.SinhViens
                .Where(s => s.Khoa != null)
                .Select(s => s.Khoa)
                .Distinct()
                .ToListAsync();

            // 5. Gửi lại giá trị lọc để giữ trạng thái trên các ô nhập liệu
            ViewBag.SelectedKhoa = khoa;
            ViewBag.SelectedLop = lop;

            // Thực thi truy vấn và trả về View
            var list = await query.ToListAsync();
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
                if (string.IsNullOrEmpty(sv.Password))
                {
                    sv.Password = BCrypt.Net.BCrypt.HashPassword(sv.MSSV);
                }
                else
                {
                    // Nếu admin tự nhập mật khẩu riêng, cũng phải mã hóa nó luôn
                    sv.Password = BCrypt.Net.BCrypt.HashPassword(sv.Password);
                }
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
        [ValidateAntiForgeryToken]
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
            int updated = 0;

            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);

                using (var package = new ExcelPackage(stream))
                {
                    var ws = package.Workbook.Worksheets[0];
                    if (ws.Dimension == null)
                    {
                        TempData["Error"] = "File Excel không có dữ liệu!";
                        return RedirectToAction("SinhVien");
                    }
                    int rowCount = ws.Dimension.Rows;

                    for (int row = 2; row <= rowCount; row++)
                    {
                        try
                        {
                            var mssv = ws.Cells[row, 1].Text;
                            if (string.IsNullOrEmpty(mssv)) continue;

                            int diemRL = 0;
                            int.TryParse(ws.Cells[row, 6].Value?.ToString(), out diemRL);

                            var existingSv = await _context.SinhViens.FirstOrDefaultAsync(x => x.MSSV == mssv);
                            if (existingSv != null)
                            {
                                existingSv.HoTen = ws.Cells[row, 2].Value?.ToString()?.Trim() ?? existingSv.HoTen;
                                existingSv.Lop = ws.Cells[row, 3].Value?.ToString()?.Trim() ?? existingSv.Lop;
                                existingSv.Khoa = ws.Cells[row, 4].Value?.ToString()?.Trim() ?? existingSv.Khoa;
                                existingSv.Email = ws.Cells[row, 5].Value?.ToString()?.Trim() ?? existingSv.Email;

                                existingSv.DiemRenLuyenTichLuy = diemRL;

                                if (string.IsNullOrEmpty(existingSv.Password))
                                {
                                    existingSv.Password = BCrypt.Net.BCrypt.HashPassword(mssv);
                                }

                                _context.SinhViens.Update(existingSv);
                                updated++;
                            }
                            else
                            {
                                var sinhVienMoi = new SinhVien
                                {
                                    MSSV = mssv,
                                    HoTen = ws.Cells[row, 2].Value?.ToString()?.Trim() ?? "Chưa có tên",
                                    Lop = ws.Cells[row, 3].Value?.ToString()?.Trim(),
                                    Khoa = ws.Cells[row, 4].Value?.ToString()?.Trim(),
                                    Email = ws.Cells[row, 5].Value?.ToString()?.Trim(),
                                    DiemRenLuyenTichLuy = diemRL,
                                    // Model SinhVien yêu cầu Password (bạn gán mặc định là MSSV)
                                    Password = BCrypt.Net.BCrypt.HashPassword(mssv)
                                };
                                _context.SinhViens.Add(sinhVienMoi);
                                success++;
                            }

                            await _context.SaveChangesAsync();
                        }
                        catch
                        {
                            fail++;
                        }
                    }
                }
            }

            TempData["Success"] = $" Thành công: {success} |  Lỗi: {fail}";
            return RedirectToAction("SinhVien");
        }

    }
}

