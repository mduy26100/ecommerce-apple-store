import ExcelJS from "exceljs";
import dayjs from "dayjs";
import type { OrderReportDetail, OrderReportFilterParams } from "../types/order-report.types";

export interface ExportReportOptions {
  orders: OrderReportDetail[];
  filters: OrderReportFilterParams;
}

export const exportOrdersToExcel = async ({ orders, filters }: ExportReportOptions): Promise<string> => {
  const fromDateFormatted = filters.fromDate ? dayjs(filters.fromDate).format("DD/MM/YYYY") : "Toàn bộ";
  const toDateFormatted = filters.toDate ? dayjs(filters.toDate).format("DD/MM/YYYY") : dayjs().format("DD/MM/YYYY");
  const fromDateFile = filters.fromDate ? dayjs(filters.fromDate).format("DD-MM-YYYY") : "Toan_Bo";
  const toDateFile = filters.toDate ? dayjs(filters.toDate).format("DD-MM-YYYY") : dayjs().format("DD-MM-YYYY");

  const dateCriteriaText = filters.dateCriteria === "completed" ? "Theo ngày hoàn thành đơn" : "Theo ngày tạo đơn";
  const statusText = filters.status || "Tất cả trạng thái";
  const paymentStatusText = filters.paymentStatus || "Tất cả trạng thái thanh toán";
  const paymentMethodText = filters.paymentMethod || "Tất cả phương thức";

  const totalGross = orders.reduce((sum, o) => sum + (o.subtotal || o.totalAmount || 0), 0);
  const totalNet = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalDiscount = orders.reduce((sum, o) => sum + (o.discountAmount || 0), 0);
  const formatVnd = (num: number) => new Intl.NumberFormat("vi-VN").format(num);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Urban Stitch System";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Báo Cáo Đơn Hàng", {
    views: [{ showGridLines: true }],
  });

  worksheet.columns = [
    { width: 8 },
    { width: 18 },
    { width: 26 },
    { width: 16 },
    { width: 28 },
    { width: 18 },
    { width: 20 },
    { width: 36 },
    { width: 20 },
    { width: 20 },
    { width: 12 },
    { width: 20 },
    { width: 18 },
    { width: 16 },
    { width: 22 },
    { width: 24 },
    { width: 24 },
    { width: 22 },
  ];

  worksheet.mergeCells("A1:R1");
  const titleRow = worksheet.getRow(1);
  titleRow.height = 42;
  const titleCell = worksheet.getCell("A1");
  titleCell.value = "BÁO CÁO THỐNG KÊ CHI TIẾT ĐƠN HÀNG - CỬA HÀNG URBAN STITCH";
  titleCell.font = { name: "Segoe UI", size: 15, bold: true, color: { argb: "FFFFFFFF" } };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } };
  titleCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };

  worksheet.mergeCells("A2:R2");
  const timeRow = worksheet.getRow(2);
  timeRow.height = 24;
  const timeCell = worksheet.getCell("A2");
  timeCell.value = `Khoảng thời gian báo cáo: Từ ngày ${fromDateFormatted} đến ngày ${toDateFormatted}`;
  timeCell.font = { name: "Segoe UI", size: 10.5, color: { argb: "FF334155" } };
  timeCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
  timeCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };

  worksheet.mergeCells("A3:R3");
  const filterRow = worksheet.getRow(3);
  filterRow.height = 24;
  const filterCell = worksheet.getCell("A3");
  filterCell.value = `Tiêu chí lọc: ${dateCriteriaText} | Trạng thái: ${statusText} | Thanh toán: ${paymentStatusText} | Phương thức: ${paymentMethodText}`;
  filterCell.font = { name: "Segoe UI", size: 10.5, color: { argb: "FF334155" } };
  filterCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
  filterCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };

  worksheet.mergeCells("A4:R4");
  const summaryRow = worksheet.getRow(4);
  summaryRow.height = 26;
  const summaryCell = worksheet.getCell("A4");
  summaryCell.value = `Tổng quan số liệu: ${orders.length} đơn hàng | Doanh số gộp: ${formatVnd(totalGross)} VND | Giảm giá: ${formatVnd(totalDiscount)} VND | Thực thu: ${formatVnd(totalNet)} VND | Xuất ngày: ${dayjs().format("HH:mm:ss DD/MM/YYYY")}`;
  summaryCell.font = { name: "Segoe UI", size: 10.5, bold: true, color: { argb: "FF0F172A" } };
  summaryCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
  summaryCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };

  worksheet.getRow(5).height = 10;

  const headers = [
    "STT",
    "MÃ ĐƠN HÀNG",
    "HỌ TÊN KHÁCH HÀNG",
    "SỐ ĐIỆN THOẠI",
    "EMAIL LIÊN HỆ",
    "PHÂN LOẠI KHÁCH",
    "TỈNH / THÀNH PHỐ",
    "ĐỊA CHỈ GIAO HÀNG",
    "THỜI GIAN ĐẶT HÀNG",
    "THỜI GIAN HOÀN THÀNH",
    "SỐ LƯỢNG",
    "TẠM TÍNH (VND)",
    "GIẢM GIÁ (VND)",
    "MÃ VOUCHER",
    "THỰC THU (VND)",
    "PHƯƠNG THỨC THANH TOÁN",
    "TRẠNG THÁI THANH TOÁN",
    "TRẠNG THÁI ĐƠN HÀNG",
  ];

  const headerRow = worksheet.getRow(6);
  headerRow.height = 38;
  headers.forEach((headerText, colIdx) => {
    const cell = headerRow.getCell(colIdx + 1);
    cell.value = headerText;
    cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: "FF334155" } },
      left: { style: "thin", color: { argb: "FF334155" } },
      bottom: { style: "medium", color: { argb: "FF0F172A" } },
      right: { style: "thin", color: { argb: "FF334155" } },
    };
  });

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: "thin", color: { argb: "FFE2E8F0" } },
    left: { style: "thin", color: { argb: "FFE2E8F0" } },
    bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
    right: { style: "thin", color: { argb: "FFE2E8F0" } },
  };

  orders.forEach((order, index) => {
    const rowNumber = 7 + index;
    const dataRow = worksheet.getRow(rowNumber);
    dataRow.height = 25;
    const isEven = index % 2 === 0;
    const rowBgColor = isEven ? "FFFFFFFF" : "FFF8FAFC";

    dataRow.getCell(1).value = index + 1;
    dataRow.getCell(1).alignment = { vertical: "middle", horizontal: "center" };

    dataRow.getCell(2).value = order.orderNumber;
    dataRow.getCell(2).font = { bold: true };
    dataRow.getCell(2).alignment = { vertical: "middle", horizontal: "center" };

    dataRow.getCell(3).value = order.recipientName;
    dataRow.getCell(3).font = { bold: true };
    dataRow.getCell(3).alignment = { vertical: "middle", horizontal: "left" };

    dataRow.getCell(4).value = order.recipientPhone;
    dataRow.getCell(4).alignment = { vertical: "middle", horizontal: "center" };

    dataRow.getCell(5).value = order.recipientEmail || "—";
    dataRow.getCell(5).alignment = { vertical: "middle", horizontal: "left" };

    dataRow.getCell(6).value = order.customerType;
    dataRow.getCell(6).alignment = { vertical: "middle", horizontal: "center" };

    dataRow.getCell(7).value = order.shippingProvince;
    dataRow.getCell(7).alignment = { vertical: "middle", horizontal: "left" };

    dataRow.getCell(8).value = order.shippingAddressLine;
    dataRow.getCell(8).alignment = { vertical: "middle", horizontal: "left" };

    dataRow.getCell(9).value = order.placedAt ? dayjs(order.placedAt).format("DD/MM/YYYY HH:mm") : "—";
    dataRow.getCell(9).alignment = { vertical: "middle", horizontal: "center" };

    dataRow.getCell(10).value = order.completedAt ? dayjs(order.completedAt).format("DD/MM/YYYY HH:mm") : "—";
    dataRow.getCell(10).alignment = { vertical: "middle", horizontal: "center" };

    dataRow.getCell(11).value = order.totalItems;
    dataRow.getCell(11).font = { bold: true };
    dataRow.getCell(11).alignment = { vertical: "middle", horizontal: "center" };

    dataRow.getCell(12).value = order.subtotal;
    dataRow.getCell(12).numFmt = "#,##0";
    dataRow.getCell(12).font = { bold: true };
    dataRow.getCell(12).alignment = { vertical: "middle", horizontal: "right" };

    dataRow.getCell(13).value = order.discountAmount;
    dataRow.getCell(13).numFmt = "#,##0";
    dataRow.getCell(13).font = { color: { argb: "FF64748B" } };
    dataRow.getCell(13).alignment = { vertical: "middle", horizontal: "right" };

    dataRow.getCell(14).value = order.voucherCode || "—";
    dataRow.getCell(14).alignment = { vertical: "middle", horizontal: "center" };

    const netCell = dataRow.getCell(15);
    netCell.value = order.totalAmount;
    netCell.numFmt = "#,##0";
    netCell.font = { bold: true, color: { argb: "FF15803D" } };
    netCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0FDF4" } };
    netCell.alignment = { vertical: "middle", horizontal: "right" };

    const methodCell = dataRow.getCell(16);
    methodCell.value = order.paymentMethodName;
    methodCell.font = {
      bold: true,
      color: { argb: order.paymentMethod === "VNPAY" ? "FF1D4ED8" : "FF059669" },
    };
    methodCell.alignment = { vertical: "middle", horizontal: "center" };

    dataRow.getCell(17).value = order.paymentStatusName;
    dataRow.getCell(17).alignment = { vertical: "middle", horizontal: "center" };

    const statusCell = dataRow.getCell(18);
    statusCell.value = order.statusName;
    statusCell.font = { bold: true };
    statusCell.alignment = { vertical: "middle", horizontal: "center" };

    for (let c = 1; c <= 18; c++) {
      const cell = dataRow.getCell(c);
      cell.border = thinBorder;
      if (c !== 15) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: rowBgColor } };
      }
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const fileName = `Bao_Cao_Don_Hang_Urban_Stitch_Tu_${fromDateFile}_Den_${toDateFile}.xlsx`;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return fileName;
};
