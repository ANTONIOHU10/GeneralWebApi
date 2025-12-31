using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GeneralWebApi.Integration.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate_Test_2_5 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Employees_DepartmentId_IsManager",
                table: "Employees");

            migrationBuilder.AddColumn<string>(
                name: "ManagerRole",
                table: "Employees",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "None");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_ManagerRole",
                table: "Employees",
                column: "ManagerRole");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Employees_ManagerRole",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "ManagerRole",
                table: "Employees");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_DepartmentId_IsManager",
                table: "Employees",
                columns: new[] { "DepartmentId", "IsManager" },
                unique: true,
                filter: "IsManager = 1");
        }
    }
}
