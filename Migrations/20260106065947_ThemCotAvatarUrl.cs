using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DoanVienAPI.Migrations
{
    /// <inheritdoc />
    public partial class ThemCotAvatarUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AvatarUrl",
                table: "SinhViens",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AvatarUrl",
                table: "SinhViens");
        }
    }
}
