using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DoanVienAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddImageUrl_Fix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "HoatDongs",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "HoatDongs");
        }
    }
}
