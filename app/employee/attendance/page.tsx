import { redirect } from "next/navigation";

import EmployeeAttendanceClient from "@/features/attendance/components/EmployeeAttendanceClient";
import {
  getAttendanceHistory,
  getCurrentProfileId,
  getTodayAttendance,
} from "@/features/attendance/attendance.service";

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
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold">
            Employee Attendance
          </h1>
          <p className="text-slate-500">
            Mark today&apos;s attendance and review your history.
          </p>
        </div>

        <EmployeeAttendanceClient
          todayAttendance={todayAttendance}
          history={history}
        />
      </div>
    </main>
  );
}
