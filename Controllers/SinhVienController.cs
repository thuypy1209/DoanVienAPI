using DoanVienAPI.Data;
using DoanVienAPI.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using OfficeOpenXml;

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

        // ==========================================
        // DÀNH CHO ADMIN: QUẢN LÝ SINH VIÊN
        // ==========================================

        // 1. GET: api/SinhVien (Lấy danh sách sinh viên có lọc)
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll([FromQuery] string? khoa, [FromQuery] string? lop, [FromQuery] string? search)
        {
            var query = _context.SinhViens.AsQueryable();

            if (!string.IsNullOrEmpty(khoa))
            {
                query = query.Where(s => s.Khoa == khoa);
            }

            if (!string.IsNullOrEmpty(lop))
            {
                query = query.Where(s => s.Lop != null && s.Lop.Contains(lop));
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(s => s.MSSV.Contains(search) || 
                                         s.HoTen.Contains(search) || 
                                         (s.Email != null && s.Email.Contains(search)));
            }

            var list = await query
                .OrderBy(s => s.MSSV)
                .Select(s => new
                {
                    s.Id,
                    s.MSSV,
                    s.HoTen,
                    s.Lop,
                    s.Khoa,
                    s.Email,
                    s.DiemRenLuyenTichLuy,
                    s.AvatarUrl
                })
                .ToListAsync();

            var danhSachKhoa = await _context.SinhViens
                .Where(s => !string.IsNullOrEmpty(s.Khoa))
                .Select(s => s.Khoa!)
                .Distinct()
                .ToListAsync();

            return Ok(new
            {
                sinhViens = list,
                danhSachKhoa = danhSachKhoa
            });
        }

        // 2. POST: api/SinhVien (Thêm sinh viên mới)
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] SinhVien model)
        {
            if (await _context.SinhViens.AnyAsync(s => s.MSSV == model.MSSV))
            {
                return BadRequest(new { message = "Mã số sinh viên này đã tồn tại!" });
            }

            if (string.IsNullOrEmpty(model.Password))
            {
                model.Password = BCrypt.Net.BCrypt.HashPassword(model.MSSV);
            }
            else
            {
                model.Password = BCrypt.Net.BCrypt.HashPassword(model.Password);
            }

            _context.SinhViens.Add(model);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Thêm sinh viên thành công!", data = model });
        }

        // 3. PUT: api/SinhVien/{id} (Cập nhật thông tin sinh viên)
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] SinhVien model)
        {
            var sv = await _context.SinhViens.FindAsync(id);
            if (sv == null) return NotFound(new { message = "Không tìm thấy sinh viên." });

            if (sv.MSSV != model.MSSV && await _context.SinhViens.AnyAsync(s => s.MSSV == model.MSSV))
            {
                return BadRequest(new { message = "Mã số sinh viên mới đã tồn tại ở sinh viên khác!" });
            }

            sv.MSSV = model.MSSV;
            sv.HoTen = model.HoTen;
            sv.Lop = model.Lop;
            sv.Khoa = model.Khoa;
            sv.Email = model.Email;
            sv.DiemRenLuyenTichLuy = model.DiemRenLuyenTichLuy;

            if (!string.IsNullOrEmpty(model.Password))
            {
                sv.Password = BCrypt.Net.BCrypt.HashPassword(model.Password);
            }

            _context.SinhViens.Update(sv);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật sinh viên thành công!" });
        }

        // 4. DELETE: api/SinhVien/{id} (Xóa sinh viên)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var sv = await _context.SinhViens.FindAsync(id);
            if (sv == null) return NotFound(new { message = "Không tìm thấy sinh viên." });

            var dks = _context.DangKyHoatDongs.Where(d => d.SinhVienId == id);
            _context.DangKyHoatDongs.RemoveRange(dks);

            _context.SinhViens.Remove(sv);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa sinh viên thành công!" });
        }

        // 5. POST: api/SinhVien/import-excel (Nhập file Excel)
        [HttpPost("import-excel")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ImportExcel(IFormFile file)
        {
            ExcelPackage.License.SetNonCommercialPersonal("DoanVienAPI");

            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "Chưa chọn file Excel!" });
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
                        return BadRequest(new { message = "File Excel không có dữ liệu!" });
                    }
                    int rowCount = ws.Dimension.Rows;

                    for (int row = 2; row <= rowCount; row++)
                    {
                        try
                        {
                            var mssv = ws.Cells[row, 1].Text?.Trim();
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

            return Ok(new
            {
                message = $"Import thành công: {success} sinh viên mới, cập nhật: {updated}, lỗi: {fail}",
                success,
                updated,
                fail
            });
        }

        // ==========================================
        // DÀNH CHO SINH VIÊN: PROFILE & AVATAR
        // ==========================================

        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var mssvClaim = User.Claims.FirstOrDefault(c => c.Type == "MSSV");

            if (mssvClaim == null)
            {
                return Unauthorized("Không tìm thấy thông tin xác thực.");
            }

            string mssv = mssvClaim.Value;

            var sv = await _context.SinhViens.FirstOrDefaultAsync(s => s.MSSV == mssv);

            if (sv == null)
            {
                return NotFound("Không tìm thấy dữ liệu sinh viên.");
            }

            return Ok(new
            {
                sv.MSSV,
                sv.HoTen,
                sv.Lop,
                sv.Khoa,
                sv.Email,
                sv.DiemRenLuyenTichLuy,
                sv.AvatarUrl
            });
        }

        [HttpPost("upload-avatar")]
        public async Task<IActionResult> UploadAvatar(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0) return BadRequest("Vui lòng chọn file.");

                var mssvClaim = User.Claims.FirstOrDefault(c => c.Type == "MSSV");
                if (mssvClaim == null) return Unauthorized();
                string mssv = mssvClaim.Value;

                var sinhVien = await _context.SinhViens.FirstOrDefaultAsync(s => s.MSSV == mssv);
                if (sinhVien == null) return NotFound("Không tìm thấy sinh viên.");

                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "avatars");
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);
                var uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(fileStream);
                }

                string relativePath = $"/uploads/avatars/{uniqueFileName}";
                sinhVien.AvatarUrl = relativePath;
                _context.SinhViens.Update(sinhVien);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Upload thành công", avatarUrl = relativePath });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi Server: {ex.Message}");
            }
        }
    }
}
