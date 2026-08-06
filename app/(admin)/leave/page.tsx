import AdminLeaveClient from "@/features/leave/components/AdminLeaveClient";
import { getLeaveRequests } from "@/features/leave/leave.service";
import { LeaveFilters } from "@/features/leave/leave.types";
import { leaveFiltersSchema } from "@/features/leave/leave.validation";
import { getEmployees } from "@/features/employee/employee.service";
import PageHeader from "@/components/layout/PageHeader";

export const dynamic = "force-dynamic";

interface AdminLeavePageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function AdminLeavePage({
  searchParams,
}: AdminLeavePageProps) {
  const params = await searchParams;
  const filters = leaveFiltersSchema.parse({
    profileId: params.profileId,
    status: params.status,
  }) as LeaveFilters;
  const [employees, leaves] = await Promise.all([
    getEmployees(),
    getLeaveRequests({}),
  ]);

  return (
    <div className="space-y-6 max-w-[1920px] mx-auto animate-fade-in">
      <PageHeader
        title="Leave Management"
        description="Review time-off applications, approve leave requests, and track balances."
        breadcrumbs={[{ label: "Admin", href: "/dashboard" }, { label: "Leave" }]}
      />

      <AdminLeaveClient
        leaves={leaves}
        employees={employees}
        selectedProfileId={filters.profileId}
        selectedStatus={filters.status}
      />
    </div>
  );
}
