import React from "react";
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  ClusterOutlined,
  SafetyCertificateOutlined,
  ProfileOutlined,
  PartitionOutlined,
  BgColorsOutlined,
  DatabaseOutlined,
  FolderOutlined,
  ShoppingOutlined,
  OrderedListOutlined,
} from "@ant-design/icons";
import type { MenuItem } from "../models/menu-item.model";
import { USER_ROLES } from "@core/constants/role.constants";

export const menuItems: MenuItem[] = [
  {
    key: "dashboard",
    label: "Bảng điều khiển",
    path: "/admin/dashboard",
    icon: React.createElement(DashboardOutlined),
  },
  {
    key: "catalog-management",
    label: "Quản lý sản phẩm",
    icon: React.createElement(ClusterOutlined),
    children: [
      {
        key: "categories",
        label: "Danh mục",
        path: "/admin/categories",
        icon: React.createElement(FolderOutlined),
      },
      {
        key: "products",
        label: "Sản phẩm",
        path: "/admin/products",
        icon: React.createElement(ShoppingOutlined),
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
    key: "user-management",
    label: "Quản trị người dùng",
    icon: React.createElement(UserOutlined),
    roles: [USER_ROLES.ADMIN],
    children: [
      {
        key: "users",
        label: "Người dùng",
        path: "/admin/users",
        icon: React.createElement(TeamOutlined),
        roles: [USER_ROLES.ADMIN],
      },
      {
        key: "roles",
        label: "Vai trò & Quyền",
        path: "/admin/roles",
        icon: React.createElement(SafetyCertificateOutlined),
        roles: [USER_ROLES.ADMIN],
      },
    ],
  },
  {
    key: "tenant-management",
    label: "Quản lý đối tác",
    icon: React.createElement(ClusterOutlined),
    roles: [USER_ROLES.SUPER_ADMIN],
    children: [
      {
        key: "tenants",
        label: "Chi nhánh",
        path: "/admin/tenants",
        icon: React.createElement(PartitionOutlined),
        roles: [USER_ROLES.SUPER_ADMIN],
      },
    ],
  },
  {
    key: "settings",
    label: "Cấu hình",
    icon: React.createElement(SettingOutlined),
    roles: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN],
    children: [
      {
        key: "settings-general",
        label: "Cài đặt chung",
        path: "/admin/settings",
        icon: React.createElement(ProfileOutlined),
        roles: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN],
      },
    ],
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
