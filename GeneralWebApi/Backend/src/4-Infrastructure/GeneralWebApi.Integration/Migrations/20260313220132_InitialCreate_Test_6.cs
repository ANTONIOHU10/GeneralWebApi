using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GeneralWebApi.Integration.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate_Test_6 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Contracts_RenewalReminderDate",
                table: "Contracts",
                column: "RenewalReminderDate");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Contracts_RenewalReminderDate",
                table: "Contracts");
        }
    }
}
