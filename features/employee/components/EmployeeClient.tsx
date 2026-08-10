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
  const [department, setDepartment] = useState("");

  const departments = useMemo(() => {
    return Array.from(new Set(employees.map(e => e.department).filter(Boolean))) as string[];
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    const keyword = search.toLowerCase();
    return employees.filter(
      (employee) => {
        const matchesSearch = employee.full_name.toLowerCase().includes(keyword) ||
          employee.email.toLowerCase().includes(keyword) ||
          employee.employee_id.toLowerCase().includes(keyword) ||
          (employee.department && employee.department.toLowerCase().includes(keyword));
        
        const matchesDepartment = department ? employee.department === department : true;

        return matchesSearch && matchesDepartment;
      }
    );
  }, [employees, search, department]);

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

      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} />
        </div>
        <div className="w-full sm:w-44">
           <select 
             value={department} 
             onChange={(e) => setDepartment(e.target.value)}
             className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 h-full min-h-[44px] text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
           >
             <option value="">All Departments</option>
             {departments.map((dept) => (
               <option key={dept} value={dept}>{dept}</option>
             ))}
           </select>
        </div>
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
