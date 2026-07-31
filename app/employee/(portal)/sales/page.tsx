import { redirect } from "next/navigation";
import { getCurrentEmployeeProfile } from "@/features/employee-portal/employee-portal.service";
import {
  getMyCustomers,
  getMyCustomerPurchases,
  getMyCustomerFollowups,
  getMyIncentives,
  getMySalesAreas,
  getEmployeeSalesDashboardData,
} from "@/features/employee-sales/employee-sales.service";
import EmployeeSalesClient from "@/features/employee-sales/components/EmployeeSalesClient";

export const dynamic = "force-dynamic";

export default async function EmployeeSalesPage() {
  const profile = await getCurrentEmployeeProfile();

  if (!profile) {
    redirect("/employee/login");
  }

  const profileId = profile.id;

  const [
    customers,
    purchases,
    followups,
    incentives,
    salesAreas,
    dashboardData,
  ] = await Promise.all([
    getMyCustomers(profileId),
    getMyCustomerPurchases(profileId),
    getMyCustomerFollowups(profileId),
    getMyIncentives(profileId),
    getMySalesAreas(profileId),
    getEmployeeSalesDashboardData(profileId),
  ]);

  return (
    <EmployeeSalesClient
      employeeId={profileId}
      customers={customers}
      purchases={purchases}
      followups={followups}
      incentives={incentives}
      salesAreas={salesAreas}
      dashboardData={dashboardData}
    />
  );
}