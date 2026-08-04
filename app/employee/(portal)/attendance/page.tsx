import { redirect } from "next/navigation";
import EmployeeAttendanceClient from "@/features/attendance/components/EmployeeAttendanceClient";
import {
  getAttendanceHistory,
  getCurrentProfileId,
  getTodayAttendance,
} from "@/features/attendance/attendance.service";
import PageHeader from "@/components/layout/PageHeader";

export const dynamic = "force-dynamic";

export default async function EmployeeAttendancePage() {
  const profileId = await getCurrentProfileId();

  if (!profileId) {
    redirect("/employee/login");
  }

  const [todayAttendance, history] = await Promise.all([
    getTodayAttendance(profileId),
    getAttendanceHistory(profileId),
  ]);

  return (
    <div className="space-y-6 max-w-[1920px] mx-auto animate-fade-in">
      <PageHeader
        title="My Attendance"
        description="Clock in for work, check daily status, and review attendance logs."
        breadcrumbs={[{ label: "Portal", href: "/employee/dashboard" }, { label: "Attendance" }]}
      />

      <EmployeeAttendanceClient
        todayAttendance={todayAttendance}
        history={history}
      />
    </div>
  );
}
