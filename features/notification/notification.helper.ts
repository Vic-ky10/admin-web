import { adminClient } from "@/lib/supabase/admin";
import { NotificationType } from "./notification.types";

interface CreateNotificationParams {
  profileId: string;
  title: string;
  message: string;
  notificationType: NotificationType;
  referenceId?: string;
  actionUrl?: string;
  createdBy?: string;
}

interface NotifyAdminsParams {
  title: string;
  message: string;
  notificationType: NotificationType;
  referenceId?: string;
  actionUrl?: string;
  createdBy?: string;
}

export async function createNotification({
  profileId,
  title,
  message,
  notificationType,
  referenceId,
  actionUrl,
  createdBy,
}: CreateNotificationParams) {


  if (referenceId) {
    const { data: existing } = await adminClient
      .from("notifications")
      .select("id")
      .eq("profile_id", profileId)
      .eq("notification_type", notificationType)
      .eq("reference_id", referenceId)
      .eq("title", title)
      .limit(1)
      .maybeSingle();

    if (existing) {

      return;
    }
  }

  const { error } = await adminClient
    .from("notifications")
    .insert({
      profile_id: profileId,
      title,
      message,
      notification_type: notificationType,
      reference_id: referenceId ?? null,
      action_url: actionUrl ?? null,
      is_read: false,
      created_by: createdBy ?? null,
    });

 if (error) {
  console.error("Notification Insert Error:", error);
}
}

export async function notifyAdmins({
  title,
  message,
  notificationType,
  referenceId,
  actionUrl,
  createdBy,
}: NotifyAdminsParams) {

    
  const { data, error } = await adminClient
    .from("profiles")
    
    .select("id")
    .eq("role", "Admin");


  if (error) {
    console.error(error);
    return;
  }

  await Promise.all(
    (data ?? []).map((admin) =>
      createNotification({
        profileId: admin.id,
        title,
        message,
        notificationType,
        referenceId,
        actionUrl,
        createdBy,
      })
    )
  );
}