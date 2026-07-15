"use server";

import { revalidatePath } from "next/cache";

import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "./notification.service";

import { createClient } from "@/lib/supabase/server";

export async function getNotificationsAction() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  return getNotifications(user.id);
}

export async function markNotificationReadAction(
  notificationId: string
) {
  const result =
    await markNotificationRead(notificationId);

  if (result.success) {
    revalidatePath("/");
  }

  return result;
}

export async function markAllNotificationsReadAction() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "User not found.",
    };
  }

  const result =
    await markAllNotificationsRead(user.id);

  if (result.success) {
    revalidatePath("/");
  }

  return result;
}