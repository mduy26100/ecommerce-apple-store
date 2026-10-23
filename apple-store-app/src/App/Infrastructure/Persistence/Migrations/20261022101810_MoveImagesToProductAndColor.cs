using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class MoveImagesToProductAndColor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProductImages",
                schema: "catalog",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    OptionValueId = table.Column<int>(type: "int", nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    AltText = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
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
                    table.PrimaryKey("PK_ProductImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductImages_ProductOptionValues_OptionValueId",
                        column: x => x.OptionValueId,
                        principalSchema: "catalog",
                        principalTable: "ProductOptionValues",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProductImages_Products_ProductId",
                        column: x => x.ProductId,
                        principalSchema: "catalog",
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProductImages_OptionValueId",
                schema: "catalog",
                table: "ProductImages",
                column: "OptionValueId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductImages_ProductId",
                schema: "catalog",
                table: "ProductImages",
                column: "ProductId");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.tables WHERE name = 'VariantImages' AND schema_id = SCHEMA_ID('catalog'))
                BEGIN
                    INSERT INTO [catalog].[ProductImages] 
                        ([ProductId], [OptionValueId], [ImageUrl], [AltText], [DisplayOrder], [IsPrimary], [IsActive], [CreatedOn], [CreatedBy], [LastModifiedOn], [LastModifiedBy], [IsDeleted], [DeletedOn], [DeletedBy])
                    SELECT DISTINCT
                        v.[ProductId],
                        ov.[Id] AS [OptionValueId],
                        vi.[ImageUrl],
                        vi.[AltText],
                        vi.[DisplayOrder],
                        vi.[IsPrimary],
                        vi.[IsActive],
                        vi.[CreatedOn],
                        vi.[CreatedBy],
                        vi.[LastModifiedOn],
                        vi.[LastModifiedBy],
                        vi.[IsDeleted],
                        vi.[DeletedOn],
                        vi.[DeletedBy]
                    FROM [catalog].[VariantImages] vi
                    JOIN [catalog].[ProductVariants] v ON vi.[ProductVariantId] = v.[Id]
                    LEFT JOIN (
                        SELECT pvv.[VariantId], pov.[Id]
                        FROM [catalog].[ProductVariantValues] pvv
                        JOIN [catalog].[ProductOptionValues] pov ON pvv.[OptionValueId] = pov.[Id]
                        JOIN [catalog].[ProductOptions] po ON pov.[OptionId] = po.[Id]
                        WHERE po.[Name] LIKE N'%Màu%' OR po.[Name] LIKE N'%Color%'
                    ) ov ON v.[Id] = ov.[VariantId];
                END
            ");

            migrationBuilder.DropTable(
                name: "VariantImages",
                schema: "catalog");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProductImages",
                schema: "catalog");

            migrationBuilder.CreateTable(
                name: "VariantImages",
                schema: "catalog",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductVariantId = table.Column<int>(type: "int", nullable: false),
                    AltText = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    DeletedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    ImageUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    LastModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VariantImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VariantImages_ProductVariants_ProductVariantId",
                        column: x => x.ProductVariantId,
                        principalSchema: "catalog",
                        principalTable: "ProductVariants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_VariantImages_ProductVariantId",
                schema: "catalog",
                table: "VariantImages",
                column: "ProductVariantId");

            migrationBuilder.CreateIndex(
                name: "IX_VariantImages_ProductVariantId_IsPrimary",
                schema: "catalog",
                table: "VariantImages",
                columns: new[] { "ProductVariantId", "IsPrimary" },
                unique: true,
                filter: "[IsPrimary] = 1 AND [IsDeleted] = 0");
        }
    }
}
