import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard.api";
import type { DashboardFilterParams } from "../types/dashboard.types";

export const DASHBOARD_QUERY_KEYS = {
  METRICS: (params?: DashboardFilterParams) =>
    ["admin", "dashboard", "metrics", params] as const,
  ACTION_CENTER: (params?: DashboardFilterParams) =>
    ["admin", "dashboard", "action-center", params] as const,
  TRENDS: (params?: DashboardFilterParams) =>
    ["admin", "dashboard", "trends", params] as const,
  RANKINGS: (params?: DashboardFilterParams) =>
    ["admin", "dashboard", "rankings", params] as const,
};

export const useDashboardMetrics = (params?: DashboardFilterParams) => {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.METRICS(params),
    queryFn: () => dashboardApi.getMetrics(params),
    staleTime: 0,
  });
};

export const useDashboardActionCenter = (params?: DashboardFilterParams) => {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.ACTION_CENTER(params),
    queryFn: () => dashboardApi.getActionCenter(params),
    staleTime: 0,
  });
};

export const useDashboardTrends = (params?: DashboardFilterParams) => {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.TRENDS(params),
    queryFn: () => dashboardApi.getTrends(params),
    staleTime: 0,
  });
};

export const useDashboardRankings = (params?: DashboardFilterParams) => {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.RANKINGS(params),
    queryFn: () => dashboardApi.getRankings(params),
    staleTime: 0,
  });
};

