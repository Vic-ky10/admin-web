"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Eye, Edit2, Trash2, Users } from "lucide-react";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
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

  function confirmDelete(employee: Employee) {
    toast("Delete Employee?", {
      description: `Delete ${employee.full_name}? This action cannot be undone.`,
      action: {
        label: "Delete",
        onClick: () => handleDelete(employee),
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
      duration: 10000,
    });
  }

  function handleDelete(employee: Employee) {
    startDeleteTransition(async () => {
      const result = await deleteEmployee(employee.id);

      if (!result.success) {
        toast.error(result.error ?? "Unable to delete employee.");
        return;
      }

      toast.success(result.message ?? "Employee deleted successfully.");
      router.refresh();
    });
  }

  if (employees.length === 0) {
    return (
      <EmptyState
        title="No Employees Found"
        description="There are no employee profiles matching your query. Add a new employee to get started."
        icon={<Users className="h-6 w-6 text-slate-400" />}
      />
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
          <TableHeader className="text-right">Actions</TableHeader>
        </TableRow>
      </TableHead>

      <TableBody>
        {employees.map((employee) => (
          <TableRow
            key={employee.id}
            className="cursor-pointer"
            onClick={() => onView(employee)}
          >
            <TableCell className="font-mono text-xs font-semibold text-slate-600">
              {employee.employee_id}
            </TableCell>

            <TableCell className="font-bold text-slate-900">
              {employee.full_name}
            </TableCell>

            <TableCell className="text-slate-600">{employee.email}</TableCell>

            <TableCell>{employee.department ?? "-"}</TableCell>

            <TableCell>{employee.designation ?? "-"}</TableCell>

            <TableCell>
              <Badge
                showDot
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

            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1.5" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(employee)}
                  title="View profile"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => onEdit(employee)}
                  title="Edit details"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </Button>

                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  disabled={isDeleting}
                  onClick={() => confirmDelete(employee)}
                  title="Delete employee"
                >
                  <Trash2 className="h-3.5 w-3.5" />
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
