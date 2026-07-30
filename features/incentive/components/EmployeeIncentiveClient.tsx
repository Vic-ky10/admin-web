"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

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
  INCENTIVE_PAYMENT_STATUS,
  INCENTIVE_STATUS,
  INCENTIVE_TYPE,
  Incentive,
  IncentivePaymentStatus,
  IncentiveStatus,
  IncentiveType,
} from "../incentive.types";
import IncentiveDetailsModal from "./IncentiveDetailsModal";
import IncentiveStatusBadge from "./IncentiveStatusBadge";
import PaymentStatusBadge from "./PaymentStatusBadge";

interface EmployeeIncentiveClientProps {
  incentives: Incentive[];
  selectedType?: IncentiveType | "";
  selectedStatus?: IncentiveStatus | "";
  selectedPaymentStatus?: IncentivePaymentStatus | "";
}

export default function EmployeeIncentiveClient({
  incentives,
  selectedType = "",
  selectedStatus = "",
  selectedPaymentStatus = "",
}: EmployeeIncentiveClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedIncentive, setSelectedIncentive] =
    useState<Incentive | null>(null);

  function handleFilterChange(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    const query = params.toString();
    router.push(`/employee/incentives${query ? `?${query}` : ""}`);
  }

  return (
    <div className="space-y-5">
    <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3">
        <FilterSelect
          label="Type"
          value={selectedType}
          values={Object.values(INCENTIVE_TYPE)}
          emptyLabel="All Types"
          onChange={(value) => handleFilterChange("type", value)}
        />
        <FilterSelect
          label="Status"
          value={selectedStatus}
          values={Object.values(INCENTIVE_STATUS)}
          emptyLabel="All Statuses"
          onChange={(value) => handleFilterChange("status", value)}
        />
        <FilterSelect
          label="Payment"
          value={selectedPaymentStatus}
          values={Object.values(INCENTIVE_PAYMENT_STATUS)}
          emptyLabel="All Payments"
          onChange={(value) => handleFilterChange("paymentStatus", value)}
        />
      </div>  

      {incentives.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold">No incentives found</h2>
          <p className="mt-1 text-slate-500">
            Approved and pending rewards will appear here.
          </p>
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Code</TableHeader>
              <TableHeader>Type</TableHeader>
              <TableHeader>Title</TableHeader>
              <TableHeader>Amount</TableHeader>
              <TableHeader>Month</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Payment</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {incentives.map((incentive) => (
              <TableRow key={incentive.id}>
                <TableCell>{incentive.incentive_code}</TableCell>
                <TableCell>{incentive.incentive_type}</TableCell>
                <TableCell>{incentive.title}</TableCell>
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
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setSelectedIncentive(incentive)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <IncentiveDetailsModal
        open={selectedIncentive !== null}
        incentive={selectedIncentive}
        onClose={() => setSelectedIncentive(null)}
      />
    </div>
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
    <label className="space-y-1">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      >
        <option value="">{emptyLabel}</option>
        {values.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </label>
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
