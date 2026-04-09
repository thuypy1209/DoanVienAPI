using DoanVienAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace DoanVienAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions options) : base(options) { }

        // Đại diện cho bảng SinhVien trong Database
        public DbSet<SinhVien> SinhViens { get; set; }
        public DbSet<HoatDong> HoatDongs { get; set; }
        public DbSet<DangKyHoatDong> DangKyHoatDongs { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<ChungNhan> ChungNhans { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            modelBuilder.Entity<SinhVien>()
                .HasIndex(s => s.MSSV)
                .IsUnique();

            modelBuilder.Entity<DangKyHoatDong>()
                .HasOne(d => d.SinhVien)
                .WithMany(s => s.DanhSachThamGia)
                .HasForeignKey(d => d.SinhVienId);
        }
    }
}
