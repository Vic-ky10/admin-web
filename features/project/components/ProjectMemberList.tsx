"use client";

import { UserMinus } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import Button from "@/components/ui/Button";

import { removeProjectMemberAction } from "../project.actions";
import { ProjectMemberWithEmployee } from "../project.types";

interface ProjectMemberListProps {
  members: ProjectMemberWithEmployee[];
  canManage?: boolean;
  onChanged?: () => void;
}

export default function ProjectMemberList({
  members,
  canManage = false,
  onChanged,
}: ProjectMemberListProps) {
  const [isPending, startTransition] = useTransition();

  function handleRemove(memberId: string) {
    startTransition(async () => {
      const result = await removeProjectMemberAction({
        projectMemberId: memberId,
      });

      if (!result.success) {
        toast.error(result.error ?? "Unable to remove employee.");
        return;
      }

      toast.success(result.message ?? "Employee removed.");
      onChanged?.();
    });
  }

  if (members.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
        No employees are assigned to this project.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-semibold text-slate-900">
              {member.employee?.full_name ?? "Unknown employee"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {member.employee?.employee_id ?? member.profile_id} |{" "}
              {member.employee?.department ?? "No department"} |{" "}
              {member.member_role}
            </p>
          </div>

          {canManage && (
            <Button
              type="button"
              variant="danger"
              disabled={isPending}
              onClick={() => handleRemove(member.id)}
              className="inline-flex items-center gap-2 self-start sm:self-auto"
            >
              <UserMinus className="h-4 w-4" />
              Remove
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
