import { getCustomers } from "@/features/sales/customer.service";
import { getSalesAreas } from "@/features/sales/sales-area.service";
import { getCustomerPurchases } from "@/features/sales/customer-purchase.service";
import { getCustomerFollowups } from "@/features/sales/customer-followup.service";
import { getIncentiveRules } from "@/features/sales/incentive-rule.service";
import { getEmployees } from "@/features/employee/employee.service";
import SalesClient from "@/features/sales/components/SalesClient";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const [
    customers,
    salesAreas,
    purchases,
    followups,
    incentiveRules,
    employees,
  ] = await Promise.all([
    getCustomers(),
    getSalesAreas(),
    getCustomerPurchases(),
    getCustomerFollowups(),
    getIncentiveRules(),
    getEmployees(),
  ]);

  return (
    <SalesClient
      initialCustomers={customers}
      initialSalesAreas={salesAreas}
      initialPurchases={purchases}
      initialFollowups={followups}
      initialIncentiveRules={incentiveRules}
      employees={employees}
    />
  );
}
