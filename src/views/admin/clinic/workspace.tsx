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

export function getClinicNav(unreadCount = 0): AdminNavSection[] {
  return [
    {
      title: "Overview",
      items: [
        { href: "/admin/clinic", icon: "grid_view", label: "Dashboard" },
      ],
    },
    {
      title: "Customer Operations",
      items: [
        {
          href: "/admin/clinic/chat",
          icon: "forum",
          label: "Chat",
          badge: unreadCount > 0 ? unreadCount : undefined,
        },
        { href: "/admin/clinic/patients", icon: "group", label: "Patients" },
        {
          href: "/admin/clinic/appointments",
          icon: "calendar_today",
          label: "Appointments",
        },
      ],
    },
    {
      title: "Clinic Management",
      items: [
        {
          href: "/admin/clinic/doctors",
          icon: "stethoscope",
          label: "Doctor List",
        },
        {
          href: "/admin/clinic/services",
          icon: "medical_services",
          label: "Services",
        },
        { href: "/admin/clinic/schedules", icon: "schedule", label: "Schedules" },
      ],
    },
    {
      title: "Sales & Relationship",
      items: [
        { href: "/admin/clinic/leads", icon: "contact_page", label: "Leads" },
        { href: "/admin/clinic/crm", icon: "diversity_1", label: "CRM" },
      ],
    },
    {
      title: "Automation",
      items: [
        {
          href: "/admin/clinic/automation",
          icon: "smart_toy",
          label: "AI Automation",
        },
        {
          href: "/admin/clinic/workflows",
          icon: "account_tree",
          label: "Workflows",
        },
      ],
    },
    {
      title: "Analytics",
      items: [
        {
          href: "/admin/clinic/analytics",
          icon: "monitoring",
          label: "Analytics",
        },
        { href: "/admin/clinic/reports", icon: "assignment", label: "Reports" },
      ],
    },
    {
      title: "System",
      items: [
        { href: "/admin/clinic/settings", icon: "settings", label: "Settings" },
        {
          href: "/admin/clinic/help",
          icon: "help_center",
          label: "Help & Support",
        },
      ],
    },
  ];
}

export const clinicNav = getClinicNav();

function ClinicSidebar(props: WorkspaceSidebarProps) {
  const unreadCount = useUnreadChatCount();
  return <CoreSidebar {...props} nav={getClinicNav(unreadCount)} />;
}

export function ClinicWorkspace({
  user,
  children,
}: {
  user: AdminShellUser;
  children: ReactNode;
}) {
  return (
    <AdminShell
      user={user}
      Sidebar={ClinicSidebar}
      industryLabel="Beauty & Aesthetic"
      roleLabel="Clinic"
      searchPlaceholder="Search patients, appointments, phone, or chats... [⌘K]"
    >
      {children}
    </AdminShell>
  );
}
