import Link from "next/link";

const portalGroups = [
  {
    title: "Admin Portal",
    description: "Manage employees and verify attendance records.",
    primary: ["Admin Login", "/login?next=/dashboard"],
    links: [
      ["Dashboard", "/dashboard"],
      ["Employees", "/employees"],
      ["Attendance", "/attendance"],
    ],
  },
  {
    title: "Employee Portal",
    description: "Login as an employee and mark daily attendance.",
    primary: ["Employee Login", "/login?next=/employee/attendance"],
    links: [
      ["Dashboard", "/employee/dashboard"],
      ["Attendance", "/employee/attendance"],
      ["Profile", "/employee/profile"],
    ],
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="text-4xl font-bold">
            InfiniGoal Portal
          </h1>
          <p className="mt-2 text-slate-600">
            Development navigation for admin and employee workflows.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {portalGroups.map((group) => (
            <section
              key={group.title}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >
              <h2 className="text-2xl font-semibold">
                {group.title}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {group.description}
              </p>
              <Link
                href={group.primary[1]}
                className="mt-5 inline-flex w-full justify-center rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700"
              >
                {group.primary[0]}
              </Link>
              <div className="mt-5 grid gap-3">
                {group.links.map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className="rounded-lg border border-slate-200 px-4 py-3 font-medium text-slate-800 hover:border-emerald-500 hover:text-emerald-700"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
