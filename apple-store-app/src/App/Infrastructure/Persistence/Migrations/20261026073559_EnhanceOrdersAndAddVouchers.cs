using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class EnhanceOrdersAndAddVouchers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "CostPrice",
                schema: "catalog",
                table: "ProductVariants",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                schema: "sales",
                table: "Orders",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<DateTimeOffset>(
                name: "PlacedAt",
                schema: "sales",
                table: "Orders",
                type: "datetimeoffset",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AddColumn<decimal>(
                name: "DiscountAmount",
                schema: "sales",
                table: "Orders",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "GuestId",
                schema: "sales",
                table: "Orders",
                type: "varchar(100)",
                unicode: false,
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RecipientEmail",
                schema: "sales",
                table: "Orders",
                type: "varchar(150)",
                unicode: false,
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                schema: "sales",
                table: "Orders",
                type: "rowversion",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<string>(
                name: "VoucherCode",
                schema: "sales",
                table: "Orders",
                type: "varchar(50)",
                unicode: false,
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "VoucherId",
                schema: "sales",
                table: "Orders",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "CostPrice",
                schema: "sales",
                table: "OrderItems",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "SelectedAttributesJson",
                schema: "sales",
                table: "OrderItems",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ThumbnailUrl",
                schema: "sales",
                table: "OrderItems",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VariantName",
                schema: "sales",
                table: "OrderItems",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Vouchers",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DiscountType = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: false),
                    DiscountValue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    MinOrderAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    MaxDiscountAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    StartDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    EndDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UsageLimit = table.Column<int>(type: "int", nullable: true),
                    UsageCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    PerUserLimit = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
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
                    table.PrimaryKey("PK_Vouchers", x => x.Id);
                    table.CheckConstraint("CK_Vouchers_DiscountValue", "[DiscountValue] > 0");
                    table.CheckConstraint("CK_Vouchers_PerUserLimit", "[PerUserLimit] > 0");
                    table.CheckConstraint("CK_Vouchers_UsageCount", "[UsageCount] >= 0");
                });

            migrationBuilder.CreateTable(
                name: "VoucherUsages",
                schema: "sales",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VoucherId = table.Column<int>(type: "int", nullable: false),
                    OrderId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    GuestId = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: true),
                    CustomerPhone = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true),
                    CustomerEmail = table.Column<string>(type: "varchar(150)", unicode: false, maxLength: 150, nullable: true),
                    DiscountAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    UsedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
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
                    table.PrimaryKey("PK_VoucherUsages", x => x.Id);
                    table.CheckConstraint("CK_VoucherUsages_DiscountAmount", "[DiscountAmount] >= 0");
                    table.ForeignKey(
                        name: "FK_VoucherUsages_Orders_OrderId",
                        column: x => x.OrderId,
                        principalSchema: "sales",
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_VoucherUsages_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VoucherUsages_Vouchers_VoucherId",
                        column: x => x.VoucherId,
                        principalSchema: "sales",
                        principalTable: "Vouchers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Orders_GuestId",
                schema: "sales",
                table: "Orders",
                column: "GuestId");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_VoucherId",
                schema: "sales",
                table: "Orders",
                column: "VoucherId");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Orders_DiscountAmount",
                schema: "sales",
                table: "Orders",
                sql: "[DiscountAmount] >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Orders_ShippingFee",
                schema: "sales",
                table: "Orders",
                sql: "[ShippingFee] >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Orders_Subtotal",
                schema: "sales",
                table: "Orders",
                sql: "[Subtotal] >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Orders_TotalAmount",
                schema: "sales",
                table: "Orders",
                sql: "[TotalAmount] >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_OrderItems_CostPrice",
                schema: "sales",
                table: "OrderItems",
                sql: "[CostPrice] >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_OrderItems_LineTotal",
                schema: "sales",
                table: "OrderItems",
                sql: "[LineTotal] >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_OrderItems_Quantity",
                schema: "sales",
                table: "OrderItems",
                sql: "[Quantity] > 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_OrderItems_UnitPrice",
                schema: "sales",
                table: "OrderItems",
                sql: "[UnitPrice] >= 0");

            migrationBuilder.CreateIndex(
                name: "IX_Vouchers_Code",
                schema: "sales",
                table: "Vouchers",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Vouchers_EndDate",
                schema: "sales",
                table: "Vouchers",
                column: "EndDate");

            migrationBuilder.CreateIndex(
                name: "IX_Vouchers_StartDate",
                schema: "sales",
                table: "Vouchers",
                column: "StartDate");

            migrationBuilder.CreateIndex(
                name: "IX_VoucherUsages_GuestId",
                schema: "sales",
                table: "VoucherUsages",
                column: "GuestId");

            migrationBuilder.CreateIndex(
                name: "IX_VoucherUsages_OrderId",
                schema: "sales",
                table: "VoucherUsages",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_VoucherUsages_UserId",
                schema: "sales",
                table: "VoucherUsages",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_VoucherUsages_VoucherId",
                schema: "sales",
                table: "VoucherUsages",
                column: "VoucherId");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Vouchers_VoucherId",
                schema: "sales",
                table: "Orders",
                column: "VoucherId",
                principalSchema: "sales",
                principalTable: "Vouchers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Vouchers_VoucherId",
                schema: "sales",
                table: "Orders");

            migrationBuilder.DropTable(
                name: "VoucherUsages",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "Vouchers",
                schema: "sales");

            migrationBuilder.DropIndex(
                name: "IX_Orders_GuestId",
                schema: "sales",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_VoucherId",
                schema: "sales",
                table: "Orders");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Orders_DiscountAmount",
                schema: "sales",
                table: "Orders");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Orders_ShippingFee",
                schema: "sales",
                table: "Orders");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Orders_Subtotal",
                schema: "sales",
                table: "Orders");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Orders_TotalAmount",
                schema: "sales",
                table: "Orders");

            migrationBuilder.DropCheckConstraint(
                name: "CK_OrderItems_CostPrice",
                schema: "sales",
                table: "OrderItems");

            migrationBuilder.DropCheckConstraint(
                name: "CK_OrderItems_LineTotal",
                schema: "sales",
                table: "OrderItems");

            migrationBuilder.DropCheckConstraint(
                name: "CK_OrderItems_Quantity",
                schema: "sales",
                table: "OrderItems");

            migrationBuilder.DropCheckConstraint(
                name: "CK_OrderItems_UnitPrice",
                schema: "sales",
                table: "OrderItems");

            migrationBuilder.DropColumn(
                name: "CostPrice",
                schema: "catalog",
                table: "ProductVariants");

            migrationBuilder.DropColumn(
                name: "DiscountAmount",
                schema: "sales",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "GuestId",
                schema: "sales",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "RecipientEmail",
                schema: "sales",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "sales",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "VoucherCode",
                schema: "sales",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "VoucherId",
                schema: "sales",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "CostPrice",
                schema: "sales",
                table: "OrderItems");

            migrationBuilder.DropColumn(
                name: "SelectedAttributesJson",
                schema: "sales",
                table: "OrderItems");

            migrationBuilder.DropColumn(
                name: "ThumbnailUrl",
                schema: "sales",
                table: "OrderItems");

            migrationBuilder.DropColumn(
                name: "VariantName",
                schema: "sales",
                table: "OrderItems");

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                schema: "sales",
                table: "Orders",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "PlacedAt",
                schema: "sales",
                table: "Orders",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTimeOffset),
                oldType: "datetimeoffset");
        }
    }
}
