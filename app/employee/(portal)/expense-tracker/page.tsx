import EmployeeExpenseTrackerClient from "@/features/expense/components/analytics/EmployeeExpenseTrackerClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Expense Tracker | InfiniGoal Portal",
  description: "Track your personal expense activity",
};

export default function EmployeeExpenseTrackerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Expense Tracker</h1>
        <p className="text-slate-500">
          Track your personal expense activity
        </p>
      </div>

      <EmployeeExpenseTrackerClient />
    </div>
  );
}
