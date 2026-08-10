// "use client";

// import { useEffect, useState } from "react";

// import Button from "@/components/ui/Button";
// import Input from "@/components/ui/Input";
// import Modal from "@/components/ui/Modal";

// import {
//   ExpenseWithEmployee,
//   EXPENSE_STATUS,
//   PAYMENT_STATUS,
// } from "../expense.types";
// import { useTransition } from "react";

// import {
//   markExpensePaidAction,
//   reviewExpenseAction,
// } from "../expense.action";

// import {
//   ReviewExpenseInput,
// } from "../expense.validation";

// interface ExpenseReviewModalProps {
//   open: boolean;
//   expense: ExpenseWithEmployee | null;
//   onClose: () => void;
// }

// export default function ExpenseReviewModal({
//   open,
//   expense,
//   onClose,
// }: ExpenseReviewModalProps) {
//  const [approvedAmount, setApprovedAmount] = useState(
//   expense?.approved_amount?.toString() ??
//     expense?.amount?.toString() ??
//     ""
// );

// const [reviewComment, setReviewComment] = useState(
//   expense?.review_comment ?? ""
// );

//     const [isPending, startTransition] =
//   useTransition();

//   function reviewExpense(
//   status: typeof EXPENSE_STATUS.APPROVED | typeof EXPENSE_STATUS.REJECTED
// ) {
//   if (!expense) return;

//   startTransition(async () => {
//     const values: ReviewExpenseInput = {
//       expenseId: expense.id,
//       status,
//       approved_amount: Number(approvedAmount),
//       review_comment: reviewComment,
//     };

//     const result =
//       await reviewExpenseAction(values);

//     if (result.success) {
//       onClose();
//     } else {
//       alert(result.error);
//     }
//   });
// }

// function markAsPaid() {
//   if (!expense) return;

//   startTransition(async () => {
//     const result =
//       await markExpensePaidAction(expense.id);

//     if (result.success) {
//       onClose();
//     } else {
//       alert(result.error);
//     }
//   });
// }

//   if (!expense) return null;

//     return (
//     <Modal
//       open={open}
//       title="Review Expense"
//       onClose={onClose}
//     >
//       <div className="space-y-6">

//         <div className="grid grid-cols-2 gap-4">

//           <div>
//             <p className="text-sm text-slate-500">
//               Employee
//             </p>

//             <p className="font-semibold">
//               {expense.employee?.full_name}
//             </p>
//           </div>

//           <div>
//             <p className="text-sm text-slate-500">
//               Employee ID
//             </p>

//             <p className="font-semibold">
//               {expense.employee?.employee_id}
//             </p>
//           </div>

//           <div>
//             <p className="text-sm text-slate-500">
//               Expense Code
//             </p>

//             <p>{expense.expense_code}</p>
//           </div>

//           <div>
//             <p className="text-sm text-slate-500">
//               Type
//             </p>

//             <p>{expense.expense_type}</p>
//           </div>

//           <div>
//             <p className="text-sm text-slate-500">
//               Requested Amount
//             </p>

//             <p>₹{expense.amount}</p>
//           </div>

//           <div>
//             <p className="text-sm text-slate-500">
//               Expense Date
//             </p>

//             <p>{expense.expense_date}</p>
//           </div>

//         </div>

//         <Input
//           label="Approved Amount"
//           type="number"
//           value={approvedAmount}
//           onChange={(e) =>
//             setApprovedAmount(e.target.value)
//           }
//         />

//                <div className="flex justify-end gap-3">

//           {expense.status === EXPENSE_STATUS.PENDING && (
//             <>
//               <Button
//                 variant="danger"
//                 disabled={isPending}
//                 onClick={() =>
//                   reviewExpense(
//                     EXPENSE_STATUS.REJECTED
//                   )
//                 }
//               >
//                 Reject
//               </Button>

//               <Button
//                 disabled={isPending}
//                 onClick={() =>
//                   reviewExpense(
//                     EXPENSE_STATUS.APPROVED
//                   )
//                 }
//               >
//                 Approve
//               </Button>
//             </>
//           )}

//           {expense.status ===
//             EXPENSE_STATUS.APPROVED &&
//             expense.payment_status ===
//               PAYMENT_STATUS.PENDING && (
//               <Button
//                 variant="secondary"
//                 disabled={isPending}
//                 onClick={markAsPaid}
//               >
//                 Mark Paid
//               </Button>
//             )}

//           <Button
//             variant="secondary"
//             onClick={onClose}
//           >
//             Close
//           </Button>

//         </div>

//       </div>

//     </Modal>
//   );
// }

"use client";

import Modal from "@/components/ui/Modal";
import {
  EXPENSE_STATUS,
  ExpenseWithEmployee,
  PAYMENT_STATUS,
} from "../expense.types";
import Input from "@/components/ui/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { reviewExpenseAction, markExpensePaidAction } from "../expense.action";

import { ReviewExpenseInput, reviewExpenseSchema } from "../expense.validation";
import { z } from "zod";
import LoadingButton from "@/components/feedback/LoadingButton";
import Button from "@/components/ui/Button";

interface ExpenseReviewModalProps {
  open: boolean;
  expense: ExpenseWithEmployee | null;
  onClose: () => void;
}

export default function ExpenseReviewModal({
  open,
  expense,
  onClose,
}: ExpenseReviewModalProps) {
  const router = useRouter();

  const defaultValues = useMemo(
    () => ({
      expenseId: expense?.id ?? "",
      status: EXPENSE_STATUS.APPROVED,
      approved_amount: expense?.approved_amount ?? expense?.amount ?? 0,
      review_comment: expense?.review_comment ?? "",
    }),
    [expense],
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof reviewExpenseSchema>, unknown, ReviewExpenseInput>(
    {
      resolver: zodResolver(reviewExpenseSchema),
      values: defaultValues,
    },
  );

  
  if (!expense) return null;
  const currentExpense = expense;

  async function handleMarkPaid() {
    const result = await markExpensePaidAction(currentExpense.id);

    if (!result.success) {
      toast.error(result.error ?? "Unable to update payment.");
      return;
    }

    toast.success(result.message ?? "Expense marked as paid.");

    onClose();
    router.refresh();
  }

  return (
    <Modal open={open} title="Review Expense" onClose={onClose}>
      <form
        className="space-y-6"
        onSubmit={handleSubmit(async (values) => {
          const result = await reviewExpenseAction(values);

          if (!result.success) {
            toast.error(result.error ?? "Unable to review expense.");
            return;
          }

          toast.success(result.message ?? "Expense reviewed successfully.");

          onClose();
          router.refresh();
        })}
      >
        <div className="grid grid-cols-2 gap-5">
          <Input
            label="Employee"
            value={expense.employee?.full_name ?? "-"}
            readOnly
            className="bg-slate-100"
          />

          <Input
            label="Employee ID"
            value={expense.employee?.employee_id ?? "-"}
            readOnly
            className="bg-slate-100"
          />

          <Input
            label="Expense Code"
            value={expense.expense_code}
            readOnly
            className="bg-slate-100"
          />

          <Input
            label="Expense Type"
            value={expense.expense_type}
            readOnly
            className="bg-slate-100"
          />

          <Input
            label="Amount"
            value={`₹${expense.amount}`}
            readOnly
            className="bg-slate-100"
          />

          <Input
            label="Expense Date"
            value={expense.expense_date}
            readOnly
            className="bg-slate-100"
          />
        </div>
        {expense.description && (
          <div className="space-y-1">
            <label className="text-sm font-semibold">Description</label>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              {expense.description}
            </div>
          </div>
        )}

        <Input
          label="Approved Amount"
          type="number"
          error={errors.approved_amount?.message}
          {...register("approved_amount", {
            valueAsNumber: true,
          })}
        />

        <Input
          label="Review Comment"
          error={errors.review_comment?.message}
          {...register("review_comment")}
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>

          <Button
            type="submit"
            variant="danger"
            onClick={() => setValue("status", EXPENSE_STATUS.REJECTED)}
            disabled={isSubmitting}
          >
            Reject
          </Button>

          <LoadingButton
            type="submit"
            loading={isSubmitting}
            onClick={() => setValue("status", EXPENSE_STATUS.APPROVED)}
          >
            Approve
          </LoadingButton>
          {expense.status === EXPENSE_STATUS.APPROVED &&
            expense.payment_status === PAYMENT_STATUS.PENDING && (
              <LoadingButton
                type="button"
                variant="secondary"
                loading={isSubmitting}
                onClick={handleMarkPaid}
              >
                Mark Paid
              </LoadingButton>
            )}
        </div>
        {expense.receipt_url && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Receipt Attachment</span>
              <span className="text-xs font-medium text-slate-500">📎 Attached</span>
            </div>

            <div className="flex items-center gap-3">
              {expense.receipt_type?.includes("pdf") || expense.receipt_url.toLowerCase().endsWith(".pdf") ? (
                <div className="w-12 h-12 rounded-md bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                  PDF
                </div>
              ) : (
                <img
                  src={expense.receipt_url}
                  alt="Receipt Preview"
                  className="w-16 h-16 object-cover rounded-md border border-slate-200"
                />
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {expense.receipt_name || (expense.receipt_url.toLowerCase().endsWith(".pdf") ? "Receipt.pdf" : "Receipt.jpg")}
                </p>
                <p className="text-xs text-slate-500">
                  {expense.receipt_type?.includes("pdf") || expense.receipt_url.toLowerCase().endsWith(".pdf") ? "PDF Document" : "Image File"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
              <a
                href={expense.receipt_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
              >
                {expense.receipt_url.toLowerCase().endsWith(".pdf") ? "Open PDF" : "Open Fullscreen"}
              </a>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
