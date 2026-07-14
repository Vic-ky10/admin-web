"use client";

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

  const employee =
    "employee" in leave ? leave.employee ?? null : null;

  return (
    <Modal open={open} title="Leave Details" onClose={onClose}>
      <div className="grid gap-4 md:grid-cols-2">
        {showEmployee && employee && (
          <>
            <DetailItem label="Employee" value={employee.full_name} />
            <DetailItem label="Employee ID" value={employee.employee_id} />
          </>
        )}
        <DetailItem label="Leave Type" value={leave.leave_type} />
        <DetailItem label="Duration" value={leave.leave_duration} />
        <DetailItem
          label="Half Day Session"
          value={leave.half_day_session}
        />
        <DetailItem label="Start Date" value={formatDate(leave.start_date)} />
        <DetailItem label="End Date" value={formatDate(leave.end_date)} />
        <DetailItem
          label="Total Days"
          value={leave.total_days.toString()}
        />
        <div>
          <p className="text-sm font-medium text-slate-500">Status</p>
          <div className="mt-1">
            <LeaveStatusBadge status={leave.status} />
          </div>
        </div>
        <DetailItem
          label="Review Comment"
          value={leave.review_comment}
        />
        <div className="md:col-span-2">
          <p className="text-sm font-medium text-slate-500">Reason</p>
          <p className="mt-1 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-slate-800">
            {leave.reason}
          </p>
        </div>
      </div>
    </Modal>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">
        {value || "Not available"}
      </p>
    </div>
  );
}
