import Link from "next/link";
import { ShieldCheck, UserRound } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 p-6">
      <div className="w-full max-w-4xl">

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-slate-900">
            InfiniGoal
          </h1>

          <p className="mt-3 text-lg text-slate-600">
            Employee Management System
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Secure portal for administrators and employees.
          </p>
        </div>

       
        <div className="grid gap-8 md:grid-cols-2">

        
          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">

            <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <ShieldCheck className="h-7 w-7" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900">
              Admin Portal
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Manage employees, attendance, leave requests,
              expenses, notifications and system operations.
            </p>

            <Link
              href="/login"
              className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Admin Login
            </Link>

          </section>

          {/* Employee */}
          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">

            <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <UserRound className="h-7 w-7" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900">
              Employee Portal
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Mark attendance, apply leave, submit expenses,
              view projects, announcements and manage your profile.
            </p>

            <Link
              href="/employee/login"
              className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              Employee Login
            </Link>

          </section>

        </div>

        

      </div>
    </main>
  );
}