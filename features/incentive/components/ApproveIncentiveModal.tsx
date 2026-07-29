"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import LoadingButton from "@/components/feedback/LoadingButton";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

import {
  markIncentivePaidAction,
  markIncentivePendingAction,
  reviewIncentiveAction,
} from "../incentive.action";
import {
  INCENTIVE_PAYMENT_STATUS,
  INCENTIVE_STATUS,
  IncentiveWithEmployee,
} from "../incentive.types";
import IncentiveStatusBadge from "./IncentiveStatusBadge";
import PaymentStatusBadge from "./PaymentStatusBadge";

interface ApproveIncentiveModalProps {
  open: boolean;
  incentive: IncentiveWithEmployee | null;
  onClose: () => void;
}

export default function ApproveIncentiveModal({
  open,
  incentive,
  onClose,
}: ApproveIncentiveModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!incentive) {
    return null;
  }

  const currentIncentive = incentive;

  function handleReview(
    status:
      | typeof INCENTIVE_STATUS.APPROVED
      | typeof INCENTIVE_STATUS.REJECTED,
  ) {
    startTransition(async () => {
      const result = await reviewIncentiveAction({
        incentiveId: currentIncentive.id,
        status,
      });

      if (!result.success) {
        toast.error(result.error ?? "Unable to review incentive.");
        return;
      }

      toast.success(result.message ?? "Incentive reviewed.");
      onClose();
      router.refresh();
    });
  }

  function handleMarkPaid() {
    startTransition(async () => {
      const result = await markIncentivePaidAction(currentIncentive.id);

      if (!result.success) {
        toast.error(result.error ?? "Unable to update payment.");
        return;
      }

      toast.success(result.message ?? "Incentive marked as paid.");
      onClose();
      router.refresh();
    });
  }

  function handleMarkPending() {
    startTransition(async () => {
      const result = await markIncentivePendingAction(currentIncentive.id);

      if (!result.success) {
        toast.error(result.error ?? "Unable to update payment.");
        return;
      }

      toast.success(result.message ?? "Incentive marked as pending.");
      onClose();
      router.refresh();
    });
  }

  return (
    <Modal open={open} title="Review Incentive" onClose={onClose}>
      <div className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2">
          <Detail
            label="Employee"
            value={incentive.employee?.full_name}
          />

          <Detail
            label="Employee ID"
            value={incentive.employee?.employee_id}
          />

          <Detail
            label="Incentive Code"
            value={incentive.incentive_code}
          />

          <Detail
            label="Incentive Type"
            value={incentive.incentive_type}
          />

          <Detail
            label="Title"
            value={incentive.title}
          />

          <Detail
            label="Amount"
            value={formatMoney(incentive.amount)}
          />

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </p>

            <div className="mt-3">
              <IncentiveStatusBadge status={incentive.status} />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Payment Status
            </p>

            <div className="mt-3">
              <PaymentStatusBadge
                status={incentive.payment_status}
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Description
            </p>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="whitespace-pre-line leading-7 text-slate-700">
                {incentive.description || "No description available."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Close
          </Button>

          {incentive.status === INCENTIVE_STATUS.PENDING && (
            <>
              <LoadingButton
                type="button"
                variant="danger"
                loading={isPending}
                onClick={() =>
                  handleReview(INCENTIVE_STATUS.REJECTED)
                }
              >
                Reject
              </LoadingButton>

              <LoadingButton
                type="button"
                loading={isPending}
                onClick={() =>
                  handleReview(INCENTIVE_STATUS.APPROVED)
                }
              >
                Approve
              </LoadingButton>
            </>
          )}

          {incentive.status === INCENTIVE_STATUS.APPROVED &&
            incentive.payment_status ===
              INCENTIVE_PAYMENT_STATUS.PENDING && (
              <LoadingButton
                type="button"
                variant="secondary"
                loading={isPending}
                onClick={handleMarkPaid}
              >
                Mark Paid
              </LoadingButton>
            )}

          {incentive.status === INCENTIVE_STATUS.APPROVED &&
            incentive.payment_status ===
              INCENTIVE_PAYMENT_STATUS.PAID && (
              <LoadingButton
                type="button"
                variant="secondary"
                loading={isPending}
                onClick={handleMarkPending}
              >
                Mark Pending
              </LoadingButton>
            )}
        </div>
      </div>
    </Modal>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-[15px] font-semibold text-slate-900">
        {value || "Not available"}
      </p>
    </div>
  );
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}