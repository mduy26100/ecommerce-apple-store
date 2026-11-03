import React from "react";
import { Table, Tag, Empty } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  FireOutlined,
  WarningOutlined,
  CrownOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import type {
  TopSellingProduct,
  LowStockProduct,
  TopCustomer,
  RecentActivityOrder,
} from "../types/dashboard.types";

interface DashboardRankingsProps {
  topSellingProducts: TopSellingProduct[];
  lowStockProducts: LowStockProduct[];
  topCustomers: TopCustomer[];
  recentOrders: RecentActivityOrder[];
  isLoading?: boolean;
}

const formatVND = (val?: number | null) => {
  if (val == null) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(val);
};

export const DashboardRankings: React.FC<DashboardRankingsProps> = ({
  topSellingProducts,
  lowStockProducts,
  topCustomers,
  recentOrders,
  isLoading = false,
}) => {
  const displaySelling = topSellingProducts.slice(0, 5);
  const displayLowStock = lowStockProducts.slice(0, 5);
  const displayCustomers = topCustomers.slice(0, 5);
  const displayRecent = recentOrders.slice(0, 5);

  const topSellingColumns: ColumnsType<TopSellingProduct> = [
    {
      title: "#",
      key: "rank",
      width: 44,
      align: "center",
      render: (_, __, index) => (
        <span
          className={`font-bold inline-flex items-center justify-center w-6 h-6 rounded text-xs ${
            index === 0
              ? "bg-amber-100 text-amber-900"
              : index === 1
              ? "bg-slate-200 text-slate-900"
              : index === 2
              ? "bg-amber-50 text-amber-800"
              : "text-slate-600"
          }`}
        >
          {index + 1}
        </span>
      ),
    },
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      render: (val: string, record) => (
        <div>
          <div className="font-semibold text-slate-900 text-xs sm:text-sm">{val}</div>
          <div className="text-xs text-slate-600 font-mono font-medium">SKU: {record.sku}</div>
        </div>
      ),
    },
    {
      title: "Đã bán",
      dataIndex: "quantitySold",
      key: "quantitySold",
      width: 80,
      align: "right",
      render: (val: number) => (
        <span className="font-bold text-slate-900 text-xs sm:text-sm">{val}</span>
      ),
    },
    {
      title: "Doanh thu",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      width: 130,
      align: "right",
      render: (val: number) => (
        <span className="font-bold text-emerald-700 text-xs sm:text-sm">
          {formatVND(val)}
        </span>
      ),
    },
  ];

  const lowStockColumns: ColumnsType<LowStockProduct> = [
    {
      title: "#",
      key: "rank",
      width: 44,
      align: "center",
      render: (_, __, index) => (
        <span className="text-xs text-slate-600 font-bold">{index + 1}</span>
      ),
    },
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      render: (val: string, record) => (
        <div>
          <div className="font-semibold text-slate-900 text-xs sm:text-sm">{val}</div>
          <div className="text-xs text-slate-600 font-mono font-medium">SKU: {record.sku}</div>
        </div>
      ),
    },
    {
      title: "Tồn kho",
      dataIndex: "quantityInStock",
      key: "quantityInStock",
      width: 100,
      align: "center",
      render: (val: number) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
            val <= 3
              ? "bg-rose-100 text-rose-800"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {val === 0 ? "Hết hàng" : `Còn ${val} cái`}
        </span>
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      width: 120,
      align: "right",
      render: (val: number) => (
        <span className="text-slate-800 font-semibold text-xs sm:text-sm">
          {formatVND(val)}
        </span>
      ),
    },
  ];

  const topCustomerColumns: ColumnsType<TopCustomer> = [
    {
      title: "#",
      key: "rank",
      width: 44,
      align: "center",
      render: (_, __, index) => (
        <span
          className={`font-bold inline-flex items-center justify-center w-6 h-6 rounded text-xs ${
            index === 0
              ? "bg-amber-100 text-amber-900"
              : index === 1
              ? "bg-slate-200 text-slate-900"
              : index === 2
              ? "bg-amber-50 text-amber-800"
              : "text-slate-600"
          }`}
        >
          {index + 1}
        </span>
      ),
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
      render: (val: string, record) => (
        <div>
          <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
            <span>{val}</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
              {record.customerType}
            </span>
          </div>
          <div className="text-xs text-slate-700 font-medium mt-0.5">{record.customerPhone}</div>
        </div>
      ),
    },
    {
      title: "Số đơn",
      dataIndex: "ordersCount",
      key: "ordersCount",
      width: 80,
      align: "right",
      render: (val: number) => (
        <span className="font-bold text-slate-900 text-xs sm:text-sm">{val} đơn</span>
      ),
    },
    {
      title: "Tổng chi tiêu",
      dataIndex: "totalSpent",
      key: "totalSpent",
      width: 130,
      align: "right",
      render: (val: number) => (
        <span className="font-bold text-blue-700 text-xs sm:text-sm">{formatVND(val)}</span>
      ),
    },
  ];

  const recentOrderColumns: ColumnsType<RecentActivityOrder> = [
    {
      title: "Mã đơn",
      dataIndex: "orderNumber",
      key: "orderNumber",
      width: 130,
      render: (val: string) => (
        <span className="font-mono font-bold text-blue-700 text-xs">
          {val}
        </span>
      ),
    },
    {
      title: "Khách hàng",
      dataIndex: "recipientName",
      key: "recipientName",
      render: (val: string, record) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{val}</div>
          <div className="text-xs text-slate-700 font-medium">{record.recipientPhone}</div>
        </div>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 120,
      align: "right",
      render: (val: number) => (
        <span className="font-bold text-slate-900 text-xs">
          {formatVND(val)}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "statusName",
      key: "statusName",
      width: 110,
      render: (val: string, record) => {
        let color = "default";
        if (record.status === "Delivered" || record.status === "Completed") color = "success";
        else if (record.status === "Pending") color = "warning";
        else if (record.status === "Cancelled") color = "error";
        else if (record.status === "Shipping" || record.status === "Processing" || record.status === "Confirmed")
          color = "processing";

        return <Tag color={color} className="text-xs font-semibold m-0">{val}</Tag>;
      },
    },
    {
      title: "Thời gian",
      dataIndex: "placedAt",
      key: "placedAt",
      width: 110,
      render: (val: string) => (
        <span className="text-slate-700 font-medium text-xs">
          {val ? new Date(val).toLocaleDateString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "-"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
              <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <FireOutlined className="text-base" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Top 5 sản phẩm bán chạy nhất
                </h3>
                <p className="text-xs text-slate-500">
                  Xếp hạng theo số lượng bán ra
                </p>
              </div>
            </div>
            <Table
              dataSource={displaySelling}
              columns={topSellingColumns}
              rowKey={(r, i) => `${r.sku}-${i}`}
              pagination={false}
              size="small"
              loading={isLoading}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chưa có dữ liệu bán hàng"
                  />
                ),
              }}
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
              <span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <WarningOutlined className="text-base" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Top 5 sản phẩm sắp cạn kho
                </h3>
                <p className="text-xs text-slate-500">
                  Cần lên kế hoạch nhập hàng hoặc điều chuyển
                </p>
              </div>
            </div>
            <Table
              dataSource={displayLowStock}
              columns={lowStockColumns}
              rowKey={(r, i) => `${r.sku}-${i}`}
              pagination={false}
              size="small"
              loading={isLoading}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Kho hàng đang ổn định"
                  />
                ),
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
              <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <CrownOutlined className="text-base" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Top khách hàng chi tiêu
                </h3>
                <p className="text-xs text-slate-500">5 khách hàng thân thiết VIP</p>
              </div>
            </div>
            <Table
              dataSource={displayCustomers}
              columns={topCustomerColumns}
              rowKey={(r, i) => `${r.customerPhone}-${i}`}
              pagination={false}
              size="small"
              loading={isLoading}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chưa có thông tin khách hàng"
                  />
                ),
              }}
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
              <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <HistoryOutlined className="text-base" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Luồng đơn hàng gần đây
                </h3>
                <p className="text-xs text-slate-500">
                  5 giao dịch mới nhất vừa phát sinh
                </p>
              </div>
            </div>
            <Table
              dataSource={displayRecent}
              columns={recentOrderColumns}
              rowKey="id"
              pagination={false}
              size="small"
              loading={isLoading}
              scroll={{ x: 500 }}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chưa có giao dịch gần đây"
                  />
                ),
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
