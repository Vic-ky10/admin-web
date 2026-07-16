import IncentiveTable from "@/features/incentive/components/IncentiveTable";
import { getIncentives } from "@/features/incentive/incentive.service";
import { getEmployees } from "@/features/employee/employee.service";

export default async function IncentivesPage() {
  const [incentives, employees] = await Promise.all([
    getIncentives(),
    getEmployees(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Incentives</h1>
        <p className="text-slate-500">
          Create, review, and manage employee rewards.
        </p>
      </div>

      <IncentiveTable incentives={incentives} employees={employees} />
    </div>
  );
}
