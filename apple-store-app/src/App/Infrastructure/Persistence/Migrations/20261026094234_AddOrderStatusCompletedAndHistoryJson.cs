using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    public partial class AddOrderStatusCompletedAndHistoryJson : Migration
    {
            protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "StatusHistoryJson",
                schema: "sales",
                table: "Orders",
                type: "nvarchar(max)",
                nullable: true);
        }

            protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StatusHistoryJson",
                schema: "sales",
                table: "Orders");
        }
    }
}
