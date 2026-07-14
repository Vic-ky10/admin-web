import { redirect } from "next/navigation";

import { getCurrentEmployeeProfile } from "@/features/employee-portal/employee-portal.service";

export const dynamic = "force-dynamic";

export default async function EmployeeProfilePage() {
  const profile = await getCurrentEmployeeProfile();

  if (!profile) {
    redirect("/employee/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-slate-500">
          Your employee information from the authenticated profile.
        </p>
      </div>

      <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
        <ProfileItem label="Full Name" value={profile.full_name} />
        <ProfileItem label="Employee ID" value={profile.employee_id} />
        <ProfileItem label="Email" value={profile.email} />
        <ProfileItem label="Department" value={profile.department} />
        <ProfileItem label="Designation" value={profile.designation} />
        <ProfileItem label="Role" value={profile.role} />
        <ProfileItem label="Status" value={profile.status} />
        <ProfileItem label="Joined Date" value={profile.joined_date} />
      </section>
    </div>
  );
}

function ProfileItem({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">
        {value || "Not available"}
      </p>
    </div>
  );
}
