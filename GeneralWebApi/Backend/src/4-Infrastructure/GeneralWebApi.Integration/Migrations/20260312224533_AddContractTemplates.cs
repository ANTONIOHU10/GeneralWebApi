using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GeneralWebApi.Integration.Migrations
{
    /// <inheritdoc />
    public partial class AddContractTemplates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ContractTemplates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    ContractType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TemplateContent = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Variables = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    UsageCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    Tags = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    LegalRequirements = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ApprovalWorkflow = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ParentTemplateId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Version = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContractTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContractTemplates_ContractTemplates_ParentTemplateId",
                        column: x => x.ParentTemplateId,
                        principalTable: "ContractTemplates",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ContractTemplates_Category",
                table: "ContractTemplates",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_ContractTemplates_ContractType",
                table: "ContractTemplates",
                column: "ContractType");

            migrationBuilder.CreateIndex(
                name: "IX_ContractTemplates_CreatedAt",
                table: "ContractTemplates",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_ContractTemplates_IsActive_IsDeleted",
                table: "ContractTemplates",
                columns: new[] { "IsActive", "IsDeleted" });

            migrationBuilder.CreateIndex(
                name: "IX_ContractTemplates_IsDefault",
                table: "ContractTemplates",
                column: "IsDefault");

            migrationBuilder.CreateIndex(
                name: "IX_ContractTemplates_Name",
                table: "ContractTemplates",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_ContractTemplates_ParentTemplateId",
                table: "ContractTemplates",
                column: "ParentTemplateId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContractTemplates");
        }
    }
}
