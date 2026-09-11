import type { AppointmentCopy } from "@/lib/appointment/types";
import type { AppointmentDashboardData } from "@/lib/appointment/dashboard-data";
import { AppointmentsBoard } from "@/components/admin/appointment-dashboard/appointments-board";
import { ConversationsPanel } from "@/components/admin/appointment-dashboard/conversations-panel";
import { DashboardHero } from "@/components/admin/appointment-dashboard/dashboard-hero";
import { KpiGrid } from "@/components/admin/appointment-dashboard/kpi-grid";
import { OperationsColumn } from "@/components/admin/appointment-dashboard/operations-column";
import { SalesPipeline } from "@/components/admin/appointment-dashboard/sales-pipeline";
import { VelocityPanel } from "@/components/admin/appointment-dashboard/velocity-panel";

export function AppointmentDashboard({
  businessName,
  copy,
  data,
  greeting,
  dateLabel,
}: {
  businessName: string;
  copy: AppointmentCopy;
  data: AppointmentDashboardData;
  greeting: string;
  dateLabel: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-8">
      <DashboardHero
        greeting={greeting}
        dateLabel={dateLabel}
        businessName={businessName}
        copy={copy}
      />
      <KpiGrid items={data.kpis} />
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
        <AppointmentsBoard
          copy={copy}
          appointments={data.appointments}
          total={data.appointmentTotal}
          confirmedCount={data.confirmedCount}
          waitingCount={data.waitingCount}
        />
        <OperationsColumn copy={copy} practitioners={data.practitioners} />
      </div>
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
        <ConversationsPanel
          conversations={data.conversations}
          chatHref={`${copy.workspaceBase}/chat`}
        />
        <VelocityPanel days={data.velocity} />
      </div>
      <SalesPipeline
        value={data.pipelineValue}
        columns={data.pipeline}
        leadsHref={`${copy.workspaceBase}/leads`}
      />
      <div className="flex flex-col items-center justify-between gap-2 pb-4 text-[11px] text-on-surface-variant sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-success" />
          <span>DIUK Enterprise Intelligence Active • WhatsApp Business Cloud</span>
        </div>
        <div className="flex items-center gap-4 font-mono">
          <span>LATENCY: 42ms</span>
          <span>UPTIME: 99.98%</span>
          <span>ENCRYPTION: AES-256</span>
        </div>
      </div>
    </div>
  );
}
