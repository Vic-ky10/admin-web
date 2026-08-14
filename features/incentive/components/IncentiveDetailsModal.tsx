"use client";

import Modal from "@/components/ui/Modal";

import { Incentive, IncentiveWithEmployee } from "../incentive.types";
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
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-5 sm:px-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Incentive Details
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                View incentive and payment information
              </p>
            </div>

            <div className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-right">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Period
              </p>

              <p className="mt-0.5 text-sm font-semibold text-slate-800">
                {`${getMonthName(incentive.month)} ${incentive.year}`}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
       <div className="max-h-[70vh] overflow-y-auto px-6 py-6 sm:px-7 scrollbar-none4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

            <DetailItem
              label="Month / Year"
              value={`${getMonthName(incentive.month)} ${incentive.year}`}
            />

            {/* Status */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </p>

              <div className="mt-3">
                <IncentiveStatusBadge status={incentive.status} />
              </div>
            </div>

            {/* Payment Status */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Payment Status
              </p>

              <div className="mt-3">
                <PaymentStatusBadge status={incentive.payment_status} />
              </div>
            </div>

            {/* Approved At */}
            <DetailItem
              label="Approved At"
              value={
                incentive.approved_at
                  ? formatDate(incentive.approved_at)
                  : null
              }
            />

            {/* Paid At */}
            <DetailItem
              label="Paid At"
              value={incentive.paid_at ? formatDate(incentive.paid_at) : null}
            />

            {/* Description */}
            <div className="md:col-span-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Description
                </p>

                <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3.5">
                  <p className="whitespace-pre-line text-sm leading-6 text-slate-700">
                    {incentive.description || "No description available."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-slate-200 px-6 py-4 sm:px-7">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            Close
          </button>
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
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-words text-[15px] font-semibold text-slate-900">
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