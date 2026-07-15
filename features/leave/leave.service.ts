import { adminClient } from "@/lib/supabase/admin";
import { ActionResponse } from "@/types/action";
import { getCurrentEmployeeProfile } from "@/features/employee-portal/employee-portal.service";
import {
  createNotification,
  notifyAdmins,
} from "@/features/notification/notification.helper";

import {
  LEAVE_DURATION,
  LEAVE_STATUS,
  LeaveFilters,
  LeaveRequest,
  LeaveRequestWithEmployee,
} from "./leave.types";
import {
  LeaveRequestInput,
  ReviewLeaveInput,
} from "./leave.validation";
import { calculateLeaveDays } from "./leave.utils";

const LEAVE_SELECT =
  "id, profile_id, leave_type, leave_duration, half_day_session, start_date, end_date, total_days, reason, status, reviewed_by, reviewed_at, review_comment, created_at, updated_at";

const LEAVE_WITH_EMPLOYEE_SELECT =
  "id, profile_id, leave_type, leave_duration, half_day_session, start_date, end_date, total_days, reason, status, reviewed_by, reviewed_at, review_comment, created_at, updated_at, employee:profiles!leave_requests_profile_id_fkey(employee_id, full_name, email, department, designation)";

export async function createLeaveRequest(
  profileId: string,
  values: LeaveRequestInput
): Promise<ActionResponse<LeaveRequest>> {
  const totalDays = calculateLeaveDays(values);
  const { data, error } = await adminClient
    .from("leave_requests")
    .insert({
      profile_id: profileId,
      leave_type: values.leave_type,
      leave_duration: values.leave_duration,
      half_day_session:
        values.leave_duration === LEAVE_DURATION.HALF_DAY
          ? values.half_day_session
          : null,
      start_date: values.start_date,
      end_date: values.end_date,
      total_days: totalDays,
      reason: values.reason,
      status: LEAVE_STATUS.PENDING,
    })
    .select(LEAVE_SELECT)
    .single();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  await notifyAdmins({
    title: "New Leave Request",
    message: "A new leave request has been submitted for review.",
    notificationType : "Leave",
    referenceId :  data.id,
    actionUrl : '/leave',
    createdBy: profileId,
  });

  return {
    success: true,
    message: "Leave request submitted successfully.",
    data: data as LeaveRequest,
  };
}

export async function getEmployeeLeaveRequests(
  profileId: string,
  filters: LeaveFilters = {}
): Promise<LeaveRequest[]> {
  let query = adminClient
    .from("leave_requests")
    .select(LEAVE_SELECT)
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return [];
  }

  return data as LeaveRequest[];
}

export async function getLeaveRequests(
  filters: LeaveFilters = {}
): Promise<LeaveRequestWithEmployee[]> {
  let query = adminClient
    .from("leave_requests")
    .select(LEAVE_WITH_EMPLOYEE_SELECT)
    .order("created_at", { ascending: false });

  if (filters.profileId) {
    query = query.eq("profile_id", filters.profileId);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return [];
  }

  return (data as unknown as SupabaseLeaveRecord[]).map((record) => ({
    ...record,
    employee: Array.isArray(record.employee)
      ? record.employee[0] ?? null
      : record.employee,
  }));
}

export async function cancelPendingLeaveRequest(
  profileId: string,
  leaveRequestId: string
): Promise<ActionResponse<LeaveRequest>> {
  const existing = await getLeaveRequestById(leaveRequestId);

  if (!existing || existing.profile_id !== profileId) {
    return {
      success: false,
      error: "Leave request was not found.",
    };
  }

  if (existing.status !== LEAVE_STATUS.PENDING) {
    return {
      success: false,
      error: "Only pending leave requests can be cancelled.",
    };
  }

  const { data, error } = await adminClient
    .from("leave_requests")
    .update({ status: LEAVE_STATUS.CANCELLED })
    .eq("id", leaveRequestId)
    .eq("profile_id", profileId)
    .eq("status", LEAVE_STATUS.PENDING)
    .select(LEAVE_SELECT)
    .single();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    message: "Leave request cancelled successfully.",
    data: data as LeaveRequest,
  };
}

export async function reviewLeaveRequest(
  reviewerId: string,
  values: ReviewLeaveInput
): Promise<ActionResponse<LeaveRequest>> {
  const existing = await getLeaveRequestById(values.leaveRequestId);

  if (!existing) {
    return {
      success: false,
      error: "Leave request was not found.",
    };
  }

  if (existing.status !== LEAVE_STATUS.PENDING) {
    return {
      success: false,
      error: "Only pending leave requests can be reviewed.",
    };
  }

  const { data, error } = await adminClient
    .from("leave_requests")
    .update({
      status: values.status,
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      review_comment: values.review_comment || null,
    })
    .eq("id", values.leaveRequestId)
    .eq("status", LEAVE_STATUS.PENDING)
    .select(LEAVE_SELECT)
    .single();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  await createNotification({
  profileId: existing.profile_id,
  title: "Leave Request Updated",
  message: `Your leave request has been ${values.status.toLowerCase()}.`,
  notificationType: "Leave",
  referenceId: existing.id,
  actionUrl: "/employee/leave",
  createdBy: reviewerId,
});

  return {
    success: true,
    message: `Leave request ${values.status.toLowerCase()} successfully.`,
    data: data as LeaveRequest,
  };
}

export async function getAuthenticatedProfileId() {
  const profile = await getCurrentEmployeeProfile();
  return profile?.id ?? null;
}

async function getLeaveRequestById(id: string) {
  const { data, error } = await adminClient
    .from("leave_requests")
    .select(LEAVE_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data as LeaveRequest | null;
}

// async function notifyAdmins({
//   title,
//   message,
//   notificationType,
//   referenceId,
//   actionUrl,
//   createdBy,
// }: {
//   title: string;
//   message: string;
//   notificationType: string;
//   referenceId?: string;
//   actionUrl?: string;
//   createdBy?: string;
// }) {
//   const { data, error } = await adminClient
//     .from("profiles")
//     .select("id")
//     .eq("role", "Admin");

//   if (error) {
//     console.error(error);
//     return;
//   }

//   await Promise.all(
//     (data ?? []).map((admin) =>
//       createNotification({
//         profileId: admin.id,
//         title,
//         message,
//         notificationType,
//         referenceId,
//         actionUrl,
//         createdBy,
//       })
//     )
//   );
// }

// async function createNotification({
//   profileId,
//   title,
//   message,
//   notificationType,
//   referenceId,
//   actionUrl,
//   createdBy,
// }: {
//   profileId: string;
//   title: string;
//   message: string;
//   notificationType: string;
//   referenceId?: string;
//   actionUrl?: string;
//   createdBy?: string;
// }) {
//   const { error } = await adminClient
//     .from("notifications")
//     .insert({
//       profile_id: profileId,
//       title,
//       message,
//       notification_type: notificationType,
//       reference_id: referenceId ?? null,
//       action_url: actionUrl ?? null,
//       is_read: false,
//       created_by: createdBy ?? null,
//     });

//   if (error) {
//     console.error(error);
//   }
// }

// function isSchemaMismatch(message: string) {
//   return (
//     message.includes("column") ||
//     message.includes("schema cache") ||
//     message.includes("Could not find")
//   );
// }

type SupabaseLeaveRecord = LeaveRequestWithEmployee & {
  employee:
    | LeaveRequestWithEmployee["employee"]
    | NonNullable<LeaveRequestWithEmployee["employee"]>[];
};
