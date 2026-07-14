import { redirect } from "next/navigation";

import EmployeeLeaveClient from "@/features/leave/components/EmployeeLeaveClient";
import { getEmployeeLeaveRequests } from "@/features/leave/leave.service";
import { LeaveFilters } from "@/features/leave/leave.types";
import { leaveFiltersSchema } from "@/features/leave/leave.validation";
import { getCurrentEmployeeProfile } from "@/features/employee-portal/employee-portal.service";

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
  const leaves = await getEmployeeLeaveRequests(profile.id, filters);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Leave Management</h1>
        <p className="text-slate-500">
          Apply leave, view history, and manage pending requests.
        </p>
      </div>

      <EmployeeLeaveClient
        leaves={leaves}
        selectedStatus={filters.status}
      />
    </div>
  );
}
