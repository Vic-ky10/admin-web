"use client";

import Input from "@/components/ui/Input";
import { SalesArea } from "../sales.types";
import { Employee } from "@/features/employee/employee.types";

interface SalesFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  areaId: string;
  setAreaId: (val: string) => void;
  employeeId: string;
  setEmployeeId: (val: string) => void;
  status?: string;
  setStatus?: (val: string) => void;
  salesAreas: SalesArea[];
  employees: Employee[];
  statusOptions?: string[];
  placeholder?: string;
}

export default function SalesFilters({
  search,
  setSearch,
  areaId,
  setAreaId,
  employeeId,
  setEmployeeId,
  status,
  setStatus,
  salesAreas,
  employees,
  statusOptions = ["Active", "Inactive", "Blocked"],
  placeholder = "Search...",
}: SalesFiltersProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-end">
      {/* Search Input */}
      <div className="flex-1">
        <Input
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Sales Area Select */}
      <div className="w-full md:w-48 space-y-1">
        <label className="text-xs font-semibold text-slate-500">Sales Area</label>
        <select
          value={areaId}
          onChange={(e) => setAreaId(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-sm h-[42px]"
        >
          <option value="">All Areas</option>
          {salesAreas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.area_name}
            </option>
          ))}
        </select>
      </div>

      {/* Assigned Employee Select */}
      <div className="w-full md:w-48 space-y-1">
        <label className="text-xs font-semibold text-slate-500">Employee</label>
        <select
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-sm h-[42px]"
        >
          <option value="">All Employees</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.full_name}
            </option>
          ))}
        </select>
      </div>

      {/* Status Select (Optional) */}
      {setStatus && (
        <div className="w-full md:w-42 space-y-1">
          <label className="text-xs font-semibold text-slate-500">Status</label>
          <select
            value={status || ""}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-sm h-[42px]"
          >
            <option value="">All Statuses</option>
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
