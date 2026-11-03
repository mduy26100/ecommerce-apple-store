using Application.Common.Interfaces.Reports;
using Application.Features.Sales.Reports.DTOs;

namespace Infrastructure.Reports.Services
{
    public class ClosedXmlOrderReportExportService : IExcelExportService
    {
        public byte[] ExportOrderReportToExcel(OrderReportExportData data)
        {
            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Báo Cáo Đơn Hàng");
            worksheet.ShowGridLines = true;

            worksheet.Column(1).Width = 8;
            worksheet.Column(2).Width = 18;
            worksheet.Column(3).Width = 18;
            worksheet.Column(4).Width = 24;
            worksheet.Column(5).Width = 15;
            worksheet.Column(6).Width = 26;
            worksheet.Column(7).Width = 16;
            worksheet.Column(8).Width = 16;
            worksheet.Column(9).Width = 18;
            worksheet.Column(10).Width = 18;
            worksheet.Column(11).Width = 26;
            worksheet.Column(12).Width = 34;
            worksheet.Column(13).Width = 16;
            worksheet.Column(14).Width = 22;
            worksheet.Column(15).Width = 18;
            worksheet.Column(16).Width = 12;
            worksheet.Column(17).Width = 20;
            worksheet.Column(18).Width = 18;
            worksheet.Column(19).Width = 18;
            worksheet.Column(20).Width = 16;
            worksheet.Column(21).Width = 16;
            worksheet.Column(22).Width = 22;
            worksheet.Column(23).Width = 34;
            worksheet.Column(24).Width = 20;

            worksheet.Range("A1:X1").Merge();
            var titleRow = worksheet.Row(1);
            titleRow.Height = 42;
            var titleCell = worksheet.Cell("A1");
            titleCell.Value = "BÁO CÁO THỐNG KÊ CHI TIẾT ĐƠN HÀNG - CỬA HÀNG URBAN STITCH";
            titleCell.Style.Font.Bold = true;
            titleCell.Style.Font.FontSize = 15;
            titleCell.Style.Font.FontColor = XLColor.White;
            titleCell.Style.Fill.BackgroundColor = XLColor.FromArgb(30, 58, 138);
            titleCell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
            titleCell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
            titleCell.Style.Alignment.Indent = 1;

            var fromDateStr = data.Filters.FromDate.HasValue ? data.Filters.FromDate.Value.ToString("dd/MM/yyyy") : "Toàn bộ";
            var toDateStr = data.Filters.ToDate.HasValue ? data.Filters.ToDate.Value.ToString("dd/MM/yyyy") : DateTime.UtcNow.ToString("dd/MM/yyyy");

            worksheet.Range("A2:X2").Merge();
            var row2 = worksheet.Row(2);
            row2.Height = 24;
            var cell2 = worksheet.Cell("A2");
            cell2.Value = $"Khoảng thời gian báo cáo: Từ ngày {fromDateStr} đến ngày {toDateStr}";
            cell2.Style.Font.FontSize = 10.5;
            cell2.Style.Font.FontColor = XLColor.FromArgb(51, 65, 85);
            cell2.Style.Fill.BackgroundColor = XLColor.FromArgb(248, 250, 252);
            cell2.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
            cell2.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
            cell2.Style.Alignment.Indent = 1;

            var dateCriteriaText = data.Filters.DateCriteria == "completed" ? "Theo ngày hoàn thành đơn" : "Theo ngày tạo đơn";
            var statusText = string.IsNullOrWhiteSpace(data.Filters.Status) ? "Tất cả trạng thái" : data.Filters.Status;
            var paymentStatusText = string.IsNullOrWhiteSpace(data.Filters.PaymentStatus) ? "Tất cả trạng thái thanh toán" : data.Filters.PaymentStatus;
            var paymentMethodText = string.IsNullOrWhiteSpace(data.Filters.PaymentMethod) ? "Tất cả phương thức" : data.Filters.PaymentMethod;

            worksheet.Range("A3:X3").Merge();
            var row3 = worksheet.Row(3);
            row3.Height = 24;
            var cell3 = worksheet.Cell("A3");
            cell3.Value = $"Tiêu chí lọc dữ liệu: {dateCriteriaText} | Trạng thái: {statusText} | Thanh toán: {paymentStatusText} | Phương thức: {paymentMethodText}";
            cell3.Style.Font.FontSize = 10.5;
            cell3.Style.Font.FontColor = XLColor.FromArgb(51, 65, 85);
            cell3.Style.Fill.BackgroundColor = XLColor.FromArgb(248, 250, 252);
            cell3.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
            cell3.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
            cell3.Style.Alignment.Indent = 1;

            worksheet.Range("A4:X4").Merge();
            var row4 = worksheet.Row(4);
            row4.Height = 28;
            var cell4 = worksheet.Cell("A4");
            cell4.Value = "CHÚ THÍCH PHÂN LOẠI DÒNG TIỀN: [1] Dòng tiền an toàn = Đơn Hoàn tất/Đã giao (Doanh thu thực thu, tiền đã về chắc chắn). [2] Dòng tiền đang luân chuyển = Đơn Chờ xử lý/Đóng gói/Đang giao (Tiền tạm giữ hoặc COD đang luân chuyển). [3] Dòng tiền tổn thất = Đơn Hủy/Trả hàng/Hoàn tiền (Doanh thu thất thoát). QUY ƯỚC DỮ LIỆU: Mỗi dòng là một sản phẩm trong đơn hàng.";
            cell4.Style.Font.FontSize = 9.5;
            cell4.Style.Font.Bold = true;
            cell4.Style.Font.FontColor = XLColor.FromArgb(133, 77, 14);
            cell4.Style.Fill.BackgroundColor = XLColor.FromArgb(254, 249, 195);
            cell4.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
            cell4.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
            cell4.Style.Alignment.Indent = 1;

            worksheet.Range("A5:X5").Merge();
            var row5 = worksheet.Row(5);
            row5.Height = 26;
            var cell5 = worksheet.Cell("A5");
            cell5.Value = $"Tổng quan số liệu: {data.Orders.Count} đơn hàng | Thực thu: {data.TotalNetRevenue:N0} VND | Doanh số gộp hiệu dụng: {data.NetGrossRevenue:N0} VND | Tổng phát sinh gộp: {data.TotalGrossRevenue:N0} VND | Giảm giá: {data.TotalDiscount:N0} VND | Xuất ngày: {DateTime.Now:HH:mm:ss dd/MM/yyyy}";
            cell5.Style.Font.FontSize = 10.5;
            cell5.Style.Font.Bold = true;
            cell5.Style.Font.FontColor = XLColor.FromArgb(15, 23, 42);
            cell5.Style.Fill.BackgroundColor = XLColor.FromArgb(241, 245, 249);
            cell5.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
            cell5.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
            cell5.Style.Alignment.Indent = 1;

            worksheet.Row(6).Height = 10;

            var headers = new[]
            {
                "STT",
                "MÃ ĐƠN HÀNG",
                "NGÀY ĐẶT",
                "HỌ TÊN KHÁCH HÀNG",
                "SỐ ĐIỆN THOẠI",
                "EMAIL LIÊN HỆ",
                "PHÂN LOẠI KHÁCH",
                "KÊNH THANH TOÁN",
                "TRẠNG THÁI THANH TOÁN",
                "TRẠNG THÁI ĐƠN HÀNG",
                "PHÂN LOẠI DÒNG TIỀN",
                "TÊN SẢN PHẨM",
                "MÃ SKU",
                "PHÂN LOẠI SẢN PHẨM",
                "ĐƠN GIÁ (VND)",
                "SỐ LƯỢNG",
                "THÀNH TIỀN MÓN (VND)",
                "TẠM TÍNH ĐƠN (VND)",
                "GIẢM GIÁ VOUCHER (VND)",
                "MÃ VOUCHER",
                "PHÍ GIAO HÀNG (VND)",
                "THỰC THU ĐƠN (VND)",
                "ĐỊA CHỈ GIAO HÀNG",
                "TỈNH / THÀNH PHỐ"
            };

            var headerRow = worksheet.Row(7);
            headerRow.Height = 38;
            for (var colIdx = 0; colIdx < headers.Length; colIdx++)
            {
                var cell = headerRow.Cell(colIdx + 1);
                cell.Value = headers[colIdx];
                cell.Style.Font.Bold = true;
                cell.Style.Font.FontSize = 10;
                cell.Style.Font.FontColor = XLColor.White;
                cell.Style.Fill.BackgroundColor = XLColor.FromArgb(15, 23, 42);
                cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                cell.Style.Alignment.WrapText = true;
                cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                cell.Style.Border.OutsideBorderColor = XLColor.FromArgb(203, 213, 225);
            }

            var currentRow = 8;
            var stt = 1;

            foreach (var order in data.Orders)
            {
                var cashflowType = "Dòng tiền đang luân chuyển";
                var cashflowColor = XLColor.FromArgb(29, 78, 216);
                var cashflowBg = XLColor.FromArgb(239, 246, 255);

                if (order.Status == "Completed" || order.Status == "Delivered")
                {
                    cashflowType = "Dòng tiền an toàn";
                    cashflowColor = XLColor.FromArgb(21, 128, 61);
                    cashflowBg = XLColor.FromArgb(240, 253, 244);
                }
                else if (order.Status == "Cancelled" || order.Status == "Returned" || order.PaymentStatus == "Refunded")
                {
                    cashflowType = "Dòng tiền tổn thất";
                    cashflowColor = XLColor.FromArgb(185, 28, 28);
                    cashflowBg = XLColor.FromArgb(254, 242, 242);
                }

                var items = order.Items != null && order.Items.Count > 0
                    ? order.Items
                    : new List<OrderReportItemDto>
                    {
                        new()
                        {
                            ProductName = "Đơn hàng tổng hợp",
                            Sku = "N/A",
                            Quantity = order.TotalItems > 0 ? order.TotalItems : 1,
                            UnitPrice = order.TotalAmount,
                            LineTotal = order.TotalAmount
                        }
                    };

                foreach (var item in items)
                {
                    var isEven = (stt % 2 == 0);
                    var rowBg = isEven ? XLColor.FromArgb(248, 250, 252) : XLColor.White;
                    var row = worksheet.Row(currentRow);
                    row.Height = 25;

                    var variantDetails = string.Join(" / ", new[] { item.ColorName, item.StorageName, item.VariantName }.Where(s => !string.IsNullOrWhiteSpace(s)));
                    if (string.IsNullOrWhiteSpace(variantDetails))
                    {
                        variantDetails = "Tiêu chuẩn";
                    }

                    row.Cell(1).Value = stt;
                    row.Cell(1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                    row.Cell(2).SetValue(order.OrderNumber);
                    row.Cell(2).Style.Font.Bold = true;
                    row.Cell(2).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                    row.Cell(3).Value = order.PlacedAt.ToString("dd/MM/yyyy HH:mm");
                    row.Cell(3).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                    row.Cell(4).Value = order.RecipientName;
                    row.Cell(4).Style.Font.Bold = true;

                    row.Cell(5).SetValue(order.RecipientPhone);
                    row.Cell(5).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                    row.Cell(6).Value = order.RecipientEmail ?? "—";

                    row.Cell(7).Value = order.CustomerType;
                    row.Cell(7).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                    row.Cell(8).Value = order.PaymentMethodName;
                    row.Cell(8).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                    row.Cell(9).Value = order.PaymentStatusName;
                    row.Cell(9).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                    row.Cell(10).Value = order.StatusName;
                    row.Cell(10).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                    var cashflowCell = row.Cell(11);
                    cashflowCell.Value = cashflowType;
                    cashflowCell.Style.Font.Bold = true;
                    cashflowCell.Style.Font.FontColor = cashflowColor;
                    cashflowCell.Style.Fill.BackgroundColor = cashflowBg;
                    cashflowCell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                    row.Cell(12).Value = item.ProductName;
                    row.Cell(13).SetValue(item.Sku);
                    row.Cell(13).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                    row.Cell(14).Value = variantDetails;

                    row.Cell(15).Value = item.UnitPrice;
                    row.Cell(15).Style.NumberFormat.Format = "#,##0";
                    row.Cell(15).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;

                    row.Cell(16).Value = item.Quantity;
                    row.Cell(16).Style.Font.Bold = true;
                    row.Cell(16).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                    row.Cell(17).Value = item.LineTotal;
                    row.Cell(17).Style.NumberFormat.Format = "#,##0";
                    row.Cell(17).Style.Font.Bold = true;
                    row.Cell(17).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;

                    row.Cell(18).Value = order.Subtotal;
                    row.Cell(18).Style.NumberFormat.Format = "#,##0";
                    row.Cell(18).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;

                    row.Cell(19).Value = order.DiscountAmount;
                    row.Cell(19).Style.NumberFormat.Format = "#,##0";
                    row.Cell(19).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;

                    row.Cell(20).Value = order.VoucherCode ?? "—";
                    row.Cell(20).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                    row.Cell(21).Value = order.ShippingFee;
                    row.Cell(21).Style.NumberFormat.Format = "#,##0";
                    row.Cell(21).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;

                    var netCell = row.Cell(22);
                    netCell.Value = order.TotalAmount;
                    netCell.Style.NumberFormat.Format = "#,##0";
                    netCell.Style.Font.Bold = true;
                    netCell.Style.Font.FontColor = XLColor.FromArgb(21, 128, 61);
                    netCell.Style.Fill.BackgroundColor = XLColor.FromArgb(240, 253, 244);
                    netCell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;

                    row.Cell(23).Value = order.ShippingAddressLine;
                    row.Cell(24).Value = order.ShippingProvince;

                    for (var c = 1; c <= headers.Length; c++)
                    {
                        var cell = row.Cell(c);
                        cell.Style.Font.FontSize = 10;
                        cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                        cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                        cell.Style.Border.OutsideBorderColor = XLColor.FromArgb(226, 232, 240);

                        if (c != 11 && c != 22)
                        {
                            cell.Style.Fill.BackgroundColor = rowBg;
                        }
                    }

                    currentRow++;
                    stt++;
                }
            }

            using var memoryStream = new MemoryStream();
            workbook.SaveAs(memoryStream);
            return memoryStream.ToArray();
        }
    }
}

