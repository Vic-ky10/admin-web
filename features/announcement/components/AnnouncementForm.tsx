"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import LoadingButton from "@/components/feedback/LoadingButton";

import {
  Announcement,
  ANNOUNCEMENT_STATUS,
  ANNOUNCEMENT_TYPE,
  TARGET_AUDIENCE,
} from "../announcement.types";

import {
  announcementSchema,
  AnnouncementInput,
} from "../announcement.validation";

import {
  createAnnouncementAction,
  updateAnnouncementAction,
} from "../announcement.action";

interface AnnouncementFormProps {
  open: boolean;
  announcement: Announcement | null;
  onClose: () => void;
}

export default function AnnouncementForm({
  open,
  announcement,
  onClose,
}: AnnouncementFormProps) {
  const {
    register,
    handleSubmit,
    
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AnnouncementInput>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      message: "",
      announcement_type: ANNOUNCEMENT_TYPE.GENERAL,
      target_audience: TARGET_AUDIENCE.EVERYONE,
      department: "",
      attachment_url: "",
      status: ANNOUNCEMENT_STATUS.DRAFT,
      is_pinned: false,
      publish_at: "",
      expires_at: "",
    },
  });

  useEffect(() => {
    if (announcement) {
      reset({
  title: announcement.title,
  message: announcement.message,
  announcement_type: announcement.announcement_type as AnnouncementInput["announcement_type"],
  target_audience: announcement.target_audience as AnnouncementInput["target_audience"],
  department: announcement.department ?? "",
  attachment_url: announcement.attachment_url ?? "",
  status: announcement.status as AnnouncementInput["status"],
  is_pinned: announcement.is_pinned,
  publish_at: announcement.publish_at ?? "",
  expires_at: announcement.expires_at ?? "",
});
    }
  }, [announcement, reset]);

  async function onSubmit(values: AnnouncementInput) {
    const result = announcement
      ? await updateAnnouncementAction(announcement.id, values)
      : await createAnnouncementAction(values);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(result.message);

    reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      title={announcement ? "Edit Announcement" : "New Announcement"}
      onClose={onClose}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <Input
          label="Title"
          {...register("title")}
          error={errors.title?.message}
        />

        <Input
          label="Message"
          {...register("message")}
          error={errors.message?.message}
        />

        <Input
          label="Attachment URL"
          {...register("attachment_url")}
          error={errors.attachment_url?.message}
        />

        <div className="grid grid-cols-2 gap-4">

          <select {...register("announcement_type")}>
            {Object.values(ANNOUNCEMENT_TYPE).map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>

          <select {...register("target_audience")}>
            {Object.values(TARGET_AUDIENCE).map((target) => (
              <option key={target}>{target}</option>
            ))}
          </select>

        </div>


        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("is_pinned")}
          />
          Pin Announcement
        </label>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Publish At"
            type="datetime-local"
            {...register("publish_at")}
          />

          <Input
            label="Expires At"
            type="datetime-local"
            {...register("expires_at")}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>

          <LoadingButton
            type="submit"
            loading={isSubmitting}
          >
            {announcement ? "Update" : "Save Draft"}
          </LoadingButton>
        </div>
      </form>
    </Modal>
  );
}