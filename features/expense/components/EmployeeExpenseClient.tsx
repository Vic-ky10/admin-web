"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Search } from "lucide-react";

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
  EXPENSE_CATEGORY,
  EXPENSE_STATUS,
  Expense,
  ExpenseStatus,
} from "../expense.types";
import ExpenseDetailsModal from "./ExpenseDetailsModal";
import ExpenseForm from "./ExpenseForm";
import {
  ExpenseStatusBadge,
  PaymentStatusBadge,
} from "./ExpenseStatusBadge";
import { EmployeeProfile } from "@/features/employee-portal/employee-portal.types";

interface EmployeeExpenseClientProps {
  expenses: Expense[];
  profile: EmployeeProfile;
  selectedStatus?: ExpenseStatus | "" | "All";
  selectedExpenseType?: string;
  selectedSearch?: string;
  selectedDate?: string;
}

export default function EmployeeExpenseClient({
  expenses,
  profile,
  selectedStatus = "",
  selectedExpenseType = "",
  selectedSearch = "",
  selectedDate = "",
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

  const [searchVal, setSearchVal] = useState(selectedSearch);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [prevSearch, setPrevSearch] = useState(selectedSearch);
  if (selectedSearch !== prevSearch) {
    setSearchVal(selectedSearch);
    setPrevSearch(selectedSearch);
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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

  const handleSearchChange = (value: string) => {
    setSearchVal(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      handleFilterChange("search", value);
    }, 500);
  };

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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Expense Claims</h2>
        <Button type="button" onClick={openCreateForm}>
          Add Expense
        </Button>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-1 md:grid-cols-4">
        {/* Search */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search Expense..."
            value={searchVal}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Expense Type */}
        <div>
          <select
            value={selectedExpenseType}
            onChange={(e) => handleFilterChange("expenseType", e.target.value)}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">All Expense Types</option>
            {Object.values(EXPENSE_CATEGORY).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">All Statuses</option>
            {Object.values(EXPENSE_STATUS).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleFilterChange("date", e.target.value)}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-700"
          />
        </div>
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
        profile={profile}
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
