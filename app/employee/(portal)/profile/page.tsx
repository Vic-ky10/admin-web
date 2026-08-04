import { redirect } from "next/navigation";
import { getCurrentEmployeeProfile } from "@/features/employee-portal/employee-portal.service";
import ProfileForm from "@/features/employee/components/ProfileForm";
import PageHeader from "@/components/layout/PageHeader";

export const dynamic = "force-dynamic";

export default async function EmployeeProfilePage() {
  const profile = await getCurrentEmployeeProfile();

  if (!profile) {
    redirect("/employee/login");
  }

  return (
    <div className="space-y-6 max-w-[1920px] mx-auto animate-fade-in">
      <PageHeader
        title="My Profile"
        description="View and update your personal details, contact information, and avatar."
        breadcrumbs={[{ label: "Portal", href: "/employee/dashboard" }, { label: "My Profile" }]}
      />

      <ProfileForm profile={profile} theme="employee" />
    </div>
  );
}
