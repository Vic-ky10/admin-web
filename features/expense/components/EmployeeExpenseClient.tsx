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

import { deleteExpenseAction } from "../expense.action";
import {
  EXPENSE_STATUS,
  Expense,
  ExpenseStatus,
  PAYMENT_STATUS,
  PaymentStatus,
} from "../expense.types";
import ExpenseDetailsModal from "./ExpenseDetailsModal";
import ExpenseForm from "./ExpenseForm";
import {
  ExpenseStatusBadge,
  PaymentStatusBadge,
} from "./ExpenseStatusBadge";

interface EmployeeExpenseClientProps {
  expenses: Expense[];
  selectedStatus?: ExpenseStatus | "";
  selectedPaymentStatus?: PaymentStatus | "";
}

export default function EmployeeExpenseClient({
  expenses,
  selectedStatus = "",
  selectedPaymentStatus = "",
}: EmployeeExpenseClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] =
    useState<Expense | null>(null);
  const [selectedExpense, setSelectedExpense] =
    useState<Expense | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleFilterChange(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    const query = params.toString();
    router.push(`/employee/expenses${query ? `?${query}` : ""}`);
  }

  function openCreateForm() {
    setEditingExpense(null);
    setFormOpen(true);
  }

  function openEditForm(expense: Expense) {
    setEditingExpense(expense);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingExpense(null);
  }

  function handleDelete(expenseId: string) {
    setPendingId(expenseId);
    startTransition(async () => {
      const result = await deleteExpenseAction(expenseId);
      setPendingId(null);

      if (!result.success) {
        toast.error(result.error ?? "Unable to delete expense.");
        return;
      }

      toast.success(result.message ?? "Expense deleted.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-end lg:justify-between">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Request Status</label>
            <select
              value={selectedStatus}
              onChange={(event) =>
                handleFilterChange("status", event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 sm:w-56"
            >
              <option value="">All Statuses</option>
              {Object.values(EXPENSE_STATUS).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Payment Status</label>
            <select
              value={selectedPaymentStatus}
              onChange={(event) =>
                handleFilterChange("paymentStatus", event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 sm:w-56"
            >
              <option value="">All Payments</option>
              {Object.values(PAYMENT_STATUS).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button type="button" onClick={openCreateForm}>
          Add Expense
        </Button>
      </div>

      {expenses.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold">No expenses found</h2>
          <p className="mt-1 text-slate-500">
            Submitted expenses will appear here.
          </p>
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Code</TableHeader>
              <TableHeader>Category</TableHeader>
              <TableHeader>Date</TableHeader>
              <TableHeader>Amount</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Payment</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{expense.expense_code}</TableCell>
                <TableCell>{expense.expense_type}</TableCell>
                <TableCell>{formatDate(expense.expense_date)}</TableCell>
                <TableCell>
                  {formatMoney(expense.amount, expense.currency)}
                </TableCell>
                <TableCell>
                  <ExpenseStatusBadge status={expense.status} />
                </TableCell>
                <TableCell>
                  <PaymentStatusBadge status={expense.payment_status} />
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setSelectedExpense(expense)}
                    >
                      View
                    </Button>
                    {expense.status === EXPENSE_STATUS.PENDING && (
                      <>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => openEditForm(expense)}
                        >
                          Edit
                        </Button>
                        <LoadingButton
                          type="button"
                          variant="danger"
                          loading={isPending && pendingId === expense.id}
                          onClick={() => handleDelete(expense.id)}
                        >
                          Delete
                        </LoadingButton>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal
        open={formOpen}
        title={editingExpense ? "Edit Expense" : "Add Expense"}
        onClose={closeForm}
      >
        <ExpenseForm
          expense={editingExpense}
          onSuccess={closeForm}
          onCancel={closeForm}
        />
      </Modal>

      <ExpenseDetailsModal
        expense={selectedExpense}
        open={selectedExpense !== null}
        onClose={() => setSelectedExpense(null)}
      />
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
