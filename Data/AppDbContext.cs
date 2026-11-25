using DoanVienAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace DoanVienAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions options) : base(options) { }

        // Các bảng trong Database
        public DbSet<SinhVien> SinhViens { get; set; }
        public DbSet<HoatDong> HoatDongs { get; set; }
        public DbSet<DangKyHoatDong> DangKyHoatDongs { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<ChungNhan> ChungNhans { get; set; }

        // Nghiệp vụ Đoàn viên mở rộng
        public DbSet<DoanPhi> DoanPhis { get; set; }
        public DbSet<XepLoaiDoanVien> XepLoaiDoanViens { get; set; }
        public DbSet<SoDoan> SoDoans { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // MSSV là duy nhất
            modelBuilder.Entity<SinhVien>()
                .HasIndex(s => s.MSSV)
                .IsUnique();

            // Quan hệ SinhVien - DangKyHoatDong
            modelBuilder.Entity<DangKyHoatDong>()
                .HasOne(d => d.SinhVien)
                .WithMany(s => s.DanhSachThamGia)
                .HasForeignKey(d => d.SinhVienId)
                .OnDelete(DeleteBehavior.Cascade);

            // Quan hệ SinhVien - DoanPhi
            modelBuilder.Entity<DoanPhi>()
                .HasOne(d => d.SinhVien)
                .WithMany(s => s.DanhSachDoanPhi)
                .HasForeignKey(d => d.SinhVienId)
                .OnDelete(DeleteBehavior.Cascade);

            // Quan hệ SinhVien - XepLoaiDoanVien (Unique SinhVienId + NamHoc)
            modelBuilder.Entity<XepLoaiDoanVien>()
                .HasIndex(x => new { x.SinhVienId, x.NamHoc })
                .IsUnique();

            modelBuilder.Entity<XepLoaiDoanVien>()
                .HasOne(x => x.SinhVien)
                .WithMany(s => s.DanhSachXepLoai)
                .HasForeignKey(x => x.SinhVienId)
                .OnDelete(DeleteBehavior.Cascade);

            // Quan hệ SinhVien - SoDoan (1 - 1)
            modelBuilder.Entity<SoDoan>()
                .HasOne(s => s.SinhVien)
                .WithOne(sv => sv.SoDoan)
                .HasForeignKey<SoDoan>(s => s.SinhVienId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
