import { redirect } from "next/navigation";
import { getCurrentEmployeeProfile } from "@/features/employee-portal/employee-portal.service";
import ProfileForm from "@/features/employee/components/ProfileForm";
import PageHeader from "@/components/layout/PageHeader";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const profile = await getCurrentEmployeeProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="space-y-6 max-w-[1920px] mx-auto animate-fade-in">
      <PageHeader
        title="Admin Settings"
        description="Manage your administrator profile, credentials, and account settings."
        breadcrumbs={[{ label: "Admin", href: "/dashboard" }, { label: "Settings" }]}
      />

      <ProfileForm profile={profile} theme="admin" />
    </div>
  );
}
