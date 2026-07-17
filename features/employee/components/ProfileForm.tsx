"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Camera, Trash2, User } from "lucide-react";

import LoadingButton from "@/components/feedback/LoadingButton";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { Employee } from "../employee.types";
import { profileSchema, ProfileFormData } from "../employee.validation";
import { updateSelfProfileAction } from "../employee.actions";

interface ProfileFormProps {
  profile: Employee;
  theme: "admin" | "employee";
}

const SUPPORTED_FORMATS = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

export default function ProfileForm({ profile, theme }: ProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile.avatar_url,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const isGreenTheme = theme === "employee";
  const badgeColorClass = isGreenTheme
    ? "bg-green-50 text-green-700 ring-green-600/20"
    : "bg-blue-50 text-blue-700 ring-blue-600/20";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile.full_name,
      phone: profile.phone || "",
      avatar_url: profile.avatar_url || "",
    },
  });

  const watchedAvatarUrl = watch("avatar_url");

  function extractStoragePath(url: string | null): string | null {
    if (!url) return null;
    const marker = "/public/avatars/";
    const idx = url.indexOf(marker);
    return idx !== -1 ? url.substring(idx + marker.length) : null;
  }

  /** remove old avatar files from the user's storage folder. */
  async function removeOldAvatars() {
    const { data: files } = await supabase.storage
      .from("avatars")
      .list(profile.id);

    if (files && files.length > 0) {
      const paths = files.map((f) => `${profile.id}/${f.name}`);
      await supabase.storage.from("avatars").remove(paths);
    }
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!SUPPORTED_FORMATS.includes(file.type)) {
      toast.error("Unsupported format. Please upload JPG, PNG, or WEBP.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 2 MB.");
      return;
    }

    setUploading(true);

    try {
      await removeOldAvatars();

      const fileExt = file.name.split(".").pop()?.toLowerCase() || "png";
      const filePath = `${profile.id}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      setValue("avatar_url", publicUrl);
      setAvatarPreview(publicUrl);
      toast.success("Photo uploaded. Click Save Changes to apply.");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload photo.",
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleRemovePhoto() {
    setUploading(true);
    try {
      // Delete from storage
      if (watchedAvatarUrl) {
        const oldPath = extractStoragePath(watchedAvatarUrl);
        if (oldPath) {
          await supabase.storage.from("avatars").remove([oldPath]);
        }
      }
      setValue("avatar_url", "");
      setAvatarPreview(null);
      toast.success("Photo removed. Click Save Changes to apply.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove photo.");
    } finally {
      setUploading(false);
    }
  }

  function formatDate(date: string) {
    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  }

  function onSubmit(values: ProfileFormData) {
    startTransition(async () => {
      const response = await updateSelfProfileAction(values);

      if (!response.success) {
        toast.error(response.error ?? "Failed to update profile.");
        return;
      }

      toast.success(response.message ?? "Profile updated successfully.");
      router.refresh();
    });
  }

  const initials = profile.full_name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isBusy = isPending || uploading;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center justify-center text-center">
        <div className="relative">
          {avatarPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarPreview}
              alt={profile.full_name}
              className="h-28 w-28 rounded-full border-2 border-slate-200 object-cover shadow-sm"
            />
          ) : (
            <span className="inline-flex h-28 w-28 items-center justify-center rounded-full bg-slate-100 text-3xl font-bold text-slate-500">
              {initials || <User className="h-10 w-10 text-slate-400" />}
            </span>
          )}

          <button
            type="button"
            disabled={isBusy}
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 rounded-full bg-slate-900/80 p-2 text-white shadow-lg transition-colors hover:bg-slate-950 disabled:opacity-50"
            title="Upload photo"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
        />

        <div className="mt-4 space-y-1">
          <h3 className="text-sm font-bold text-slate-900">Profile Photo</h3>
          <p className="text-xs text-slate-500">
            Supports JPG, PNG, WEBP. Max 2 MB.
          </p>
        </div>

        {avatarPreview && (
          <Button
            type="button"
            variant="danger"
            disabled={isBusy}
            onClick={handleRemovePhoto}
            className="mt-4 gap-2 text-sm"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove Photo
          </Button>
        )}
      </div>

      {/* details section */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="lg:col-span-2 rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-6"
      >
        <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-900">
            Personal Information
          </h2>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${badgeColorClass}`}
          >
            {profile.role}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            type="text"
            label="Full Name"
            error={errors.full_name?.message}
            {...register("full_name")}
            disabled={isBusy}
          />

          <Input
            type="tel"
            label="Phone Number"
            error={errors.phone?.message}
            {...register("phone")}
            placeholder="10-digit number"
            disabled={isBusy}
          />
        </div>

        <div className="border-t border-slate-100 pt-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            System Records (Read-Only)
          </h3>

          <div className="grid gap-4 sm:grid-cols-2 text-xs">
            <ReadOnlyField
              label="Employee ID"
              value={profile.employee_id || "N/A"}
            />
            <ReadOnlyField label="Email Address" value={profile.email} />
            <ReadOnlyField
              label="Department"
              value={profile.department || "N/A"}
            />
            <ReadOnlyField
              label="Designation"
              value={profile.designation || "N/A"}
            />
            <ReadOnlyField label="Account Status" value={profile.status} />
            <ReadOnlyField
              label="Joined Date"
              value={
                profile.joined_date ? formatDate(profile.joined_date) : "N/A"
              }
            />
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <LoadingButton
            type="submit"
            loading={isBusy}
            className={
              isGreenTheme ? "bg-green-600 hover:bg-green-700 text-white" : ""
            }
          >
            Save Changes
          </LoadingButton>
        </div>
      </form>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-slate-500 font-medium">{label}</p>
      <p className="mt-1 font-semibold text-slate-900 bg-slate-50 border border-slate-100 px-3 py-2 rounded-md">
        {value}
      </p>
    </div>
  );
}
