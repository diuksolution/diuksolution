"use client";

import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/sidebar/admin-shell";
import { CoreSidebar } from "@/components/admin/sidebar/core-sidebar";
import { useUnreadChatCount } from "@/components/admin/sidebar/use-unread-chat-count";
import type {
  AdminNavSection,
  AdminShellUser,
  WorkspaceSidebarProps,
} from "@/components/admin/sidebar/types";

export function getFnbNav(unreadCount = 0): AdminNavSection[] {
  return [
    {
      title: "Overview",
      items: [{ href: "/admin/fnb", icon: "grid_view", label: "Dashboard" }],
    },
    {
      title: "Operations",
      items: [
        {
          href: "/admin/fnb/chat",
          icon: "forum",
          label: "Chat",
          badge: unreadCount > 0 ? unreadCount : undefined,
        },
        {
          href: "/admin/fnb/reservations",
          icon: "calendar_today",
          label: "Reservations",
        },
      ],
    },
    {
      title: "System",
      items: [
        { href: "/admin/fnb/settings", icon: "settings", label: "Settings" },
        { href: "/admin/fnb/help", icon: "help_center", label: "Help & Support" },
      ],
    },
  ];
}

export const fnbNav = getFnbNav();

function FnbSidebar(props: WorkspaceSidebarProps) {
  const unreadCount = useUnreadChatCount();
  return <CoreSidebar {...props} nav={getFnbNav(unreadCount)} />;
}

export function FnbWorkspace({
  user,
  children,
}: {
  user: AdminShellUser;
  children: ReactNode;
}) {
  return (
    <AdminShell
      user={user}
      Sidebar={FnbSidebar}
      industryLabel="Food & Beverage"
      roleLabel="F&B"
      searchPlaceholder="Search conversations, bookings, or chats..."
    >
      {children}
    </AdminShell>
  );
}
