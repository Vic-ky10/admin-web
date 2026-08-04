import { redirect } from "next/navigation";
import EmployeeIncentiveClient from "@/features/incentive/components/EmployeeIncentiveClient";
import { getCurrentEmployeeProfile } from "@/features/employee-portal/employee-portal.service";
import { getEmployeeIncentives } from "@/features/incentive/incentive.service";
import {
  INCENTIVE_PAYMENT_STATUS,
  INCENTIVE_STATUS,
  INCENTIVE_TYPE,
  IncentiveFilters,
} from "@/features/incentive/incentive.types";
import PageHeader from "@/components/layout/PageHeader";

export const dynamic = "force-dynamic";

interface EmployeeIncentivesPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function EmployeeIncentivesPage({
  searchParams,
}: EmployeeIncentivesPageProps) {
  const profile = await getCurrentEmployeeProfile();

  if (!profile) {
    redirect("/employee/login");
  }

  const params = await searchParams;
  const type = Object.values(INCENTIVE_TYPE).find(
    (value) => value === params.type
  );
  const status = Object.values(INCENTIVE_STATUS).find(
    (value) => value === params.status
  );
  const paymentStatus = Object.values(INCENTIVE_PAYMENT_STATUS).find(
    (value) => value === params.paymentStatus
  );
  const filters: IncentiveFilters = {
    type,
    status,
    paymentStatus,
  };
  const incentives = await getEmployeeIncentives(profile.id, filters);

  return (
    <div className="space-y-6 max-w-[1920px] mx-auto animate-fade-in">
      <PageHeader
        title="My Incentives"
        description="View your performance bonuses, approval decisions, and payout status."
        breadcrumbs={[{ label: "Portal", href: "/employee/dashboard" }, { label: "Incentives" }]}
      />

      <EmployeeIncentiveClient
        incentives={incentives}
        selectedType={filters.type}
        selectedStatus={filters.status}
        selectedPaymentStatus={filters.paymentStatus}
      />
    </div>
  );
}
