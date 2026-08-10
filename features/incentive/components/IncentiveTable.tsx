"use client";

import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
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
import { Employee } from "@/features/employee/employee.types";

import {
  createIncentiveAction,
  deleteIncentiveAction,
  updateIncentiveAction,
} from "../incentive.action";
import {
  INCENTIVE_PAYMENT_STATUS,
  INCENTIVE_STATUS,
  INCENTIVE_TYPE,
  IncentivePaymentStatus,
  IncentiveStatus,
  IncentiveType,
  IncentiveWithEmployee,
} from "../incentive.types";
import { IncentiveInput } from "../incentive.validation";
import ApproveIncentiveModal from "./ApproveIncentiveModal";
import IncentiveDetailsModal from "./IncentiveDetailsModal";
import IncentiveForm from "./IncentiveForm";
import IncentiveStatusBadge from "./IncentiveStatusBadge";
import PaymentStatusBadge from "./PaymentStatusBadge";

interface IncentiveTableProps {
  incentives: IncentiveWithEmployee[];
  employees: Employee[];
}

export default function IncentiveTable({
  incentives,
  employees,
}: IncentiveTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [type, setType] = useState<IncentiveType | "">("");
  const [status, setStatus] = useState<IncentiveStatus | "">("");
  const [paymentStatus, setPaymentStatus] =
    useState<IncentivePaymentStatus | "">("");
  const [formOpen, setFormOpen] = useState(false);
  const [formIncentive, setFormIncentive] =
    useState<IncentiveWithEmployee | null>(null);
  const [selectedIncentive, setSelectedIncentive] =
    useState<IncentiveWithEmployee | null>(null);
  const [reviewIncentive, setReviewIncentive] =
    useState<IncentiveWithEmployee | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredIncentives = useMemo(() => {
    const keyword = search.toLowerCase();

    return incentives.filter((incentive) => {
      const matchesSearch =
        !keyword ||
        incentive.incentive_code.toLowerCase().includes(keyword) ||
        incentive.title.toLowerCase().includes(keyword) ||
        incentive.employee?.full_name?.toLowerCase().includes(keyword) ||
        incentive.employee?.employee_id?.toLowerCase().includes(keyword);

      return (
        matchesSearch &&
        (!type || incentive.incentive_type === type) &&
        (!status || incentive.status === status) &&
        (!paymentStatus || incentive.payment_status === paymentStatus)
      );
    });
  }, [incentives, paymentStatus, search, status, type]);

  function openCreate() {
    setFormIncentive(null);
    setFormOpen(true);
  }

  function openEdit(incentive: IncentiveWithEmployee) {
    setFormIncentive(incentive);
    setFormOpen(true);
  }

  function handleSubmit(values: IncentiveInput) {
    startTransition(async () => {
      const result = formIncentive
        ? await updateIncentiveAction(formIncentive.id, values)
        : await createIncentiveAction(values);

      if (!result.success) {
        toast.error(result.error ?? "Unable to save incentive.");
        return;
      }

      toast.success(result.message ?? "Incentive saved.");
      setFormOpen(false);
      setFormIncentive(null);
      router.refresh();
    });
  }

  function handleDelete(incentive: IncentiveWithEmployee) {
    if (!confirm("Delete this incentive?")) {
      return;
    }

    setPendingId(incentive.id);
    startTransition(async () => {
      const result = await deleteIncentiveAction(incentive.id);
      setPendingId(null);

      if (!result.success) {
        toast.error(result.error ?? "Unable to delete incentive.");
        return;
      }

      toast.success(result.message ?? "Incentive deleted.");
      router.refresh();
    });
  }

  return (
    <>
      <div className="space-y-5">
        <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Search incentives..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <Button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 shrink-0"
            >
              <Plus className="h-4 w-4" />
              New Incentive
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <FilterSelect
              label="Type"
              value={type}
              values={Object.values(INCENTIVE_TYPE)}
              emptyLabel="All Types"
              onChange={(value) => setType(value as IncentiveType | "")}
            />
            <FilterSelect
              label="Status"
              value={status}
              values={Object.values(INCENTIVE_STATUS)}
              emptyLabel="All Statuses"
              onChange={(value) => setStatus(value as IncentiveStatus | "")}
            />
            <FilterSelect
              label="Payment"
              value={paymentStatus}
              values={Object.values(INCENTIVE_PAYMENT_STATUS)}
              emptyLabel="All Payments"
              onChange={(value) =>
                setPaymentStatus(value as IncentivePaymentStatus | "")
              }
            />
          </div>
        </div>

        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Code</TableHeader>
              <TableHeader>Employee</TableHeader>
              <TableHeader>Type</TableHeader>
              <TableHeader>Amount</TableHeader>
              <TableHeader>Month</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Payment</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredIncentives.length === 0 ? (
              <TableRow>
                <TableCell>No incentives found.</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            ) : (
              filteredIncentives.map((incentive) => (
                <TableRow key={incentive.id}>
                  <TableCell>
                    <span className="font-semibold">
                      {incentive.incentive_code}
                    </span>
                    <p className="text-xs text-slate-500">
                      {incentive.title}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">
                      {incentive.employee?.full_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {incentive.employee?.employee_id}
                    </p>
                  </TableCell>
                  <TableCell>{incentive.incentive_type}</TableCell>
                  <TableCell>{formatMoney(incentive.amount)}</TableCell>
                  <TableCell>
                    {getMonthName(incentive.month)} {incentive.year}
                  </TableCell>
                  <TableCell>
                    <IncentiveStatusBadge status={incentive.status} />
                  </TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={incentive.payment_status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setSelectedIncentive(incentive)}
                      >
                        View
                      </Button>
                      {incentive.status === INCENTIVE_STATUS.PENDING && (
                        <Button
                          type="button"
                          onClick={() => openEdit(incentive)}
                        >
                          Edit
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setReviewIncentive(incentive)}
                      >
                        Review
                      </Button>
                      {incentive.status === INCENTIVE_STATUS.PENDING && (
                        <LoadingButton
                          type="button"
                          variant="danger"
                          loading={isPending && pendingId === incentive.id}
                          onClick={() => handleDelete(incentive)}
                        >
                          Delete
                        </LoadingButton>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Modal
        open={formOpen}
        title={formIncentive ? "Edit Incentive" : "Create Incentive"}
        onClose={() => setFormOpen(false)}
      >
        <IncentiveForm
          incentive={formIncentive}
          employees={employees}
          loading={isPending}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>

      <IncentiveDetailsModal
        open={selectedIncentive !== null}
        incentive={selectedIncentive}
        onClose={() => setSelectedIncentive(null)}
      />

      <ApproveIncentiveModal
        open={reviewIncentive !== null}
        incentive={reviewIncentive}
        onClose={() => setReviewIncentive(null)}
      />
    </>
  );
}

function FilterSelect({
  label,
  value,
  values,
  emptyLabel,
  onChange,
}: {
  label: string;
  value: string;
  values: string[];
  emptyLabel: string;
  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    >
      <option value="">{label}: {emptyLabel}</option>
        {values.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
    </select>
  );
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
    month: "short",
  }).format(new Date(2024, month - 1, 1));
}
