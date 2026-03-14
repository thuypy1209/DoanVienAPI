using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DoanVienAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;
using DoanVienAPI.Data;

namespace DoanVienAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        //  đọc chuỗi kết nối từ appsettings.json và key JWT
        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            // 1. Kiểm tra dữ liệu đầu vào
            if (string.IsNullOrEmpty(model.Username) || string.IsNullOrEmpty(model.Password))
            {
                return BadRequest("Vui lòng nhập tài khoản và mật khẩu.");
            }

            var sinhVien = await _context.SinhViens
                .FirstOrDefaultAsync(sv => sv.MSSV == model.Username);

            // 3. Kiểm tra thông tin (Logic xác thực)
            if (sinhVien == null)
            {
                return Unauthorized("Tài khoản không tồn tại."); // Mã 401
            }

            bool isValidPassword = BCrypt.Net.BCrypt.Verify(model.Password, sinhVien.Password);

            if (!isValidPassword)
            {
                return Unauthorized("Mật khẩu không đúng.");
            }

            // 4. Nếu đăng nhập đúng -> Tạo Token
            var token = GenerateJwtToken(sinhVien);

            return Ok(new
            {
                Message = "Đăng nhập thành công!",
                Token = token,
                HoTen = sinhVien.HoTen,
                MSSV = sinhVien.MSSV,
                Lop = sinhVien.Lop
            });
        }
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            // 1. Kiểm tra MSSV trùng
            if (await _context.SinhViens.AnyAsync(s => s.MSSV == model.MSSV))
            {
                return BadRequest("Mã số sinh viên này đã tồn tại!");
            }

            // 2. (Mới) Kiểm tra Email trùng (nếu cần)
            if (!string.IsNullOrEmpty(model.Email) && await _context.SinhViens.AnyAsync(s => s.Email == model.Email))
            {
                return BadRequest("Email này đã được sử dụng bởi sinh viên khác!");
            }

            // 3. Tạo sinh viên mới
            var sv = new SinhVien
            {
                MSSV = model.MSSV,
                Password = BCrypt.Net.BCrypt.HashPassword(model.Password),
                HoTen = model.HoTen,               
                Email = model.Email,
                Lop = model.Lop,
                Khoa = model.Khoa,
                DiemRenLuyenTichLuy = 0
            };

            _context.SinhViens.Add(sv);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đăng ký thành công!", Data = sv });
        }
        // Hàm phụ trợ để sinh mã Token
        private string GenerateJwtToken(SinhVien user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

          
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.HoTen),
                new Claim("MSSV", user.MSSV),
                new Claim("Lop", user.Lop ?? ""), 
                new Claim("Khoa", user.Khoa ?? ""),
                new Claim("DiemRL", user.DiemRenLuyenTichLuy.ToString()),
                new Claim("Email", user.Email ?? "")
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(30),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}
