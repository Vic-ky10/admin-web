import { adminClient } from "@/lib/supabase/admin";

interface CreateNotificationParams {
  profileId: string;
  title: string;
  message: string;
  notificationType: string;
  referenceId?: string;
  actionUrl?: string;
  createdBy?: string;
}

interface NotifyAdminsParams {
  title: string;
  message: string;
  notificationType: string;
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

    console.log("Creating notification for:", profileId);
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
    console.log("notifyAdmins called");
    
  const { data, error } = await adminClient
    .from("profiles")
    
    .select("id")
    .eq("role", "Admin");
    console.log("Admins found:", data);

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