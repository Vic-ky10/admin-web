"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Camera, User } from "lucide-react";

import LoadingButton from "@/components/feedback/LoadingButton";
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(profileSchema) as any,
    defaultValues: {
      full_name: profile.full_name,
      phone: profile.phone || "",
      avatar_url: profile.avatar_url || "",
      date_of_birth: profile.date_of_birth || "",
      current_address: profile.current_address || "",
      qualification: profile.qualification || "",
      degree: profile.degree || "",
      experience_years: profile.experience_years || undefined,
      emergency_contact: profile.emergency_contact || "",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
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

  function onSubmit(v: unknown) {
    const values = v as ProfileFormData;
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
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header with Avatar and Basic Info */}
      <div className="border-b border-slate-100 bg-slate-50/50 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative shrink-0">
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarPreview}
                alt={profile.full_name}
                className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-sm"
              />
            ) : (
              <span className="inline-flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-slate-100 text-2xl font-bold text-slate-500 shadow-sm">
                {initials || <User className="h-10 w-10 text-slate-400" />}
              </span>
            )}

            <button
              type="button"
              disabled={isBusy}
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 rounded-full bg-slate-900 p-2 text-white shadow-md transition-transform hover:scale-105 disabled:opacity-50"
              title="Upload photo"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">
                {profile.full_name}
              </h2>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${badgeColorClass}`}
              >
                {profile.role}
              </span>
            </div>
            <p className="text-sm text-slate-500">
              {profile.designation || "Staff Member"} • {profile.email}
            </p>
            <div className="flex items-center gap-3 text-xs pt-1">
              <button
                type="button"
                disabled={isBusy}
                onClick={() => fileInputRef.current?.click()}
                className="font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Change Photo
              </button>
              {avatarPreview && (
                <>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={handleRemovePhoto}
                    className="font-semibold text-red-600 hover:text-red-700 transition-colors"
                  >
                    Remove
                  </button>
                </>
              )}
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* details section */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-6 space-y-8"
      >
        <section>
          <h3 className="text-sm font-bold text-slate-900 mb-4">
            Personal Information
          </h3>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Date of Birth</label>
              <input
                type="date"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm h-[42px]"
                {...register("date_of_birth")}
                disabled={isBusy}
              />
              {errors.date_of_birth?.message && <p className="text-xs font-medium text-red-500">{errors.date_of_birth.message}</p>}
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <Input
                label="Current Address"
                error={errors.current_address?.message}
                {...register("current_address")}
                placeholder="Enter full address"
                disabled={isBusy}
              />
            </div>
          </div>
        </section>

        <hr className="border-slate-100" />

        <section>
          <h3 className="text-sm font-bold text-slate-900 mb-4">Professional Details</h3>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              label="Qualification"
              error={errors.qualification?.message}
              {...register("qualification")}
              placeholder="e.g. Master's"
              disabled={isBusy}
            />
            <Input
              label="Degree"
              error={errors.degree?.message}
              {...register("degree")}
              placeholder="e.g. Computer Science"
              disabled={isBusy}
            />
            <Input
              type="number"
              min="0"
              step="0.5"
              label="Experience (Years)"
              error={errors.experience_years?.message}
              {...register("experience_years")}
              placeholder="e.g. 5"
              disabled={isBusy}
            />
          </div>
        </section>

        <hr className="border-slate-100" />

        <section>
          <h3 className="text-sm font-bold text-slate-900 mb-4">Emergency Contact</h3>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              type="tel"
              label="Emergency Contact Number"
              error={errors.emergency_contact?.message}
              {...register("emergency_contact")}
              placeholder="10-digit number"
              disabled={isBusy}
            />
          </div>
        </section>

        <hr className="border-slate-100" />

        <section className="bg-slate-50/50 rounded-xl p-5 border border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 mb-4">
            System Records (Read-Only)
          </h3>
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
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
        </section>

        <div className="flex justify-end pt-4">
          <LoadingButton
            type="submit"
            loading={isBusy}
            className={
              isGreenTheme ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
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
      <p className="text-[13px] text-slate-500 font-semibold">{label}</p>
      <p className="mt-1 font-medium text-slate-900 bg-white border border-slate-200/60 px-3 py-2 rounded-md shadow-sm">
        {value}
      </p>
    </div>
  );
}
