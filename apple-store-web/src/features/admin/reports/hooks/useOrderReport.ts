import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { orderReportApi } from "../api/order-report.api";
import type { OrderReportFilterParams } from "../types/order-report.types";

export const ORDER_REPORT_QUERY_KEYS = {
  SUMMARY: (params?: OrderReportFilterParams) =>
    ["admin", "reports", "orders", "summary", params] as const,
  STATUS_BREAKDOWN: (params?: OrderReportFilterParams) =>
    ["admin", "reports", "orders", "status-breakdown", params] as const,
  DETAILS: (params?: OrderReportFilterParams) =>
    ["admin", "reports", "orders", "details", params] as const,
  ANALYTICS: (params?: OrderReportFilterParams) =>
    ["admin", "reports", "orders", "analytics", params] as const,
  TRENDS: (params?: OrderReportFilterParams) =>
    ["admin", "reports", "orders", "trends", params] as const,
  PAYMENTS: (params?: OrderReportFilterParams) =>
    ["admin", "reports", "orders", "payments", params] as const,
  CUSTOMERS: (params?: OrderReportFilterParams) =>
    ["admin", "reports", "orders", "customers", params] as const,
  CASHFLOW: (params?: OrderReportFilterParams) =>
    ["admin", "reports", "orders", "cashflow", params] as const,
  PRODUCTS: (params?: OrderReportFilterParams) =>
    ["admin", "reports", "orders", "products", params] as const,
};

export const useOrderReportSummary = (params?: OrderReportFilterParams) => {
  return useQuery({
    queryKey: ORDER_REPORT_QUERY_KEYS.SUMMARY(params),
    queryFn: () => orderReportApi.getSummary(params),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
};

export const useOrderStatusBreakdown = (params?: OrderReportFilterParams) => {
  return useQuery({
    queryKey: ORDER_REPORT_QUERY_KEYS.STATUS_BREAKDOWN(params),
    queryFn: () => orderReportApi.getStatusBreakdown(params),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
};

export const useOrderReportDetails = (params?: OrderReportFilterParams) => {
  return useQuery({
    queryKey: ORDER_REPORT_QUERY_KEYS.DETAILS(params),
    queryFn: () => orderReportApi.getDetails(params),
    placeholderData: keepPreviousData,
  });
};

export const useOrderReportAnalytics = (params?: OrderReportFilterParams) => {
  return useQuery({
    queryKey: ORDER_REPORT_QUERY_KEYS.ANALYTICS(params),
    queryFn: () => orderReportApi.getAnalytics(params),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
};

export const useOrderReportTrends = (params?: OrderReportFilterParams) => {
  return useQuery({
    queryKey: ORDER_REPORT_QUERY_KEYS.TRENDS(params),
    queryFn: () => orderReportApi.getTrends(params),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
};

export const useOrderReportPayments = (params?: OrderReportFilterParams) => {
  return useQuery({
    queryKey: ORDER_REPORT_QUERY_KEYS.PAYMENTS(params),
    queryFn: () => orderReportApi.getPayments(params),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
};

export const useOrderReportCustomers = (params?: OrderReportFilterParams) => {
  return useQuery({
    queryKey: ORDER_REPORT_QUERY_KEYS.CUSTOMERS(params),
    queryFn: () => orderReportApi.getCustomers(params),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
};

export const useOrderReportCashflow = (params?: OrderReportFilterParams) => {
  return useQuery({
    queryKey: ORDER_REPORT_QUERY_KEYS.CASHFLOW(params),
    queryFn: () => orderReportApi.getCashflow(params),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
};

export const useOrderReportProducts = (params?: OrderReportFilterParams) => {
  return useQuery({
    queryKey: ORDER_REPORT_QUERY_KEYS.PRODUCTS(params),
    queryFn: () => orderReportApi.getProducts(params),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
};

