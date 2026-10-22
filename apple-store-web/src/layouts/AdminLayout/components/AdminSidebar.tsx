import { useState, useMemo } from "react";
import { Layout, Menu } from "antd";
import type { MenuProps } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import type { MenuItem } from "../models/menu-item.model";
import { menuItems } from "../data/menuItems";
import { AppleLogo } from "@shared/components/icons";

const { Sider } = Layout;

interface AdminSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

type MenuItemType = Required<MenuProps>["items"][number];

const getAntdMenuItems = (items: MenuItem[]): MenuItemType[] => {
  return items.map((item) => {
    if (item.children && item.children.length > 0) {
      return {
        key: item.key,
        icon: item.icon,
        label: item.label,
        disabled: item.disabled,
        children: getAntdMenuItems(item.children),
      };
    }
    return {
      key: item.key,
      icon: item.icon,
      label: item.label,
      disabled: item.disabled,
    };
  });
};

const getFlatMenuMap = (
  items: MenuItem[],
): { [key: string]: { path?: string; parentKey?: string } } => {
  const map: { [key: string]: { path?: string; parentKey?: string } } = {};
  const traverse = (list: MenuItem[], parentKey?: string) => {
    list.forEach((item) => {
      map[item.key] = { path: item.path, parentKey };
      if (item.children) {
        traverse(item.children, item.key);
      }
    });
  };
  traverse(items);
  return map;
};

export const AdminSidebar = ({
  collapsed,
  onCollapse,
  mobileOpen,
  onMobileClose,
}: AdminSidebarProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const filteredMenuItems = useMemo(() => {
    return menuItems;
  }, []);

  const flatMenuMap = useMemo(
    () => getFlatMenuMap(filteredMenuItems),
    [filteredMenuItems],
  );

  const selectedKeys = useMemo(() => {
    return Object.keys(flatMenuMap).filter((key) => {
      const { path } = flatMenuMap[key];
      return path && pathname.startsWith(path);
    });
  }, [flatMenuMap, pathname]);

  const [prevPathname, setPrevPathname] = useState(pathname);
  const [openKeys, setOpenKeys] = useState<string[]>(() => {
    const keysToOpen: string[] = [];
    Object.keys(flatMenuMap).forEach((key) => {
      const { path, parentKey } = flatMenuMap[key];
      if (path && pathname.startsWith(path) && parentKey) {
        if (!keysToOpen.includes(parentKey)) {
          keysToOpen.push(parentKey);
        }
      }
    });
    return keysToOpen;
  });

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    const keysToOpen: string[] = [];
    Object.keys(flatMenuMap).forEach((key) => {
      const { path, parentKey } = flatMenuMap[key];
      if (path && pathname.startsWith(path) && parentKey) {
        if (!keysToOpen.includes(parentKey)) {
          keysToOpen.push(parentKey);
        }
      }
    });
    if (keysToOpen.length > 0 && !collapsed) {
      setOpenKeys((prev) => Array.from(new Set([...prev, ...keysToOpen])));
    }
  }

  const handleMenuClick = ({ key }: { key: string }) => {
    const item = flatMenuMap[key];
    if (item && item.path) {
      navigate(item.path);
      onMobileClose();
    }
  };

  const items = getAntdMenuItems(filteredMenuItems);

  const handleOpenChange = (keys: string[]) => {
    if (collapsed) {
      if (keys.length > 0) {
        onCollapse(false);
        setOpenKeys(keys);
      }
      return;
    }
    setOpenKeys(keys);
  };

  const renderMenuContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/50">
      <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-100/80 transition-all duration-300">
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-900 text-white shadow-sm">
          <AppleLogo size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col opacity-100 transition-opacity duration-300">
            <span className="text-sm font-bold text-slate-800 tracking-wide">
              Apple Admin
            </span>
            <span className="text-xxs text-slate-400 font-medium">
              Cổng Quản Trị Hệ Thống
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar py-4">
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={selectedKeys}
          openKeys={collapsed ? [] : openKeys}
          onOpenChange={handleOpenChange}
          onClick={handleMenuClick}
          items={items}
          className="border-none"
        />
      </div>
    </div>
  );

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity duration-300 md:hidden ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onMobileClose}
      />
      <div
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 transition-transform duration-300 transform md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {renderMenuContent()}
      </div>

      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        onCollapse={onCollapse}
        width={256}
        collapsedWidth={80}
        theme="light"
        className="hidden md:block h-screen sticky top-0 left-0 bottom-0 shadow-lg border-r border-slate-200/50 z-30 select-none overflow-hidden"
      >
        {renderMenuContent()}
      </Sider>
    </>
  );
};

export default AdminSidebar;
