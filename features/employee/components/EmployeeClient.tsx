"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/layout/PageHeader";

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

export default function EmployeeClient({ employees }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [credentials, setCredentials] = useState<EmployeeCredentials | null>(null);
  const [search, setSearch] = useState("");

  const filteredEmployees = useMemo(() => {
    const keyword = search.toLowerCase();
    return employees.filter(
      (employee) =>
        employee.full_name.toLowerCase().includes(keyword) ||
        employee.email.toLowerCase().includes(keyword) ||
        employee.employee_id.toLowerCase().includes(keyword) ||
        (employee.department && employee.department.toLowerCase().includes(keyword))
    );
  }, [employees, search]);

  return (
    <div className="space-y-6 max-w-[1920px] mx-auto animate-fade-in">
      <PageHeader
        title="Employees"
        description="Manage your organization employees, credentials, and roles."
        breadcrumbs={[{ label: "Admin", href: "/dashboard" }, { label: "Employees" }]}
      >
        <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>
      </PageHeader>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <SearchBar value={search} onChange={setSearch} />
      </div>

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
        onClose={() => setCredentials(null)}
      />

      <EmployeeDetailsModal
        open={selectedEmployee !== null}
        employee={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
      />

      <EditEmployeeModal
        open={editingEmployee !== null}
        employee={editingEmployee}
        onClose={() => setEditingEmployee(null)}
      />
    </div>
  );
}
