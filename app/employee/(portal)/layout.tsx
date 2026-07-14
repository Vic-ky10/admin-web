import { redirect } from "next/navigation";
import { ReactNode } from "react";

import EmployeeShell from "@/components/layout/employee/EmployeeShell";
import {
  getCurrentEmployeeProfile,
  getUnreadNotificationCount,
} from "@/features/employee-portal/employee-portal.service";

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

  const unreadNotifications = await getUnreadNotificationCount(profile.id);

  return (
    <EmployeeShell
      profile={profile}
      unreadNotifications={unreadNotifications}
    >
      {children}
    </EmployeeShell>
  );
}
