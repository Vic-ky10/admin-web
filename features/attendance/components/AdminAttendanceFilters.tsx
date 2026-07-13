import Button from "@/components/ui/Button";

import { ATTENDANCE_STATUS } from "../attendance.types";
import { Employee } from "@/features/employee/employee.types";

interface AdminAttendanceFiltersProps {
  employees: Employee[];
  defaultValues: {
    profileId?: string;
    date?: string;
    status?: string;
    search?: string;
  };
}

export default function AdminAttendanceFilters({
  employees,
  defaultValues,
}: AdminAttendanceFiltersProps) {
  return (
    <form className="grid gap-4 rounded-xl border bg-white p-5 md:grid-cols-5">
      <input
        name="search"
        defaultValue={defaultValues.search}
        placeholder="Search employees"
        className="rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
      />

      <select
        name="profileId"
        defaultValue={defaultValues.profileId}
        className="rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
      >
        <option value="">All employees</option>
        {employees.map((employee) => (
          <option
            key={employee.id}
            value={employee.id}
          >
            {employee.full_name} ({employee.employee_id})
          </option>
        ))}
      </select>

      <input
        name="date"
        type="date"
        defaultValue={defaultValues.date}
        className="rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
      />

      <select
        name="status"
        defaultValue={defaultValues.status}
        className="rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
      >
        <option value="">All statuses</option>
        {Object.values(ATTENDANCE_STATUS).map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>

      <Button type="submit">Apply Filters</Button>
    </form>
  );
}
