"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import LoadingButton from "@/components/feedback/LoadingButton";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

import { cancelLeaveAction } from "../leave.actions";
import { LEAVE_STATUS, LeaveRequest } from "../leave.types";
import { formatDate } from "../leave.utils";
import LeaveDetailsModal from "./LeaveDetailsModal";
import LeaveRequestForm from "./LeaveRequestForm";
import LeaveStatusBadge from "./LeaveStatusBadge";
import { Filter } from "lucide-react";

interface EmployeeLeaveClientProps {
  leaves: LeaveRequest[];
  selectedStatus?: string;
}

export default function EmployeeLeaveClient({
  leaves,
  selectedStatus = "",
}: EmployeeLeaveClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [applyOpen, setApplyOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] =
    useState<LeaveRequest | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(status: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }

    router.push(`/employee/leave?${params.toString()}`);
  }

  function handleCancel(leaveRequestId: string) {
    setPendingId(leaveRequestId);
    startTransition(async () => {
      const result = await cancelLeaveAction({ leaveRequestId });
      setPendingId(null);

      if (!result.success) {
        toast.error(result.error ?? "Unable to cancel leave request.");
        return;
      }

      toast.success(result.message ?? "Leave request cancelled.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
     
<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
  <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Filter className="h-4 w-4 text-emerald-600" />
        Filter by Status
      </label>

      <select
        value={selectedStatus}
        onChange={(event) => handleStatusChange(event.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 lg:w-64"
      >
        <option value="">All Statuses</option>

        {Object.values(LEAVE_STATUS).map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </div>

    <Button
      type="button"
      onClick={() => setApplyOpen(true)}
      className="w-full lg:w-auto"
    >
      Apply Leave
    </Button>
  </div>
</div>

      {leaves.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold">No leave requests found</h2>
          <p className="mt-1 text-slate-500">
            Submitted leave requests will appear here.
          </p>
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Type</TableHeader>
              <TableHeader>Dates</TableHeader>
              <TableHeader>Total Days</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaves.map((leave) => (
              <TableRow key={leave.id}>
                <TableCell>{leave.leave_type}</TableCell>
                <TableCell>
                  {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                </TableCell>
                <TableCell>{leave.total_days}</TableCell>
                <TableCell>
                  <LeaveStatusBadge status={leave.status} />
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setSelectedLeave(leave)}
                    >
                      View
                    </Button>
                    {leave.status === LEAVE_STATUS.PENDING && (
                      <LoadingButton
                        type="button"
                        variant="danger"
                        loading={isPending && pendingId === leave.id}
                        onClick={() => handleCancel(leave.id)}
                      >
                        Cancel
                      </LoadingButton>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal
        open={applyOpen}
        title="Apply Leave"
        onClose={() => setApplyOpen(false)}
      >
        <LeaveRequestForm
          onSuccess={() => setApplyOpen(false)}
          onCancel={() => setApplyOpen(false)}
        />
      </Modal>

      <LeaveDetailsModal
        leave={selectedLeave}
        open={selectedLeave !== null}
        onClose={() => setSelectedLeave(null)}
      />
    </div>
  );
}
