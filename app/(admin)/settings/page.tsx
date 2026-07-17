import { redirect } from "next/navigation";

import { getCurrentEmployeeProfile } from "@/features/employee-portal/employee-portal.service";
import ProfileForm from "@/features/employee/components/ProfileForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const profile = await getCurrentEmployeeProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-slate-500">
          Manage your administrator profile information.
        </p>
      </div>

      <ProfileForm profile={profile} theme="admin" />
    </div>
  );
}
