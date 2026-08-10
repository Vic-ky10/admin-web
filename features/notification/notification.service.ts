import { adminClient } from "@/lib/supabase/admin";


import { Notification } from "./notification.types";
import { ActionResponse } from "@/types/action";

const NOTIFICATION_SELECT = `
id,
profile_id,
title,
message,
notification_type,
reference_id,
action_url,
is_read,
created_by,
created_at,
updated_at
`;
import { unstable_noStore as noStore } from "next/cache";

export async function getNotifications(  // nnotification table to lateest notifications
  profileId: string
): Promise<Notification[]> {
  noStore();
  const { data, error } = await adminClient
    .from("notifications")
    .select(NOTIFICATION_SELECT)
    .eq("profile_id", profileId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []) as Notification[];
}

export async function markNotificationRead(  // to read to true 
  notificationId: string
): Promise<ActionResponse> {
  const { error } = await adminClient
    .from("notifications")
    .update({
      is_read: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", notificationId);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    message: "Notification marked as read.",
  };
}

export async function markAllNotificationsRead(
  profileId: string
): Promise<ActionResponse> {
  const { error } = await adminClient
    .from("notifications")
    .update({
      is_read: true,
      updated_at: new Date().toISOString(),
    })
    .eq("profile_id", profileId)
    .eq("is_read", false);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    message: "All notifications marked as read.",
  };
}