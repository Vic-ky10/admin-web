"use client";

import { useRef } from "react";
import { Search } from "lucide-react";

import { ATTENDANCE_STATUS } from "../attendance.types";
import { Employee } from "@/features/employee/employee.types";
import { DEPARTMENTS } from "@/features/employee/employee.constants";

interface AdminAttendanceFiltersProps {
  employees: Employee[];
  defaultValues: {
    profileId?: string;
    date?: string;
    status?: string;
    search?: string;
    department?: string;
  };
}

export default function AdminAttendanceFilters({
  employees,
  defaultValues,
}: AdminAttendanceFiltersProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const submitForm = () => {
    formRef.current?.requestSubmit();
  };

  const handleSearchChange = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      formRef.current?.requestSubmit();
    }, 500);
  };

  return (
    <form
      ref={formRef}
      className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2 xl:grid-cols-5"
    >
      {/* Search */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          Search
        </label>

        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            name="search"
            defaultValue={defaultValues.search}
            placeholder="Search employee..."
            onChange={handleSearchChange}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Employee */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          Employee
        </label>

        <select
          name="profileId"
          defaultValue={defaultValues.profileId}
          onChange={submitForm}
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

      {/* Department */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          Department
        </label>

        <select
          name="department"
          defaultValue={defaultValues.department}
          onChange={submitForm}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">All Departments</option>

          {DEPARTMENTS.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          Date
        </label>

        <input
          type="date"
          name="date"
          defaultValue={defaultValues.date}
          onChange={submitForm}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* Status */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          Status
        </label>

        <select
          name="status"
          defaultValue={defaultValues.status}
          onChange={submitForm}
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
    </form>
  );
}