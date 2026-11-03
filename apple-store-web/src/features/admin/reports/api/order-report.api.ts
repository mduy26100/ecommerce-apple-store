import { api } from "@core/api/axios.config";
import type {
  OrderKpiSummary,
  OrderReportDetail,
  OrderReportFilterParams,
  OrderStatusBreakdownItem,
  OrderReportAnalytics,
} from "../types/order-report.types";

export const orderReportApi = {
  getSummary: async (params?: OrderReportFilterParams): Promise<OrderKpiSummary> => {
    const response = await api.get<OrderKpiSummary>("/api/manager/reports/orders/summary", {
      params,
    });
    return response;
  },

  getStatusBreakdown: async (params?: OrderReportFilterParams): Promise<OrderStatusBreakdownItem[]> => {
    const response = await api.get<OrderStatusBreakdownItem[]>("/api/manager/reports/orders/status-breakdown", {
      params,
    });
    return response;
  },

  getDetails: async (params?: OrderReportFilterParams): Promise<OrderReportDetail[]> => {
    const response = await api.get<OrderReportDetail[]>("/api/manager/reports/orders/details", {
      params,
    });
    return response;
  },

  getExportOrders: async (params?: OrderReportFilterParams): Promise<OrderReportDetail[]> => {
    const response = await api.get<OrderReportDetail[]>("/api/manager/reports/orders/export", {
      params,
    });
    return response;
  },

  exportExcel: async (params?: OrderReportFilterParams): Promise<Blob> => {
    const response = await api.get<Blob>("/api/manager/reports/orders/export-excel", {
      params,
      responseType: "blob",
    });
    return response;
  },

  getAnalytics: async (params?: OrderReportFilterParams): Promise<OrderReportAnalytics> => {
    const response = await api.get<OrderReportAnalytics>("/api/manager/reports/orders/analytics", {
      params,
    });
    return response;
  },

  getTrends: async (params?: OrderReportFilterParams) => {
    const response = await api.get("/api/manager/reports/orders/trends", {
      params,
    });
    return response;
  },

  getPayments: async (params?: OrderReportFilterParams) => {
    const response = await api.get("/api/manager/reports/orders/payments", {
      params,
    });
    return response;
  },

  getCustomers: async (params?: OrderReportFilterParams) => {
    const response = await api.get("/api/manager/reports/orders/customers", {
      params,
    });
    return response;
  },

  getCashflow: async (params?: OrderReportFilterParams) => {
    const response = await api.get("/api/manager/reports/orders/cashflow", {
      params,
    });
    return response;
  },

  getProducts: async (params?: OrderReportFilterParams) => {
    const response = await api.get("/api/manager/reports/orders/products", {
      params,
    });
    return response;
  },
};
