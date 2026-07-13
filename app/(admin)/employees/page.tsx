import { getEmployees } from "@/features/employee/employee.service";
import EmployeeClient from "@/features/employee/components/EmployeeClient";

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {

  // fetch employees from the database.
  const employees = await getEmployees();

  return (
    <EmployeeClient
      employees={employees}
    />
  );
}
