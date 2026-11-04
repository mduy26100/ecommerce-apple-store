import React from "react";
import {
  DashboardOutlined,
  TeamOutlined,
  ClusterOutlined,
  BgColorsOutlined,
  DatabaseOutlined,
  FolderOutlined,
  ShoppingOutlined,
  OrderedListOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import type { MenuItem } from "../models/menu-item.model";
import { USER_ROLES } from "@core/constants/role.constants";

export const menuItems: MenuItem[] = [
  {
    key: "dashboard",
    label: "Tổng quan",
    path: "/admin/dashboard",
    icon: React.createElement(DashboardOutlined),
  },
  {
    key: "catalog-management",
    label: "Quản lý sản phẩm",
    icon: React.createElement(ClusterOutlined),
    children: [
      {
        key: "products",
        label: "Sản phẩm",
        path: "/admin/products",
        icon: React.createElement(ShoppingOutlined),
      },
      {
        key: "categories",
        label: "Danh mục",
        path: "/admin/categories",
        icon: React.createElement(FolderOutlined),
      },
      {
        key: "colors",
        label: "Màu sắc",
        path: "/admin/colors",
        icon: React.createElement(BgColorsOutlined),
      },
      {
        key: "storage-options",
        label: "Dung lượng",
        path: "/admin/storage-options",
        icon: React.createElement(DatabaseOutlined),
      },
    ],
  },
  {
    key: "orders",
    label: "Đơn hàng",
    path: "/admin/orders",
    icon: React.createElement(OrderedListOutlined),
  },
  {
    key: "reports",
    label: "Báo cáo thống kê",
    path: "/admin/reports",
    icon: React.createElement(BarChartOutlined),
  },
  {
    key: "users",
    label: "Quản lý người dùng",
    path: "/admin/users",
    icon: React.createElement(TeamOutlined),
    roles: [USER_ROLES.ADMIN],
  },
];

interface FlatRoutePermission {
  path: string;
  roles: string[];
}

export const getFlatRoutePermissions = (
  items: MenuItem[],
  parentRoles: string[] = [],
): FlatRoutePermission[] => {
  let list: FlatRoutePermission[] = [];
  items.forEach((item) => {
    const effectiveRoles = item.roles && item.roles.length > 0 ? item.roles : parentRoles;
    if (item.path) {
      list.push({
        path: item.path,
        roles: effectiveRoles,
      });
    }
    if (item.children && item.children.length > 0) {
      list = [...list, ...getFlatRoutePermissions(item.children, effectiveRoles)];
    }
  });
  return list;
};

export const flatRoutePermissions = getFlatRoutePermissions(menuItems);

export const checkRouteAccess = (pathname: string, role: string | null): boolean => {
  const sorted = [...flatRoutePermissions].sort((a, b) => b.path.length - a.path.length);
  const match = sorted.find(
    (config) => pathname === config.path || pathname.startsWith(config.path + "/"),
  );

  if (!match) return true;
  if (!match.roles || match.roles.length === 0) return true;
  return !!role && match.roles.includes(role);
};
