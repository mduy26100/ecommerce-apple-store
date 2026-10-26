using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class OptimizeCartAndSupportGuestCart : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Carts_UserId_Status",
                schema: "sales",
                table: "Carts");

            migrationBuilder.DropIndex(
                name: "IX_CartItems_CartId_ProductVariantId",
                schema: "sales",
                table: "CartItems");

            migrationBuilder.DropColumn(
                name: "Status",
                schema: "sales",
                table: "Carts");

            migrationBuilder.AlterColumn<string>(
                name: "ImageUrl",
                schema: "catalog",
                table: "ProductImages",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(1000)",
                oldMaxLength: 1000);

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                schema: "sales",
                table: "Carts",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "ExpiresOn",
                schema: "sales",
                table: "Carts",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GuestId",
                schema: "sales",
                table: "Carts",
                type: "varchar(100)",
                unicode: false,
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsSelected",
                schema: "sales",
                table: "CartItems",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<decimal>(
                name: "UnitPrice",
                schema: "sales",
                table: "CartItems",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateIndex(
                name: "IX_Carts_GuestId",
                schema: "sales",
                table: "Carts",
                column: "GuestId",
                unique: true,
                filter: "[GuestId] IS NOT NULL AND [IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_Carts_UserId",
                schema: "sales",
                table: "Carts",
                column: "UserId",
                unique: true,
                filter: "[UserId] IS NOT NULL AND [IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_CartId_ProductVariantId",
                schema: "sales",
                table: "CartItems",
                columns: new[] { "CartId", "ProductVariantId" },
                unique: true,
                filter: "[IsDeleted] = 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_CartItems_Quantity",
                schema: "sales",
                table: "CartItems",
                sql: "[Quantity] > 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Carts_GuestId",
                schema: "sales",
                table: "Carts");

            migrationBuilder.DropIndex(
                name: "IX_Carts_UserId",
                schema: "sales",
                table: "Carts");

            migrationBuilder.DropIndex(
                name: "IX_CartItems_CartId_ProductVariantId",
                schema: "sales",
                table: "CartItems");

            migrationBuilder.DropCheckConstraint(
                name: "CK_CartItems_Quantity",
                schema: "sales",
                table: "CartItems");

            migrationBuilder.DropColumn(
                name: "ExpiresOn",
                schema: "sales",
                table: "Carts");

            migrationBuilder.DropColumn(
                name: "GuestId",
                schema: "sales",
                table: "Carts");

            migrationBuilder.DropColumn(
                name: "IsSelected",
                schema: "sales",
                table: "CartItems");

            migrationBuilder.DropColumn(
                name: "UnitPrice",
                schema: "sales",
                table: "CartItems");

            migrationBuilder.AlterColumn<string>(
                name: "ImageUrl",
                schema: "catalog",
                table: "ProductImages",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                schema: "sales",
                table: "Carts",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                schema: "sales",
                table: "Carts",
                type: "varchar(20)",
                unicode: false,
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Carts_UserId_Status",
                schema: "sales",
                table: "Carts",
                columns: new[] { "UserId", "Status" },
                unique: true,
                filter: "[Status] = 'Active'");

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_CartId_ProductVariantId",
                schema: "sales",
                table: "CartItems",
                columns: new[] { "CartId", "ProductVariantId" },
                unique: true);
        }
    }
}
