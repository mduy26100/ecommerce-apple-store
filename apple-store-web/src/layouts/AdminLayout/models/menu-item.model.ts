import type { ReactNode } from "react";

/**
 * Enterprise-grade MenuItem model to configure dashboard sidebar navigation.
 * Designed to support Role-Based Access Control (RBAC), nesting, and clean framework separation.
 */
export interface MenuItem {
  /** Unique key for the menu item, also used as key in Ant Design Menu */
  key: string;
  
  /** Display label in the menu */
  label: string;
  
  /** Route path matching react-router configuration */
  path?: string;
  
  /** Custom icon element (e.g. from Ant Design Icons or Lucide) */
  icon?: ReactNode;
  
  /** Sub-menu items for nested structures */
  children?: MenuItem[];
  
  /** Access roles allowed to view this menu item (e.g. ['admin', 'manager']) */
  roles?: string[];
  
  /** Flag to temporarily disable the menu item */
  disabled?: boolean;
}
