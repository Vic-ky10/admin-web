import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { createNotification, notifyAdmins } from "@/features/notification/notification.helper";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    // 1. Fetch pending scheduled followups
    const { data: followups, error: fError } = await adminClient
      .from("customer_followups")
      .select("id, customer_id, next_followup_date, followup_type, remarks")
      .not("next_followup_date", "is", null);

    if (fError) {
      console.error("Failed to query followups:", fError);
      return NextResponse.json({ success: false, error: fError.message });
    }

    // 2. Fetch customers to identify assignments
    const { data: customers, error: cError } = await adminClient
      .from("customers")
      .select("id, full_name, assigned_employee_id");

    if (cError) {
      console.error("Failed to query customers:", cError);
      return NextResponse.json({ success: false, error: cError.message });
    }

    const recipientIds = Array.from(
      new Set(customers?.map((c) => c.assigned_employee_id).filter(Boolean))
    );

    let profiles: { id: string; role: string; department: string }[] = [];
    if (recipientIds.length > 0) {
      const { data: pData } = await adminClient
        .from("profiles")
        .select("id, role, department")
        .in("id", recipientIds as string[]);
      profiles = pData || [];
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    let createdCount = 0;

    for (const f of followups) {
      if (!f.next_followup_date) continue;
      const nextDateStr = new Date(f.next_followup_date).toISOString().split("T")[0];

      const cust = customers?.find((c) => c.id === f.customer_id);
      if (!cust) continue;

      const recipientId = cust.assigned_employee_id;

      let title = "";
      let message = "";

      if (nextDateStr === todayStr) {
        title = "Follow-Up Reminder: Today";
        message = `Scheduled CRM follow-up with client ${cust.full_name} is scheduled for Today.`;
      } else if (nextDateStr === tomorrowStr) {
        title = "Follow-Up Reminder: Tomorrow";
        message = `Upcoming follow-up interaction with client ${cust.full_name} is coming up Tomorrow.`;
      } else if (nextDateStr < todayStr) {
        title = "Follow-Up Reminder: Overdue";
        message = `Check-in update for client ${cust.full_name} is currently Overdue.`;
      }

      if (title && message) {
        // Notify assigned representative
        if (recipientId) {
          const profile = profiles.find((p) => p.id === recipientId);
          const isAssigneeAdmin =
            (profile?.role === "Admin" || profile?.role === "Super Admin") &&
            profile?.department === "Administration";

          await createNotification({
            profileId: recipientId,
            title,
            message,
            notificationType: "General",
            referenceId: f.id,
            actionUrl: isAssigneeAdmin
              ? `/sales?customerId=${f.customer_id}&followupId=${f.id}`
              : `/employee/sales?customerId=${f.customer_id}&followupId=${f.id}`,
          });
          createdCount++;
        }

        // Notify Admins
        await notifyAdmins({
          title,
          message,
          notificationType: "General",
          referenceId: f.id,
          actionUrl: `/sales?customerId=${f.customer_id}&followupId=${f.id}`,
        });
      }
    }

    return NextResponse.json({ success: true, processed: followups.length, created: createdCount });
  } catch (error: unknown) {
    console.error("Centralized follow-up reminders error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
