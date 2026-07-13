import Link from "next/link";

export default function EmployeeDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-4xl rounded-xl border bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">Employee Dashboard</h1>
        <p className="mt-2 text-slate-500">
          Employee workflow entry point for development.
        </p>
        <Link
          href="/employee/attendance"
          className="mt-6 inline-flex rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
        >
          Open Attendance
        </Link>
      </div>
    </main>
  );
}
