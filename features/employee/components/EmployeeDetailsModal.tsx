"use client";

import { User } from "lucide-react";
import Modal from "@/components/ui/Modal";

import { Employee } from "../employee.types";

interface EmployeeDetailsModalProps {
  employee: Employee | null;
  open: boolean;
  onClose: () => void;
}

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default function EmployeeDetailsModal({
  employee,
  open,
  onClose,
}: EmployeeDetailsModalProps) {
  if (!employee) {
    return null;
  }

  return (
    <Modal
      open={open}
      title="Employee Details"
      onClose={onClose}
    >
      <div className="space-y-6">
        {/* Employee Section */}
        <section>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
            Profile
          </h3>
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 shadow-sm">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 overflow-hidden">
              {employee.avatar_url ? (
                <img src={employee.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <User className="h-7 w-7" />
              )}
            </div>
            <div>
              <p className="text-base font-bold text-slate-900">{employee.full_name}</p>
              <p className="text-sm font-semibold text-slate-500">{employee.employee_id}</p>
            </div>
            <div className="ml-auto flex flex-col items-end gap-1">
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  employee.is_online
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {employee.is_online ? "Online" : "Offline"}
              </span>
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  employee.status === "Active" || employee.status === "ACTIVE"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {employee.status}
              </span>
            </div>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Details Section */}
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              Details
            </h3>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
              <DetailRow label="Email" value={employee.email} />
              <DetailRow label="Phone" value={employee.phone} />
              <DetailRow label="Department" value={employee.department} />
              <DetailRow label="Designation" value={employee.designation} />
              <DetailRow label="Role" value={employee.role} />
              <DetailRow label="Joined Date" value={formatDate(employee.joined_date)} />
            </div>
          </section>

          {/* Activity Section */}
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              Activity
            </h3>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
              <DetailRow label="Last Login" value={formatDate(employee.last_login)} />
              <DetailRow label="Created Date" value={formatDate(employee.created_at)} />
              <DetailRow label="Updated Date" value={formatDate(employee.updated_at)} />
            </div>
          </section>
        </div>
      </div>
    </Modal>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-900 break-words">{value || "-"}</p>
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return dateFormatter.format(date);
}
