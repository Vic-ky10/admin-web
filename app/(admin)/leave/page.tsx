import AdminLeaveClient from "@/features/leave/components/AdminLeaveClient";
import { getLeaveRequests } from "@/features/leave/leave.service";
import { LeaveFilters } from "@/features/leave/leave.types";
import { leaveFiltersSchema } from "@/features/leave/leave.validation";
import { getEmployees } from "@/features/employee/employee.service";

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
    getLeaveRequests(filters),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Leave Management</h1>
        <p className="text-slate-500">
          Review employee leave requests and record decisions.
        </p>
      </div>

      <AdminLeaveClient
        leaves={leaves}
        employees={employees}
        selectedProfileId={filters.profileId}
        selectedStatus={filters.status}
      />
    </div>
  );
}
