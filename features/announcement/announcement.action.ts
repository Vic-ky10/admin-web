"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  publishAnnouncement,
} from "./announcement.service";

import {
  AnnouncementInput,
  UpdateAnnouncementInput,
} from "./announcement.validation";

async function getCurrentUserId() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user.id;
}

export async function createAnnouncementAction(
  values: AnnouncementInput
) {
  const userId = await getCurrentUserId();

  const result = await createAnnouncement(userId, values);

  revalidatePath("/announcements");

  return result;
}

export async function updateAnnouncementAction(
  id: string,
  values: UpdateAnnouncementInput
) {
  const result = await updateAnnouncement(id, values);

  revalidatePath("/announcements");

  return result;
}

export async function deleteAnnouncementAction(
  id: string
) {
  const result = await deleteAnnouncement(id);

  revalidatePath("/announcements");

  return result;
}

export async function publishAnnouncementAction(
  id: string
) {
  const result = await publishAnnouncement(id);

  revalidatePath("/announcements");

  return result;
}