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
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <label className="text-sm font-medium">Filter by Status</label>
          <select
            value={selectedStatus}
            onChange={(event) => handleStatusChange(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 md:w-56"
          >
            <option value="">All Statuses</option>
            {Object.values(LEAVE_STATUS).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <Button type="button" onClick={() => setApplyOpen(true)}>
          Apply Leave
        </Button>
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
