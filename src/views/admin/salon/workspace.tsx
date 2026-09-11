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

export function getSalonNav(unreadCount = 0): AdminNavSection[] {
  return [
    {
      title: "Overview",
      items: [{ href: "/admin/salon", icon: "grid_view", label: "Dashboard" }],
    },
    {
      title: "Customer Operations",
      items: [
        {
          href: "/admin/salon/chat",
          icon: "forum",
          label: "Chat",
          badge: unreadCount > 0 ? unreadCount : undefined,
        },
        { href: "/admin/salon/clients", icon: "group", label: "Clients" },
        {
          href: "/admin/salon/appointments",
          icon: "calendar_today",
          label: "Appointments",
        },
      ],
    },
    {
      title: "Salon Management",
      items: [
        {
          href: "/admin/salon/stylists",
          icon: "content_cut",
          label: "Stylist List",
        },
        { href: "/admin/salon/services", icon: "spa", label: "Services" },
        { href: "/admin/salon/schedules", icon: "schedule", label: "Schedules" },
      ],
    },
    {
      title: "Sales & Relationship",
      items: [
        { href: "/admin/salon/leads", icon: "contact_page", label: "Leads" },
        { href: "/admin/salon/crm", icon: "diversity_1", label: "CRM" },
      ],
    },
    {
      title: "Automation",
      items: [
        {
          href: "/admin/salon/automation",
          icon: "smart_toy",
          label: "AI Automation",
        },
        {
          href: "/admin/salon/workflows",
          icon: "account_tree",
          label: "Workflows",
        },
      ],
    },
    {
      title: "Analytics",
      items: [
        {
          href: "/admin/salon/analytics",
          icon: "monitoring",
          label: "Analytics",
        },
        { href: "/admin/salon/reports", icon: "assignment", label: "Reports" },
      ],
    },
    {
      title: "System",
      items: [
        { href: "/admin/salon/settings", icon: "settings", label: "Settings" },
        {
          href: "/admin/salon/help",
          icon: "help_center",
          label: "Help & Support",
        },
      ],
    },
  ];
}

export const salonNav = getSalonNav();

function SalonSidebar(props: WorkspaceSidebarProps) {
  const unreadCount = useUnreadChatCount();
  return <CoreSidebar {...props} nav={getSalonNav(unreadCount)} />;
}

export function SalonWorkspace({
  user,
  children,
}: {
  user: AdminShellUser;
  children: ReactNode;
}) {
  return (
    <AdminShell
      user={user}
      Sidebar={SalonSidebar}
      industryLabel="Salon & Barbershop"
      roleLabel="Salon"
      searchPlaceholder="Search clients, appointments, phone, or chats... [⌘K]"
    >
      {children}
    </AdminShell>
  );
}
