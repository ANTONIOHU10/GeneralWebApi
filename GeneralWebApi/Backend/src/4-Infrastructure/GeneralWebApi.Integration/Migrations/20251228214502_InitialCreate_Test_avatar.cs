using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GeneralWebApi.Integration.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate_Test_avatar : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Avatar",
                table: "Employees",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Avatar",
                table: "Employees");
        }
    }
}
