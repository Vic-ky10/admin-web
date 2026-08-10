import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { getNotifications } from "@/features/notification/notification.service";
import EmployeeShell from "@/components/layout/employee/EmployeeShell";
import {
  getCurrentEmployeeProfile,
  getUnreadNotificationCount,
} from "@/features/employee-portal/employee-portal.service";
import RealtimeSync from "@/components/providers/RealtimeSync";

interface EmployeePortalLayoutProps {
  children: ReactNode;
}

export default async function EmployeePortalLayout({
  children,
}: EmployeePortalLayoutProps) {
  const profile = await getCurrentEmployeeProfile();

  if (!profile) {
    redirect("/employee/login");
  }

  if (profile) {
    const isAdminRole = profile.role === "Admin" || profile.role === "Super Admin";
    const isAdministration = profile.department === "Administration";
    if (isAdminRole && isAdministration) {
      redirect("/dashboard");
    }
  }

 const [unreadNotifications, notifications] =
  await Promise.all([
    getUnreadNotificationCount(profile.id),
    getNotifications(profile.id),
  ]);

  return (
    <EmployeeShell
  profile={profile}
  unreadNotifications={unreadNotifications}
  notifications={notifications}
>
      {profile && (
        <RealtimeSync
          profileId={profile.id}
          role={profile.role || "Employee"}
          department={profile.department || ""}
        />
      )}
      {children}
    </EmployeeShell>
  );
}
