"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import LoadingButton from "@/components/feedback/LoadingButton";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

import {
  markIncentivePaidAction,
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

  return (
    <Modal open={open} title="Review Incentive" onClose={onClose}>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Detail label="Employee" value={incentive.employee?.full_name} />
          <Detail
            label="Employee ID"
            value={incentive.employee?.employee_id}
          />
          <Detail label="Code" value={incentive.incentive_code} />
          <Detail label="Type" value={incentive.incentive_type} />
          <Detail label="Title" value={incentive.title} />
          <Detail label="Amount" value={formatMoney(incentive.amount)} />
          <div>
            <p className="text-sm font-medium text-slate-500">Status</p>
            <div className="mt-1">
              <IncentiveStatusBadge status={incentive.status} />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Payment</p>
            <div className="mt-1">
              <PaymentStatusBadge status={incentive.payment_status} />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-sm text-slate-700">{incentive.description}</p>
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
          {incentive.status === INCENTIVE_STATUS.PENDING && (
            <>
              <LoadingButton
                type="button"
                variant="danger"
                loading={isPending}
                onClick={() => handleReview(INCENTIVE_STATUS.REJECTED)}
              >
                Reject
              </LoadingButton>
              <LoadingButton
                type="button"
                loading={isPending}
                onClick={() => handleReview(INCENTIVE_STATUS.APPROVED)}
              >
                Approve
              </LoadingButton>
            </>
          )}
          {incentive.status === INCENTIVE_STATUS.APPROVED &&
            incentive.payment_status === INCENTIVE_PAYMENT_STATUS.PENDING && (
              <LoadingButton
                type="button"
                variant="secondary"
                loading={isPending}
                onClick={handleMarkPaid}
              >
                Mark Paid
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
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">
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
