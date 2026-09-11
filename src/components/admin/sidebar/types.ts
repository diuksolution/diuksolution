import type { ComponentType, ReactNode } from "react";
import type { AuthProvider, BusinessType, Role } from "@prisma/client";

export type AdminNavItem = {
  href: string;
  icon: string;
  label: string;
  badge?: number;
};

export type AdminNavSection = {
  title: string;
  items: AdminNavItem[];
};

export type AdminShellUser = {
  name: string | null;
  email: string;
  role: Role;
  authProvider: AuthProvider;
  businessName: string;
  businessType: BusinessType;
};

export type CoreSidebarProps = {
  businessName: string;
  industryLabel: string;
  roleLabel: string;
  nav: AdminNavSection[];
  collapsed: boolean;
  mobileOpen: boolean;
  onCollapse: () => void;
  onNavigate: () => void;
};

export type WorkspaceSidebarProps = Omit<CoreSidebarProps, "nav">;

export type AdminShellProps = {
  user: AdminShellUser;
  Sidebar: ComponentType<WorkspaceSidebarProps>;
  industryLabel: string;
  roleLabel: string;
  searchPlaceholder: string;
  children: ReactNode;
};
