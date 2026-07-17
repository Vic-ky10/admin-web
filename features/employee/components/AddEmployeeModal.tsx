"use client";

import Modal from "@/components/ui/Modal";
import EmployeeForm from "./EmployeeForm";
import { EmployeeCredentials } from "../employee.types";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (credentials: EmployeeCredentials) => void;
}

export default function AddEmployeeModal({
  open,
  onClose,
  onCreated,
}: Props) {
  return (
    <Modal
      open={open}
      title="Add Employee"
      onClose={onClose}
    >
      <EmployeeForm onSuccess={onClose} onCancel={onClose} onCreated={onCreated} />
    </Modal>
  );
}
