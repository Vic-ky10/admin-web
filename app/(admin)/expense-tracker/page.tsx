import AdminExpenseTrackerClient from "@/features/expense/components/analytics/AdminExpenseTrackerClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Expense Tracker | InfiniGoal Admin",
  description: "Organization expense overview and statistics",
};

export default function ExpenseTrackerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Expense Tracker</h1>
        <p className="text-slate-500">
          Organization expense overview
        </p>
      </div>

      <AdminExpenseTrackerClient />
    </div>
  );
}

