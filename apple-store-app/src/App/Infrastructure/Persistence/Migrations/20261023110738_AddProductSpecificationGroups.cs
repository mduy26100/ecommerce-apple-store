using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    public partial class AddProductSpecificationGroups : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductSpecifications_ProductVariants_ProductVariantId",
                schema: "catalog",
                table: "ProductSpecifications");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductSpecifications_Products_ProductId",
                schema: "catalog",
                table: "ProductSpecifications");

            migrationBuilder.DropIndex(
                name: "IX_ProductSpecifications_ProductVariantId",
                schema: "catalog",
                table: "ProductSpecifications");

            migrationBuilder.DropColumn(
                name: "GroupName",
                schema: "catalog",
                table: "ProductSpecifications");

            migrationBuilder.DropColumn(
                name: "ProductVariantId",
                schema: "catalog",
                table: "ProductSpecifications");

            migrationBuilder.RenameColumn(
                name: "ProductId",
                schema: "catalog",
                table: "ProductSpecifications",
                newName: "GroupId");

            migrationBuilder.RenameIndex(
                name: "IX_ProductSpecifications_ProductId",
                schema: "catalog",
                table: "ProductSpecifications",
                newName: "IX_ProductSpecifications_GroupId");

            migrationBuilder.CreateTable(
                name: "ProductSpecificationGroups",
                schema: "catalog",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    DeletedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductSpecificationGroups", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductSpecificationGroups_Products_ProductId",
                        column: x => x.ProductId,
                        principalSchema: "catalog",
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProductSpecificationGroups_ProductId",
                schema: "catalog",
                table: "ProductSpecificationGroups",
                column: "ProductId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductSpecifications_ProductSpecificationGroups_GroupId",
                schema: "catalog",
                table: "ProductSpecifications",
                column: "GroupId",
                principalSchema: "catalog",
                principalTable: "ProductSpecificationGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductSpecifications_ProductSpecificationGroups_GroupId",
                schema: "catalog",
                table: "ProductSpecifications");

            migrationBuilder.DropTable(
                name: "ProductSpecificationGroups",
                schema: "catalog");

            migrationBuilder.RenameColumn(
                name: "GroupId",
                schema: "catalog",
                table: "ProductSpecifications",
                newName: "ProductId");

            migrationBuilder.RenameIndex(
                name: "IX_ProductSpecifications_GroupId",
                schema: "catalog",
                table: "ProductSpecifications",
                newName: "IX_ProductSpecifications_ProductId");

            migrationBuilder.AddColumn<string>(
                name: "GroupName",
                schema: "catalog",
                table: "ProductSpecifications",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ProductVariantId",
                schema: "catalog",
                table: "ProductSpecifications",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductSpecifications_ProductVariantId",
                schema: "catalog",
                table: "ProductSpecifications",
                column: "ProductVariantId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductSpecifications_ProductVariants_ProductVariantId",
                schema: "catalog",
                table: "ProductSpecifications",
                column: "ProductVariantId",
                principalSchema: "catalog",
                principalTable: "ProductVariants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductSpecifications_Products_ProductId",
                schema: "catalog",
                table: "ProductSpecifications",
                column: "ProductId",
                principalSchema: "catalog",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
