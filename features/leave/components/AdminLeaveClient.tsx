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
import { Employee } from "@/features/employee/employee.types";

import { reviewLeaveAction } from "../leave.actions";
import {
  LEAVE_STATUS,
  LeaveRequestWithEmployee,
} from "../leave.types";
import { formatDate } from "../leave.utils";
import LeaveDetailsModal from "./LeaveDetailsModal";
import LeaveStatusBadge from "./LeaveStatusBadge";

interface AdminLeaveClientProps {
  leaves: LeaveRequestWithEmployee[];
  employees: Employee[];
  selectedProfileId?: string;
  selectedStatus?: string;
}

export default function AdminLeaveClient({
  leaves,
  employees,
  selectedProfileId = "",
  selectedStatus = "",
}: AdminLeaveClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedLeave, setSelectedLeave] =
    useState<LeaveRequestWithEmployee | null>(null);
  const [reviewLeave, setReviewLeave] =
    useState<LeaveRequestWithEmployee | null>(null);
  const [reviewStatus, setReviewStatus] = useState<
    typeof LEAVE_STATUS.APPROVED | typeof LEAVE_STATUS.REJECTED
  >(LEAVE_STATUS.APPROVED);
  const [reviewComment, setReviewComment] = useState("");
  const [isPending, startTransition] = useTransition();

  function updateFilter(key: "profileId" | "status", value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`/leave?${params.toString()}`);
  }

  function openReview(
    leave: LeaveRequestWithEmployee,
    status: typeof LEAVE_STATUS.APPROVED | typeof LEAVE_STATUS.REJECTED
  ) {
    setReviewLeave(leave);
    setReviewStatus(status);
    setReviewComment("");
  }

  function handleReview() {
    if (!reviewLeave) {
      return;
    }

    startTransition(async () => {
      const result = await reviewLeaveAction({
        leaveRequestId: reviewLeave.id,
        status: reviewStatus,
        review_comment: reviewComment,
      });

      if (!result.success) {
        toast.error(result.error ?? "Unable to review leave request.");
        return;
      }

      toast.success(result.message ?? "Leave request reviewed.");
      setReviewLeave(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Filter by Employee</label>
          <select
            value={selectedProfileId}
            onChange={(event) =>
              updateFilter("profileId", event.target.value)
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="">All Employees</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.full_name} ({employee.employee_id})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Filter by Status</label>
          <select
            value={selectedStatus}
            onChange={(event) =>
              updateFilter("status", event.target.value)
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="">All Statuses</option>
            {Object.values(LEAVE_STATUS).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {leaves.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold">No leave requests found</h2>
          <p className="mt-1 text-slate-500">
            Employee leave requests will appear here.
          </p>
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Employee</TableHeader>
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
                <TableCell>
                  <div>
                    <p className="font-semibold">
                      {leave.employee?.full_name ?? "Unknown employee"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {leave.employee?.employee_id ?? leave.profile_id}
                    </p>
                  </div>
                </TableCell>
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
                      <>
                        <Button
                          type="button"
                          onClick={() =>
                            openReview(leave, LEAVE_STATUS.APPROVED)
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          onClick={() =>
                            openReview(leave, LEAVE_STATUS.REJECTED)
                          }
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <LeaveDetailsModal
        leave={selectedLeave}
        open={selectedLeave !== null}
        onClose={() => setSelectedLeave(null)}
        showEmployee
      />

      <Modal
        open={reviewLeave !== null}
        title={`${reviewStatus} Leave Request`}
        onClose={() => setReviewLeave(null)}
      >
        <div className="space-y-5">
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="font-semibold">
              {reviewLeave?.employee?.full_name ?? "Employee"}
            </p>
            <p className="text-sm text-slate-500">
              {reviewLeave?.leave_type} •{" "}
              {reviewLeave ? formatDate(reviewLeave.start_date) : ""} -{" "}
              {reviewLeave ? formatDate(reviewLeave.end_date) : ""}
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Review Comment</label>
            <textarea
              value={reviewComment}
              onChange={(event) => setReviewComment(event.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
              placeholder="Add a review comment"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setReviewLeave(null)}
            >
              Cancel
            </Button>
            <LoadingButton
              type="button"
              variant={
                reviewStatus === LEAVE_STATUS.REJECTED
                  ? "danger"
                  : "primary"
              }
              loading={isPending}
              onClick={handleReview}
            >
              {reviewStatus}
            </LoadingButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
