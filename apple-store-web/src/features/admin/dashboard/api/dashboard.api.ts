import { api } from "@core/api/axios.config";
import type {
  DashboardActionCenterData,
  DashboardFilterParams,
  DashboardMetrics,
  DashboardRankingsData,
  DashboardTrends,
} from "../types/dashboard.types";

export const dashboardApi = {
  getMetrics: async (params?: DashboardFilterParams): Promise<DashboardMetrics> => {
    const response = await api.get<DashboardMetrics>("/api/manager/dashboard/metrics", {
      params,
    });
    return response;
  },

  getActionCenter: async (params?: DashboardFilterParams): Promise<DashboardActionCenterData> => {
    const response = await api.get<DashboardActionCenterData>("/api/manager/dashboard/action-center", {
      params,
    });
    return response;
  },

  getTrends: async (params?: DashboardFilterParams): Promise<DashboardTrends> => {
    const response = await api.get<DashboardTrends>("/api/manager/dashboard/trends", {
      params,
    });
    return response;
  },

  getRankings: async (params?: DashboardFilterParams): Promise<DashboardRankingsData> => {
    const response = await api.get<DashboardRankingsData>("/api/manager/dashboard/rankings", {
      params,
    });
    return response;
  },
};

