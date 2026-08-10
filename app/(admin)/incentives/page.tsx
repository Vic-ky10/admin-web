import IncentiveTable from "@/features/incentive/components/IncentiveTable";
import { getIncentives } from "@/features/incentive/incentive.service";
import { getEmployees } from "@/features/employee/employee.service";
import PageHeader from "@/components/layout/PageHeader";

export const dynamic = "force-dynamic";

export default async function IncentivesPage() {
  const [incentives, employees] = await Promise.all([
    getIncentives(),
    getEmployees(),
  ]);

  return (
    <div className="space-y-6 max-w-[1920px] mx-auto animate-fade-in">
      <PageHeader
        title="Incentives"
        description="Create, review, and manage employee performance rewards."
        breadcrumbs={[{ label: "Admin", href: "/dashboard" }, { label: "Incentives" }]}
      />

      <IncentiveTable incentives={incentives} employees={employees} />
    </div>
  );
}

