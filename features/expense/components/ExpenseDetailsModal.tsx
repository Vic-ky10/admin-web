"use client";

import Modal from "@/components/ui/Modal";

import { Expense } from "../expense.types";
import {
  ExpenseStatusBadge,
  PaymentStatusBadge,
} from "./ExpenseStatusBadge";

interface ExpenseDetailsModalProps {
  expense: Expense | null;
  open: boolean;
  onClose: () => void;
}

export default function ExpenseDetailsModal({
  expense,
  open,
  onClose,
}: ExpenseDetailsModalProps) {
  if (!expense) {
    return null;
  }

  return (
    <Modal open={open} title="Expense Details" onClose={onClose}>
      <div className="grid gap-4 md:grid-cols-2">
        <DetailItem label="Expense Code" value={expense.expense_code} />
        <DetailItem label="Category" value={expense.expense_type} />
        <DetailItem
          label="Expense Date"
          value={formatDate(expense.expense_date)}
        />
        <DetailItem
          label="Submitted On"
          value={formatDate(expense.created_at)}
        />
        <DetailItem
          label="Claim Amount"
          value={formatMoney(expense.amount, expense.currency)}
        />
        <DetailItem
          label="Approved Amount"
          value={
            expense.approved_amount === null
              ? null
              : formatMoney(expense.approved_amount, expense.currency)
          }
        />
        <div>
          <p className="text-sm font-medium text-slate-500">Status</p>
          <div className="mt-1">
            <ExpenseStatusBadge status={expense.status} />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Payment</p>
          <div className="mt-1">
            <PaymentStatusBadge status={expense.payment_status} />
          </div>
        </div>
        <DetailItem label="Receipt URL" value={expense.receipt_url} />
        <DetailItem
          label="Review Comment"
          value={expense.review_comment}
        />
        <div className="md:col-span-2">
          <p className="text-sm font-medium text-slate-500">Description</p>
          <p className="mt-1 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-slate-800">
            {expense.description}
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

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}
