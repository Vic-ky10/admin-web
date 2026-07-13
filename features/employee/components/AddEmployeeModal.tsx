"use client";

import Modal from "@/components/ui/Modal";
import EmployeeForm from "./EmployeeForm";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AddEmployeeModal({
  open,
  onClose,
}: Props) {
  return (
    <Modal
      open={open}
      title="Add Employee"
      onClose={onClose}
    >
      <EmployeeForm onSuccess={onClose} onCancel={onClose} />
    </Modal>
  );
}
