import Link from "next/link";

export default function EmployeeLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-8">
      <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Employee Login</h1>
        <p className="mt-2 text-slate-500">
          Use the shared login while the employee portal is in development.
        </p>
        <Link
          href="/login?next=/employee/attendance"
          className="mt-6 inline-flex rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
        >
          Continue to Login
        </Link>
      </div>
    </main>
  );
}
