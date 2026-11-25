using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DoanVienAPI.Migrations
{
    /// <inheritdoc />
    public partial class UpgradeDoanVienManagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ChucVuDoan",
                table: "SinhViens",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "LaDoanVienUuTu",
                table: "SinhViens",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "NgayVaoDoan",
                table: "SinhViens",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NoiVaoDoan",
                table: "SinhViens",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SoDoanVien",
                table: "SinhViens",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TrangThaiDoan",
                table: "SinhViens",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LoaiHoatDong",
                table: "HoatDongs",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "SoLuongGioiHan",
                table: "HoatDongs",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ChungNhans",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaChungNhan = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NgayCap = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SinhVienId = table.Column<int>(type: "int", nullable: false),
                    HoatDongId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChungNhans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChungNhans_HoatDongs_HoatDongId",
                        column: x => x.HoatDongId,
                        principalTable: "HoatDongs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ChungNhans_SinhViens_SinhVienId",
                        column: x => x.SinhVienId,
                        principalTable: "SinhViens",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DoanPhis",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SinhVienId = table.Column<int>(type: "int", nullable: false),
                    HocKy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NamHoc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SoTien = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TrangThai = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NgayNop = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NguoiThu = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DoanPhis", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DoanPhis_SinhViens_SinhVienId",
                        column: x => x.SinhVienId,
                        principalTable: "SinhViens",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SoDoans",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SinhVienId = table.Column<int>(type: "int", nullable: false),
                    TrangThaiSoDoan = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NgayNop = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ViTriLuuTru = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GiayGioiThieuHe = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SoDoans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SoDoans_SinhViens_SinhVienId",
                        column: x => x.SinhVienId,
                        principalTable: "SinhViens",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "XepLoaiDoanViens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SinhVienId = table.Column<int>(type: "int", nullable: false),
                    NamHoc = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    XepLoai = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TuDanhGia = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ChiDoanDanhGia = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DoanKhoaDuyet = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_XepLoaiDoanViens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_XepLoaiDoanViens_SinhViens_SinhVienId",
                        column: x => x.SinhVienId,
                        principalTable: "SinhViens",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChungNhans_HoatDongId",
                table: "ChungNhans",
                column: "HoatDongId");

            migrationBuilder.CreateIndex(
                name: "IX_ChungNhans_SinhVienId",
                table: "ChungNhans",
                column: "SinhVienId");

            migrationBuilder.CreateIndex(
                name: "IX_DoanPhis_SinhVienId",
                table: "DoanPhis",
                column: "SinhVienId");

            migrationBuilder.CreateIndex(
                name: "IX_SoDoans_SinhVienId",
                table: "SoDoans",
                column: "SinhVienId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_XepLoaiDoanViens_SinhVienId_NamHoc",
                table: "XepLoaiDoanViens",
                columns: new[] { "SinhVienId", "NamHoc" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChungNhans");

            migrationBuilder.DropTable(
                name: "DoanPhis");

            migrationBuilder.DropTable(
                name: "SoDoans");

            migrationBuilder.DropTable(
                name: "XepLoaiDoanViens");

            migrationBuilder.DropColumn(
                name: "ChucVuDoan",
                table: "SinhViens");

            migrationBuilder.DropColumn(
                name: "LaDoanVienUuTu",
                table: "SinhViens");

            migrationBuilder.DropColumn(
                name: "NgayVaoDoan",
                table: "SinhViens");

            migrationBuilder.DropColumn(
                name: "NoiVaoDoan",
                table: "SinhViens");

            migrationBuilder.DropColumn(
                name: "SoDoanVien",
                table: "SinhViens");

            migrationBuilder.DropColumn(
                name: "TrangThaiDoan",
                table: "SinhViens");

            migrationBuilder.DropColumn(
                name: "LoaiHoatDong",
                table: "HoatDongs");

            migrationBuilder.DropColumn(
                name: "SoLuongGioiHan",
                table: "HoatDongs");
        }
    }
}
