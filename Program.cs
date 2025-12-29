using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.EntityFrameworkCore;
using DoanVienAPI.Models;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
// Đăng ký AppDbContext (Lúc này nó sẽ tự tìm trong folder Models)
builder.Services.AddDbContext<AppDbContext>(o => o.UseSqlServer(connectionString));
builder.Services.AddEndpointsApiExplorer();



builder.Services.AddSwaggerGen(option =>
{
    option.SwaggerDoc("v1", new OpenApiInfo { Title = "DoanVien API", Version = "v1" });

    // 1. Định nghĩa Security (Cái ổ khóa)
    // LƯU Ý: Ở đây KHÔNG CÓ thuộc tính Reference
    option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Vui lòng nhập Token vào ô bên dưới (Ví dụ: Bearer eyJ...)",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "Bearer"
    });

    // 2. Yêu cầu bảo mật (Chìa khóa để mở ổ)
    option.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                // Reference nằm ở đây mới đúng!
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[]{}
        }
    });
});


// 1. CẤU HÌNH JWT AUTHENTICATION
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });
// 2. CẤU HÌNH SIGNALR (SOCKET)
builder.Services.AddSignalR();

// 3. CẤU HÌNH CONTROLLERS
builder.Services.AddControllers();
var app = builder.Build();

// 2. CẤU HÌNH SWAGGER
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 3. CÁC API
app.MapGet("/api/sinhvien", async (AppDbContext db) =>
    await db.SinhViens.ToListAsync());

app.MapPost("/api/sinhvien", async (AppDbContext db, SinhVien sv) =>
{
    db.SinhViens.Add(sv);
    await db.SaveChangesAsync();
    return Results.Ok(sv);
});
app.UseAuthentication(); // <--- Thêm dòng này
app.UseAuthorization();

app.MapControllers();

// Chạy ứng dụng
app.Run("http://0.0.0.0:5000");