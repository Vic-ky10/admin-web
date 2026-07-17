"use client";

import { useMemo, useState } from "react";

import { toast } from "sonner";
import Button from "@/components/ui/Button";

import AddEmployeeModal from "./AddEmployeeModal";
import EmployeeDetailsModal from "./EmployeeDetailsModal";
import EditEmployeeModal from "./EditEmployeeModal";
import EmployeeTable from "./EmployeeTable";
import SearchBar from "./SearchBar";
import CredentialsModal from "./CredentialsModal";

import { Employee, EmployeeCredentials } from "../employee.types";

interface Props {
  employees: Employee[];
}

export default function EmployeeClient({
  employees,
}: Props) {

  const [open, setOpen] = useState(false);

  const [selectedEmployee, setSelectedEmployee] =
    useState<Employee | null>(null);

  const [editingEmployee, setEditingEmployee] =
    useState<Employee | null>(null);

  const [credentials, setCredentials] = useState<EmployeeCredentials | null>(
    null
  );

  const [search, setSearch] = useState("");

  const filteredEmployees = useMemo(() => {

    const keyword = search.toLowerCase();

    return employees.filter((employee) =>
      employee.full_name.toLowerCase().includes(keyword) ||
      employee.email.toLowerCase().includes(keyword) ||
      employee.employee_id.toLowerCase().includes(keyword)
    );

  }, [employees, search]);

  return (
    <>

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            Employees
          </h1>

          <p className="text-slate-500">
            Manage your organization employees.
          </p>

        </div>

        <Button
          onClick={() => setOpen(true)}
        >
          Add Employee
        </Button>

      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
      />

      <EmployeeTable
        employees={filteredEmployees}
        onView={setSelectedEmployee}
        onEdit={setEditingEmployee}
      />

      <AddEmployeeModal
        open={open}
        onClose={() => setOpen(false)}
        onCreated={(creds) => {
          setOpen(false);
          setCredentials(creds);
        }}
      />

      <CredentialsModal
        open={credentials !== null}
        credentials={credentials}
        onClose={() => {
          setCredentials(null);
          toast.success("Employee created successfully.");
        }}
      />

      <EmployeeDetailsModal
        employee={selectedEmployee}
        open={selectedEmployee !== null}
        onClose={() => setSelectedEmployee(null)}
      />

      <EditEmployeeModal
        employee={editingEmployee}
        open={editingEmployee !== null}
        onClose={() => setEditingEmployee(null)}
      />

    </>
  );
}
