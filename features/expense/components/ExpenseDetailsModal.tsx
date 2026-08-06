"use client";

import Modal from "@/components/ui/Modal";
import { Expense } from "../expense.types";
import {
  ExpenseStatusBadge,
  PaymentStatusBadge,
} from "./ExpenseStatusBadge";
import { EmployeeProfile } from "@/features/employee-portal/employee-portal.types";
import { File, ExternalLink, Download } from "lucide-react";

interface ExpenseDetailsModalProps {
  expense: Expense | null;
  profile?: EmployeeProfile; // Optional to support existing calls if any
  open: boolean;
  onClose: () => void;
}

export default function ExpenseDetailsModal({
  expense,
  profile,
  open,
  onClose,
}: ExpenseDetailsModalProps) {
  if (!expense) return null;

  return (
    <Modal open={open} title="Expense Details" onClose={onClose}>
      <div className="space-y-6">
        
        {/* Employee Information */}
        {profile && (
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Employee Avatar"
                className="h-14 w-14 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600">
                {profile.full_name?.[0] || "E"}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {profile.full_name}
              </p>
              <p className="text-xs text-slate-500">
                {profile.employee_id} • {profile.department || "No Department"}
              </p>
            </div>
          </div>
        )}

        {/* Expense Information */}
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <DetailItem label="Expense Code" value={expense.expense_code} />
          <DetailItem label="Type" value={expense.expense_type} />
          <DetailItem
            label="Amount"
            value={formatMoney(expense.amount, expense.currency)}
          />
          <DetailItem
            label="Date"
            value={formatDate(expense.expense_date)}
          />
          <DetailItem
            label="Submitted On"
            value={formatDate(expense.created_at)}
          />
          <DetailItem
            label="Approved Amount"
            value={
              expense.approved_amount === null
                ? "-"
                : formatMoney(expense.approved_amount, expense.currency)
            }
          />
        </div>

        {/* Description */}
        {expense.description && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500 mb-2">Description</p>
            <p className="whitespace-pre-line text-sm text-slate-800 leading-relaxed">
              {expense.description}
            </p>
          </div>
        )}

        {/* Receipt Attachment */}
        {expense.receipt_url && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Receipt Attachment</span>
            </div>

            <div className="flex items-center gap-4">
              {expense.receipt_type?.includes("pdf") ||
              expense.receipt_url.toLowerCase().endsWith(".pdf") ? (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-600 font-bold text-xs border border-blue-200">
                  PDF
                </div>
              ) : (
                <img
                  src={expense.receipt_url}
                  alt="Receipt Preview"
                  className="h-14 w-14 rounded-xl border border-slate-200 object-cover bg-white"
                />
              )}

              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {expense.receipt_name ||
                    (expense.receipt_url.toLowerCase().endsWith(".pdf")
                      ? "Receipt Document"
                      : "Receipt Image")}
                </p>
                <p className="text-xs text-slate-500">
                  {expense.receipt_type?.includes("pdf") ||
                  expense.receipt_url.toLowerCase().endsWith(".pdf")
                    ? "PDF Document"
                    : "Image File"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
              <a
                href={expense.receipt_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
              >
                <ExternalLink size={16} />
                {expense.receipt_url.toLowerCase().endsWith(".pdf")
                  ? "Open PDF"
                  : "View Image"}
              </a>
              <a
                href={expense.receipt_url}
                download={expense.receipt_name || "receipt"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-300"
              >
                <Download size={16} />
                Download
              </a>
            </div>
          </div>
        )}

        {/* Review Information */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Approval Status</p>
              <ExpenseStatusBadge status={expense.status} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Payment Status</p>
              <PaymentStatusBadge status={expense.payment_status} />
            </div>
          </div>

          {expense.review_comment && (
            <div className="pt-4 border-t border-slate-100">
              <p className="text-sm font-medium text-slate-500 mb-2">Admin Remarks</p>
              <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100">
                {expense.review_comment}
              </p>
            </div>
          )}
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
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900 break-words">
        {value || "-"}
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
