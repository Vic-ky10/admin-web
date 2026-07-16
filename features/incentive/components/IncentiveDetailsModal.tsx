"use client";

import Modal from "@/components/ui/Modal";

import {
  Incentive,
  IncentiveWithEmployee,
} from "../incentive.types";
import IncentiveStatusBadge from "./IncentiveStatusBadge";
import PaymentStatusBadge from "./PaymentStatusBadge";

interface IncentiveDetailsModalProps {
  incentive: Incentive | IncentiveWithEmployee | null;
  open: boolean;
  onClose: () => void;
}

export default function IncentiveDetailsModal({
  incentive,
  open,
  onClose,
}: IncentiveDetailsModalProps) {
  if (!incentive) {
    return null;
  }

  const withEmployee = incentive as IncentiveWithEmployee;

  return (
    <Modal open={open} title="Incentive Details" onClose={onClose}>
      <div className="grid gap-4 md:grid-cols-2">
        {"employee" in incentive && (
          <>
            <DetailItem
              label="Employee"
              value={withEmployee.employee?.full_name ?? null}
            />
            <DetailItem
              label="Employee ID"
              value={withEmployee.employee?.employee_id ?? null}
            />
          </>
        )}
        <DetailItem label="Incentive Code" value={incentive.incentive_code} />
        <DetailItem label="Type" value={incentive.incentive_type} />
        <DetailItem label="Title" value={incentive.title} />
        <DetailItem
          label="Amount"
          value={formatMoney(incentive.amount)}
        />
        <DetailItem
          label="Month / Year"
          value={`${getMonthName(incentive.month)} ${incentive.year}`}
        />
        <DetailItem
          label="Created On"
          value={formatDate(incentive.created_at)}
        />
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
        <DetailItem
          label="Approved By"
          value={withEmployee.approver?.full_name ?? incentive.approved_by}
        />
        <DetailItem
          label="Approved At"
          value={
            incentive.approved_at
              ? formatDate(incentive.approved_at)
              : null
          }
        />
        <DetailItem
          label="Paid At"
          value={incentive.paid_at ? formatDate(incentive.paid_at) : null}
        />
        <div className="md:col-span-2">
          <p className="text-sm font-medium text-slate-500">Description</p>
          <p className="mt-1 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-slate-800">
            {incentive.description}
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
      <p className="mt-1 break-words font-semibold text-slate-900">
        {value || "Not available"}
      </p>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function getMonthName(month: number) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
  }).format(new Date(2024, month - 1, 1));
}
