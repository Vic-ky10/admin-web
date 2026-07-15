import Badge from "@/components/ui/Badge";

import {
  EXPENSE_STATUS,
  ExpenseStatus,
  PAYMENT_STATUS,
  PaymentStatus,
} from "../expense.types";

export function ExpenseStatusBadge({
  status,
}: {
  status: ExpenseStatus;
}) {
  if (status === EXPENSE_STATUS.APPROVED) {
    return <Badge variant="success">{status}</Badge>;
  }

  if (status === EXPENSE_STATUS.REJECTED) {
    return <Badge variant="danger">{status}</Badge>;
  }

  return <Badge variant="warning">{status}</Badge>;
}

export function PaymentStatusBadge({
  status,
}: {
  status: PaymentStatus;
}) {
  if (status === PAYMENT_STATUS.PAID) {
    return <Badge variant="success">{status}</Badge>;
  }

  return <Badge variant="info">{status}</Badge>;
}
