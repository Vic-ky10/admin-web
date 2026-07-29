import Button from "@/components/ui/Button";
import { ATTENDANCE_STATUS } from "../attendance.types";
import { Employee } from "@/features/employee/employee.types";
import { Search } from "lucide-react";

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
    <form className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2 xl:grid-cols-5">
      {/* Search */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Search</label>

        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            name="search"
            defaultValue={defaultValues.search}
            placeholder="        Search employee..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Employee */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Employee</label>

        <select
          name="profileId"
          defaultValue={defaultValues.profileId}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">All Employees</option>

          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.full_name} ({employee.employee_id})
            </option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Date</label>

        <input
          type="date"
          name="date"
          defaultValue={defaultValues.date}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* Status */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Status</label>

        <select
          name="status"
          defaultValue={defaultValues.status}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">All Statuses</option>

          {Object.values(ATTENDANCE_STATUS).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Button */}
      <div className="flex items-end">
        <Button type="submit" className="h-11 w-full rounded-xl">
          Apply Filters
        </Button>
      </div>
    </form>
  );
}
