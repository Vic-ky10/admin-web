"use client";

import { User } from "lucide-react";
import Modal from "@/components/ui/Modal";

import {
  LeaveRequest,
  LeaveRequestWithEmployee,
} from "../leave.types";
import { formatDate } from "../leave.utils";
import LeaveStatusBadge from "./LeaveStatusBadge";

interface LeaveDetailsModalProps {
  leave: LeaveRequest | LeaveRequestWithEmployee | null;
  open: boolean;
  onClose: () => void;
  showEmployee?: boolean;
}

export default function LeaveDetailsModal({
  leave,
  open,
  onClose,
  showEmployee = false,
}: LeaveDetailsModalProps) {
  if (!leave) {
    return null;
  }

  const employee = "employee" in leave ? leave.employee ?? null : null;

  return (
    <Modal open={open} title="Leave Request Details" onClose={onClose}>
      <div className="space-y-6">
        
        {/* Employee Section */}
        {showEmployee && employee && (
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              Employee Profile
            </h3>
            <div className="flex flex-col sm:flex-row items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 shadow-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                <User className="h-6 w-6" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 flex-1 w-full">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Name</p>
                  <p className="text-sm font-semibold text-slate-900">{employee.full_name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Employee ID</p>
                  <p className="text-sm font-semibold text-slate-900">{employee.employee_id}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Email</p>
                  <p className="text-sm font-medium text-slate-600 break-all">{employee.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Department</p>
                  <p className="text-sm font-medium text-slate-600">{employee.department || "-"}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Leave Details Section */}
        <section>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
            Leave Information
          </h3>
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden text-sm">
            <div className="grid grid-cols-2 gap-px  sm:grid-cols-3">
              <InfoBox label="Leave Type" value={leave.leave_type} />
              <div className="bg-white p-4">
                <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Status</p>
                <LeaveStatusBadge status={leave.status} />
              </div>
              <InfoBox label="Applied Date" value={formatDate(leave.created_at)} />
              <InfoBox 
                label="Leave Period" 
                value={`${formatDate(leave.start_date)} - ${formatDate(leave.end_date)}`} 
                className="col-span-2 sm:col-span-1"
              />
              <InfoBox 
                label="Total Days" 
                value={`${leave.total_days} ${leave.total_days === 1 ? "Day" : "Days"} (${leave.leave_duration})`} 
                className="col-span-2 sm:col-span-1"
              />
            </div>
            
            <div className="border-t border-slate-100 p-4">
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Reason</p>
              <p className="whitespace-pre-line leading-relaxed text-slate-700">
                {leave.reason || "No reason provided."}
              </p>
            </div>
          </div>
        </section>

        {/* Review Section */}
        {leave.review_comment && (
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              Admin Review
            </h3>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase text-amber-600/70 mb-1">Comment</p>
              <p className="whitespace-pre-line leading-relaxed text-amber-900 text-sm">
                {leave.review_comment}
              </p>
            </div>
          </section>
        )}

      </div>
    </Modal>
  );
}

function InfoBox({ label, value, className = "" }: { label: string; value: string | null; className?: string }) {
  return (
    <div className={`bg-white p-4 ${className}`}>
      <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">{label}</p>
      <p className="font-medium text-slate-900">{value || "-"}</p>
    </div>
  );
}