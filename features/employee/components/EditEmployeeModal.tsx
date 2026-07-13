"use client";

import Modal from "@/components/ui/Modal";

import { Employee } from "../employee.types";
import EmployeeForm from "./EmployeeForm";

interface EditEmployeeModalProps {
  employee: Employee | null;
  open: boolean;
  onClose: () => void;
}

export default function EditEmployeeModal({
  employee,
  open,
  onClose,
}: EditEmployeeModalProps) {
  return (
    <Modal
      open={open && employee !== null}
      title="Edit Employee"
      onClose={onClose}
    >
      {employee && (
        <EmployeeForm
          mode="edit"
          employee={employee}
          onSuccess={onClose}
          onCancel={onClose}
        />
      )}
    </Modal>
  );
}
