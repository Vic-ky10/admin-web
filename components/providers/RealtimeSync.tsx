"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface RealtimeSyncProps {
  profileId: string;
  role: string;
}

interface ProjectMemberRecord {
  id: string;
  project_id: string;
}

export default function RealtimeSync({ profileId, role }: RealtimeSyncProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // For employees: track their project memberships to filter out irrelevant events
  const [userMemberIds, setUserMemberIds] = useState<string[]>([]);
  const [userProjectIds, setUserProjectIds] = useState<string[]>([]);
  const supabase = createClient();

  const fetchUserAssociations = useCallback(async () => {
    if (role === "Admin") return;
    try {
      const { data, error } = await supabase
        .from("project_members")
        .select("id, project_id")
        .eq("profile_id", profileId);

      if (!error && data) {
        const records = data as unknown as ProjectMemberRecord[];
        setUserMemberIds(records.map((m) => m.id));
        setUserProjectIds(records.map((m) => m.project_id));
      }
    } catch (err) {
      console.error("Failed to fetch user associations for realtime filtering:", err);
    }
  }, [profileId, role, supabase]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchUserAssociations();
  }, [fetchUserAssociations]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const triggerRefresh = () => {
      // Prevent duplicate refresh calls if one is already pending
      if (isPending) return;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        startTransition(() => {
          router.refresh();
        });
      }, 100); // 100ms debounce
    };

    // Subscriptions
    const tasksChannel = supabase
      .channel("realtime-tasks-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        (payload: { new: Record<string, unknown> | null; old: Record<string, unknown> | null }) => {
          if (role === "Admin") {
            triggerRefresh();
            return;
          }

          // Employee logic: check if the task belongs to their projects or is assigned to them
          const newRow = payload.new;
          const oldRow = payload.old;
          const affectedMemberId = (newRow?.project_member_id || oldRow?.project_member_id) as string | undefined;
          const affectedProjectId = (newRow?.project_id || oldRow?.project_id) as string | undefined;

          const isRelevant =
            (affectedMemberId && userMemberIds.includes(affectedMemberId)) ||
            (affectedProjectId && userProjectIds.includes(affectedProjectId));

          if (isRelevant) {
            triggerRefresh();
          }
        }
      )
      .subscribe();

    const projectsChannel = supabase
      .channel("realtime-projects-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        (payload: { new: Record<string, unknown> | null; old: Record<string, unknown> | null }) => {
          if (role === "Admin") {
            triggerRefresh();
            return;
          }

          // Employee logic: check if they are part of the changed project
          const affectedProjectId = (payload.new?.id || payload.old?.id) as string | undefined;
          const isRelevant = affectedProjectId && userProjectIds.includes(affectedProjectId);

          if (isRelevant) {
            triggerRefresh();
          }
        }
      )
      .subscribe();

    const projectMembersChannel = supabase
      .channel("realtime-project_members-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "project_members" },
        async (payload: { new: Record<string, unknown> | null; old: Record<string, unknown> | null }) => {
          const newRow = payload.new;
          const oldRow = payload.old;
          const affectedProfileId = (newRow?.profile_id || oldRow?.profile_id) as string | undefined;

          // If the profile assignment changed is for this user
          if (affectedProfileId === profileId) {
            await fetchUserAssociations();
            triggerRefresh();
          } else if (role === "Admin") {
            // Admin sees all membership updates
            triggerRefresh();
          }
        }
      )
      .subscribe();

    const incentivesChannel = supabase
      .channel("realtime-incentives-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "incentives" },
        (payload: { new: Record<string, unknown> | null; old: Record<string, unknown> | null }) => {
          if (role === "Admin") {
            triggerRefresh();
            return;
          }

          // Employee logic: check if the incentive belongs to them
          const newRow = payload.new;
          const oldRow = payload.old;
          const affectedProfileId = (newRow?.profile_id || oldRow?.profile_id) as string | undefined;

          if (affectedProfileId === profileId) {
            triggerRefresh();
          }
        }
      )
      .subscribe();

    const customerPurchasesChannel = supabase
      .channel("realtime-customer_purchases-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "customer_purchases" },
        (payload: { new: Record<string, unknown> | null; old: Record<string, unknown> | null }) => {
          if (role === "Admin") {
            triggerRefresh();
            return;
          }

          const newRow = payload.new;
          const oldRow = payload.old;
          const affectedCreatedBy = (newRow?.created_by || oldRow?.created_by) as string | undefined;

          if (affectedCreatedBy === profileId) {
            triggerRefresh();
          }
        }
      )
      .subscribe();

    const notificationsChannel = supabase
      .channel("realtime-notifications-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        (payload: { new: Record<string, unknown> | null; old: Record<string, unknown> | null }) => {
          if (role === "Admin") {
            triggerRefresh();
            return;
          }

          const newRow = payload.new;
          const oldRow = payload.old;
          const affectedProfileId = (newRow?.profile_id || oldRow?.profile_id) as string | undefined;

          if (affectedProfileId === profileId) {
            triggerRefresh();
          }
        }
      )
      .subscribe();

    const leaveRequestsChannel = supabase
      .channel("realtime-leave_requests-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leave_requests" },
        (payload: { new: Record<string, unknown> | null; old: Record<string, unknown> | null }) => {
          if (role === "Admin") {
            triggerRefresh();
            return;
          }

          const newRow = payload.new;
          const oldRow = payload.old;
          const affectedProfileId = (newRow?.profile_id || oldRow?.profile_id) as string | undefined;

          if (affectedProfileId === profileId) {
            triggerRefresh();
          }
        }
      )
      .subscribe();

    const expensesChannel = supabase
      .channel("realtime-expenses-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expenses" },
        (payload: { new: Record<string, unknown> | null; old: Record<string, unknown> | null }) => {
          if (role === "Admin") {
            triggerRefresh();
            return;
          }

          const newRow = payload.new;
          const oldRow = payload.old;
          const affectedProfileId = (newRow?.profile_id || oldRow?.profile_id) as string | undefined;

          if (affectedProfileId === profileId) {
            triggerRefresh();
          }
        }
      )
      .subscribe();

    const attendanceChannel = supabase
      .channel("realtime-attendance-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "attendance" },
        (payload: { new: Record<string, unknown> | null; old: Record<string, unknown> | null }) => {
          if (role === "Admin") {
            triggerRefresh();
            return;
          }

          const newRow = payload.new;
          const oldRow = payload.old;
          const affectedProfileId = (newRow?.profile_id || oldRow?.profile_id) as string | undefined;

          if (affectedProfileId === profileId) {
            triggerRefresh();
          }
        }
      )
      .subscribe();

    const followupsSyncChannel = supabase
      .channel("realtime-customer_followups-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "customer_followups" },
        () => {
          triggerRefresh();
          fetch("/api/admin/followup-reminders", { method: "POST" }).catch(console.error);
        }
      )
      .subscribe();

    // Trigger initial reminders check on load
    fetch("/api/admin/followup-reminders", { method: "POST" }).catch(console.error);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(projectMembersChannel);
      supabase.removeChannel(incentivesChannel);
      supabase.removeChannel(customerPurchasesChannel);
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(leaveRequestsChannel);
      supabase.removeChannel(expensesChannel);
      supabase.removeChannel(attendanceChannel);
      supabase.removeChannel(followupsSyncChannel);
    };
  }, [router, isPending, userMemberIds, userProjectIds, role, profileId, fetchUserAssociations, supabase]);

  return null;
}
