import { redirect } from "next/navigation";
import { ReactNode } from "react";

import AdminShell from "@/components/layout/AdminShell";
import { adminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { Employee } from "@/features/employee/employee.types";
import { getNotifications } from "@/features/notification/notification.service";
import RealtimeSync from "@/components/providers/RealtimeSync";

interface LayoutProps {
  children: ReactNode;
}

const PROFILE_SELECT =
  "id, employee_id, full_name, email, phone, department, designation, role, avatar_url, status, is_online, last_login, joined_date, date_of_birth, current_address, qualification, degree, experience_years, emergency_contact, created_at, updated_at";

export default async function AdminLayout({ children }: LayoutProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [profileResponse, notificationsResponse, notifications] = await Promise.all([
    adminClient
      .from("profiles")
      .select(PROFILE_SELECT)
      .eq("id", user.id)
      .maybeSingle(),
    adminClient
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", user.id)
      .eq("is_read", false),
      getNotifications(user.id)
  ]);

  if (profileResponse.error) {
    console.error(profileResponse.error);
  }

  if (notificationsResponse.error) {
    console.error(notificationsResponse.error);
  }

  return (
   <AdminShell
  profile={profileResponse.data as unknown as Employee}
  unreadNotifications={notificationsResponse.count ?? 0}
  notifications={notifications}
>
      {profileResponse.data && (
        <RealtimeSync
          profileId={profileResponse.data.id}
          role={profileResponse.data.role}
        />
      )}
      {children}
    </AdminShell>
  );
}
