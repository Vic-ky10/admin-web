"use client";

import Modal from "@/components/ui/Modal";

import { Employee } from "../employee.types";

interface EmployeeDetailsModalProps {
  employee: Employee | null;
  open: boolean;
  onClose: () => void;
}

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default function EmployeeDetailsModal({
  employee,
  open,
  onClose,
}: EmployeeDetailsModalProps) {
  return (
    <Modal
      open={open && employee !== null}
      title="Employee Details"
      onClose={onClose}
    >
      {employee && (
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DetailItem label="Employee ID" value={employee.employee_id} />
          <DetailItem label="Full Name" value={employee.full_name} />
          <DetailItem label="Email" value={employee.email} />
          <DetailItem label="Phone" value={employee.phone} />
          <DetailItem label="Department" value={employee.department} />
          <DetailItem label="Designation" value={employee.designation} />
          <DetailItem label="Role" value={employee.role} />
          <DetailItem label="Status" value={employee.status} />
          <DetailItem
            label="Joined Date"
            value={formatDate(employee.joined_date)}
          />
          <DetailItem
            label="Last Login"
            value={formatDate(employee.last_login)}
          />
          <DetailItem
            label="Created Date"
            value={formatDate(employee.created_at)}
          />
          <DetailItem
            label="Online Status"
            value={employee.is_online ? "Online" : "Offline"}
          />
        </dl>
      )}
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
    <div className="rounded-lg border border-slate-200 p-4">
      <dt className="text-sm font-medium text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-semibold text-slate-900">
        {value || "-"}
      </dd>
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return dateFormatter.format(date);
}
