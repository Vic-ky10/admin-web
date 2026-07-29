"use client";

import { useMemo, useState } from "react";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
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
} from "../expense.types";

import ExpenseReviewModal from "./ExpenseReviewModal";

interface ExpenseTableProps {
  expenses: ExpenseWithEmployee[];
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

export default function ExpenseTable({ expenses }: ExpenseTableProps) {
  const [search, setSearch] = useState("");

  const [selectedExpense, setSelectedExpense] =
    useState<ExpenseWithEmployee | null>(null);

  const filteredExpenses = useMemo(() => {
    const keyword = search.toLowerCase();

    return expenses.filter((expense) => {
      return (
        expense.expense_code.toLowerCase().includes(keyword) ||
        expense.employee?.full_name?.toLowerCase().includes(keyword)
      );
    });
  }, [expenses, search]);
  return (
    <>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <Input
            placeholder="Search ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Expense Code</TableHeader>

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
            {filteredExpenses.length === 0 ? (
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
              filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    <span className="font-semibold">
                      {expense.expense_code}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {expense.employee?.full_name}
                      </p>

                      <p className="text-xs text-slate-500">
                        {expense.employee?.employee_id}
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
