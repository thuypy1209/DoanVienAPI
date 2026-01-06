using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.EntityFrameworkCore;
using DoanVienAPI.Models;
using Microsoft.OpenApi.Models;
using DoanVienAPI.Data;
using Microsoft.AspNetCore.Authentication.Cookies;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
// Đăng ký AppDbContext (sẽ tự tìm trong folder Models)
builder.Services.AddDbContext<AppDbContext>(o => o.UseSqlServer(connectionString));
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder => builder
            .WithOrigins("http://localhost:7114", "http://0.0.0.0:5500", "null")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

builder.Services.AddSwaggerGen(option =>
{
    option.SwaggerDoc("v1", new OpenApiInfo { Title = "DoanVien API", Version = "v1" });

    // 1. Định nghĩa Security
    //  KHÔNG CÓ thuộc tính Reference
    option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Vui lòng nhập Token vào ô bên dưới (Ví dụ: Bearer eyJ...)",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "Bearer"
    });

    // 2. Yêu cầu bảo mật 
    option.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
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
// --- 2. CẤU HÌNH CẢ COOKIE (CHO WEB) VÀ JWT (CHO APP) ---
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme; 
    options.DefaultChallengeScheme = CookieAuthenticationDefaults.AuthenticationScheme;
})
.AddCookie(options =>
{
    options.LoginPath = "/Account/Login";
    options.AccessDeniedPath = "/Account/AccessDenied";
    options.ExpireTimeSpan = TimeSpan.FromMinutes(30);
})
.AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
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
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
           
            var accessToken = context.Request.Query["access_token"];  
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/chathub"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});
// 2. CẤU HÌNH SIGNALR (SOCKET)
builder.Services.AddSignalR();

// 3. CẤU HÌNH CONTROLLERS
builder.Services.AddControllersWithViews();
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
// Middleware
app.UseHttpsRedirection();
app.UseStaticFiles(); 
app.UseRouting();

app.UseCors("AllowAll");

//Authentication & Authorization
app.UseAuthentication(); 
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Admin}/{action=Index}/{id?}");

app.MapControllers();
// Cấu hình SignalR
app.MapHub<DoanVienAPI.Hubs.ChatHub>("/chathub");
// Chạy ứng dụng
app.Run("http://0.0.0.0:5000");
    