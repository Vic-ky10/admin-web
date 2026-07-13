"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

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

import { EMPLOYEE_STATUS } from "../employee.constants";
import { deleteEmployee } from "../employee.actions";
import { Employee } from "../employee.types";

interface EmployeeTableProps {
  employees: Employee[];
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
}

export default function EmployeeTable({
  employees,
  onView,
  onEdit,
}: EmployeeTableProps) {
  const router = useRouter();
  const [isDeleting, startDeleteTransition] = useTransition();

  function handleDelete(employee: Employee) {
    const confirmed = window.confirm(
      `Delete ${employee.full_name}? This will remove the employee profile and auth user.`
    );

    if (!confirmed) {
      return;
    }

    startDeleteTransition(async () => {
      const result = await deleteEmployee(employee.id);

      if (!result.success) {
        toast.error(result.error ?? "Unable to delete employee.");
        return;
      }

      toast.success(
        result.message ?? "Employee deleted successfully."
      );
      router.refresh();
    });
  }

  if (employees.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center">
        <h2 className="text-xl font-semibold">
          No Employees Found
        </h2>

        <p className="mt-2 text-slate-500">
          Click Add Employee to create one.
        </p>
      </div>
    );
  }

  return (
    <Table>

      <TableHead>

        <TableRow>

          <TableHeader>Employee ID</TableHeader>

          <TableHeader>Name</TableHeader>

          <TableHeader>Email</TableHeader>

          <TableHeader>Department</TableHeader>

          <TableHeader>Designation</TableHeader>

          <TableHeader>Status</TableHeader>

          <TableHeader>Actions</TableHeader>

        </TableRow>

      </TableHead>

      <TableBody>

        {employees.map((employee) => (

          <TableRow
            key={employee.id}
            className="cursor-pointer"
            onClick={() => onView(employee)}
          >

            <TableCell>{employee.employee_id}</TableCell>

            <TableCell>{employee.full_name}</TableCell>

            <TableCell>{employee.email}</TableCell>

            <TableCell>{employee.department ?? "-"}</TableCell>

            <TableCell>{employee.designation ?? "-"}</TableCell>

            <TableCell>

              <Badge
                variant={
                  employee.status === EMPLOYEE_STATUS.ACTIVE
                    ? "success"
                    : employee.status === EMPLOYEE_STATUS.PENDING
                      ? "warning"
                      : "danger"
                }
              >
                {employee.status}
              </Badge>

            </TableCell>

            <TableCell>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="px-3 py-1 text-sm"
                  onClick={(event) => {
                    event.stopPropagation();
                    onView(employee);
                  }}
                >
                  View
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  className="px-3 py-1 text-sm"
                  onClick={(event) => {
                    event.stopPropagation();
                    onEdit(employee);
                  }}
                >
                  Edit
                </Button>

                <Button
                  type="button"
                  variant="danger"
                  className="px-3 py-1 text-sm"
                  disabled={isDeleting}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDelete(employee);
                  }}
                >
                  Delete
                </Button>
              </div>
            </TableCell>

          </TableRow>

        ))}

      </TableBody>

    </Table>
  );
}
