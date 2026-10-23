using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddDynamicProductOptions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductVariants_Colors_ColorId",
                schema: "catalog",
                table: "ProductVariants");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductVariants_StorageOptions_StorageOptionId",
                schema: "catalog",
                table: "ProductVariants");

            migrationBuilder.DropIndex(
                name: "IX_VariantImages_ProductVariantId_IsPrimary",
                schema: "catalog",
                table: "VariantImages");

            migrationBuilder.CreateTable(
                name: "ProductOptions",
                schema: "catalog",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
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
                    table.PrimaryKey("PK_ProductOptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductOptions_Products_ProductId",
                        column: x => x.ProductId,
                        principalSchema: "catalog",
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductOptionValues",
                schema: "catalog",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OptionId = table.Column<int>(type: "int", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    ColorHexCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
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
                    table.PrimaryKey("PK_ProductOptionValues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductOptionValues_ProductOptions_OptionId",
                        column: x => x.OptionId,
                        principalSchema: "catalog",
                        principalTable: "ProductOptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductVariantValues",
                schema: "catalog",
                columns: table => new
                {
                    VariantId = table.Column<int>(type: "int", nullable: false),
                    OptionValueId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductVariantValues", x => new { x.VariantId, x.OptionValueId });
                    table.ForeignKey(
                        name: "FK_ProductVariantValues_ProductOptionValues_OptionValueId",
                        column: x => x.OptionValueId,
                        principalSchema: "catalog",
                        principalTable: "ProductOptionValues",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProductVariantValues_ProductVariants_VariantId",
                        column: x => x.VariantId,
                        principalSchema: "catalog",
                        principalTable: "ProductVariants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_VariantImages_ProductVariantId_IsPrimary",
                schema: "catalog",
                table: "VariantImages",
                columns: new[] { "ProductVariantId", "IsPrimary" },
                unique: true,
                filter: "[IsPrimary] = 1 AND [IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_ProductOptions_ProductId",
                schema: "catalog",
                table: "ProductOptions",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductOptionValues_OptionId",
                schema: "catalog",
                table: "ProductOptionValues",
                column: "OptionId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductVariantValues_OptionValueId",
                schema: "catalog",
                table: "ProductVariantValues",
                column: "OptionValueId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductVariantValues_VariantId",
                schema: "catalog",
                table: "ProductVariantValues",
                column: "VariantId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductVariants_Colors_ColorId",
                schema: "catalog",
                table: "ProductVariants",
                column: "ColorId",
                principalSchema: "catalog",
                principalTable: "Colors",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductVariants_StorageOptions_StorageOptionId",
                schema: "catalog",
                table: "ProductVariants",
                column: "StorageOptionId",
                principalSchema: "catalog",
                principalTable: "StorageOptions",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductVariants_Colors_ColorId",
                schema: "catalog",
                table: "ProductVariants");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductVariants_StorageOptions_StorageOptionId",
                schema: "catalog",
                table: "ProductVariants");

            migrationBuilder.DropTable(
                name: "ProductVariantValues",
                schema: "catalog");

            migrationBuilder.DropTable(
                name: "ProductOptionValues",
                schema: "catalog");

            migrationBuilder.DropTable(
                name: "ProductOptions",
                schema: "catalog");

            migrationBuilder.DropIndex(
                name: "IX_VariantImages_ProductVariantId_IsPrimary",
                schema: "catalog",
                table: "VariantImages");

            migrationBuilder.CreateIndex(
                name: "IX_VariantImages_ProductVariantId_IsPrimary",
                schema: "catalog",
                table: "VariantImages",
                columns: new[] { "ProductVariantId", "IsPrimary" },
                unique: true,
                filter: "[IsPrimary] = 1");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductVariants_Colors_ColorId",
                schema: "catalog",
                table: "ProductVariants",
                column: "ColorId",
                principalSchema: "catalog",
                principalTable: "Colors",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductVariants_StorageOptions_StorageOptionId",
                schema: "catalog",
                table: "ProductVariants",
                column: "StorageOptionId",
                principalSchema: "catalog",
                principalTable: "StorageOptions",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
