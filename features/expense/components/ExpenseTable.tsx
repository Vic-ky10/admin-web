"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

import {
  ExpenseWithEmployee,
  EXPENSE_STATUS,
  PAYMENT_STATUS,
  EXPENSE_CATEGORY,
} from "../expense.types";

import ExpenseReviewModal from "./ExpenseReviewModal";

interface ExpenseTableProps {
  expenses: ExpenseWithEmployee[];
  selectedStatus?: string;
  selectedExpenseType?: string;
  selectedSearch?: string;
  selectedDate?: string;
  selectedHasReceipt?: string;
}

function getExpenseStatusVariant(
  status: string,
): "success" | "warning" | "danger" {
  switch (status) {
    case EXPENSE_STATUS.APPROVED:
      return "success";

    case EXPENSE_STATUS.REJECTED:
      return "danger";

    default:
      return "warning";
  }
}

function getPaymentStatusVariant(status: string): "success" | "warning" {
  return status === PAYMENT_STATUS.PAID ? "success" : "warning";
}

export default function ExpenseTable({
  expenses,
  selectedStatus = "",
  selectedExpenseType = "",
  selectedSearch = "",
  selectedDate = "",
  selectedHasReceipt = "",
}: ExpenseTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedExpense, setSelectedExpense] =
    useState<ExpenseWithEmployee | null>(null);

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
    router.push(`/expenses${query ? `?${query}` : ""}`);
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

  return (
    <>
      <div className="space-y-5">

        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
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

          {/* Receipt Attachment */}
          <div>
            <select
              value={selectedHasReceipt}
              onChange={(e) => handleFilterChange("hasReceipt", e.target.value)}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Receipts</option>
              <option value="true">Has Receipt</option>
              <option value="false">No Receipt</option>
            </select>
          </div>
        </div>

        <Table>
          <TableHead>
            <TableRow>

              <TableHeader>Employee</TableHeader>

              <TableHeader>Type</TableHeader>

              <TableHeader>Amount</TableHeader>

              <TableHeader>Date</TableHeader>

              <TableHeader>Status</TableHeader>

              <TableHeader>Payment</TableHeader>

              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>

          <TableBody>
            {expenses.length === 0 ? (
              <TableRow>
                <TableCell>No expenses found.</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            ) : (
              expenses.map((expense) => (
                <TableRow key={expense.id}>

                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {expense.employee?.full_name}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>{expense.expense_type}</TableCell>

                  <TableCell>
                    ₹{Number(expense.amount).toLocaleString()}
                  </TableCell>

                  <TableCell>{expense.expense_date}</TableCell>

                  <TableCell>
                    <Badge variant={getExpenseStatusVariant(expense.status)}>
                      {expense.status}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={getPaymentStatusVariant(expense.payment_status)}
                    >
                      {expense.payment_status}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex justify-end">
                      <Button onClick={() => setSelectedExpense(expense)}>
                        Review
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ExpenseReviewModal
        open={!!selectedExpense}
        expense={selectedExpense}
        onClose={() => setSelectedExpense(null)}
      />
    </>
  );
}
