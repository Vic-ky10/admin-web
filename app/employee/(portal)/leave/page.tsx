import { redirect } from "next/navigation";
import EmployeeLeaveClient from "@/features/leave/components/EmployeeLeaveClient";
import { getEmployeeLeaveRequests } from "@/features/leave/leave.service";
import { LeaveFilters } from "@/features/leave/leave.types";
import { leaveFiltersSchema } from "@/features/leave/leave.validation";
import { getCurrentEmployeeProfile } from "@/features/employee-portal/employee-portal.service";
import PageHeader from "@/components/layout/PageHeader";

export const dynamic = "force-dynamic";

interface EmployeeLeavePageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function EmployeeLeavePage({
  searchParams,
}: EmployeeLeavePageProps) {
  const profile = await getCurrentEmployeeProfile();

  if (!profile) {
    redirect("/employee/login");
  }

  const params = await searchParams;
  const filters = leaveFiltersSchema.parse({
    status: params.status,
  }) as LeaveFilters;
  const leaves = await getEmployeeLeaveRequests(profile.id, {});

  return (
    <div className="space-y-6 max-w-[1920px] mx-auto animate-fade-in">
      <PageHeader
        title="My Leaves"
        description="Apply for leave, view status updates, and track time-off balances."
        breadcrumbs={[{ label: "Portal", href: "/employee/dashboard" }, { label: "Leave" }]}
      />

      <EmployeeLeaveClient
        leaves={leaves}
        selectedStatus={filters.status}
      />
    </div>
  );
}
